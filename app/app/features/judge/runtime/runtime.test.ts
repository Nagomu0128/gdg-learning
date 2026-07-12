// runtime の check 評価まわりのテスト(node 環境 — DOM 系 check は E2E ステージ2が担う)。
// per-check タイムアウト(J-judge-hardening)と source ignoreComments を検証する。

import type { ConsoleEntry, LessonDef } from "@codesteps/lesson-kit";
import { CHECK_TIMEOUT_MS } from "@codesteps/lesson-kit";
import { afterEach, describe, expect, it, vi } from "vitest";
import { evaluateCheck, runChecks } from "./runtime";

type TestGlobals = Record<string, unknown> & { __CONSOLE__?: ConsoleEntry[] };
const g = globalThis as TestGlobals;

function lessonWith(checks: LessonDef["checks"]): LessonDef {
  return {
    slug: "test-lesson",
    title: "テスト",
    files: { "script.js": { initial: "" } },
    checks,
    hints: ["hint"],
    solution: { "script.js": "" },
  };
}

const registered: string[] = [];
function registerFn(name: string, fn: (...args: unknown[]) => unknown): void {
  g[name] = fn;
  registered.push(name);
}

afterEach(() => {
  for (const name of registered.splice(0)) {
    delete g[name];
  }
  delete g.__CONSOLE__;
  vi.useRealTimers();
});

describe("per-check タイムアウト(CHECK_TIMEOUT_MS)", () => {
  it("解決しない Promise を返す fn check は上限で不合格になり、後続 check の評価を続行する", async () => {
    vi.useFakeTimers();
    registerFn("hangs", () => new Promise(() => {}));
    registerFn("works", () => 42);
    const def = lessonWith([
      { id: "hang-check", type: "fn", name: "hangs", args: [], returns: 1 },
      { id: "ok-check", type: "fn", name: "works", args: [], returns: 42 },
    ]);
    const promise = runChecks(def, { nonce: "n", files: {} });
    await vi.advanceTimersByTimeAsync(CHECK_TIMEOUT_MS + 50);
    const verdict = await promise;
    // details の完全性: ハングした check の後続も評価されている
    expect(verdict.details).toEqual([
      { checkId: "hang-check", passed: false },
      { checkId: "ok-check", passed: true },
    ]);
    expect(verdict.passed).toBe(false);
    expect(verdict.display?.checkId).toBe("hang-check");
    expect(verdict.timedOut).toBe(false);
  });

  it("タイムアウトした check の表示メッセージは通常の失敗と同じ(check.message 優先)", async () => {
    vi.useFakeTimers();
    registerFn("hangs2", () => new Promise(() => {}));
    const def = lessonWith([
      { id: "hang", type: "fn", name: "hangs2", args: [], returns: 1, message: "計算を完成させましょう" },
    ]);
    const promise = runChecks(def, { nonce: "n", files: {} });
    await vi.advanceTimersByTimeAsync(CHECK_TIMEOUT_MS + 50);
    const verdict = await promise;
    expect(verdict.display?.message).toBe("計算を完成させましょう");
  });

  it("上限内に解決する非同期 fn check は正常に合格する", async () => {
    registerFn("slowOk", () => new Promise((resolve) => setTimeout(() => resolve("done"), 20)));
    const def = lessonWith([{ id: "slow", type: "fn", name: "slowOk", args: [], returns: "done" }]);
    const verdict = await runChecks(def, { nonce: "n", files: {} });
    expect(verdict.passed).toBe(true);
  });

  it("タイムアウト後に遅れて reject しても未処理拒否にならない", async () => {
    vi.useFakeTimers();
    let rejectLater: ((e: Error) => void) | null = null;
    registerFn(
      "lateReject",
      () =>
        new Promise((_, reject) => {
          rejectLater = reject;
        }),
    );
    const def = lessonWith([{ id: "late", type: "fn", name: "lateReject", args: [], returns: 1 }]);
    const promise = runChecks(def, { nonce: "n", files: {} });
    await vi.advanceTimersByTimeAsync(CHECK_TIMEOUT_MS + 50);
    const verdict = await promise;
    expect(verdict.details).toEqual([{ checkId: "late", passed: false }]);
    // 遅延 reject(未処理拒否ならここで vitest が落ちる)
    (rejectLater as unknown as (e: Error) => void)(new Error("late"));
    await vi.advanceTimersByTimeAsync(10);
  });
});

describe("check の throw / 異常値への耐性", () => {
  it("fn check が throw しても不合格に落ちて全件評価が続く", async () => {
    registerFn("throws", () => {
      throw new Error("boom");
    });
    registerFn("fine", () => 1);
    const def = lessonWith([
      { id: "t", type: "fn", name: "throws", args: [], returns: 1 },
      { id: "f", type: "fn", name: "fine", args: [], returns: 1 },
    ]);
    const verdict = await runChecks(def, { nonce: "n", files: {} });
    expect(verdict.details).toEqual([
      { checkId: "t", passed: false },
      { checkId: "f", passed: true },
    ]);
  });

  it("fn check が循環参照を返しても判定エンジンは落ちない", async () => {
    registerFn("cyclic", () => {
      const o: Record<string, unknown> = { v: 1 };
      o.self = o;
      return o;
    });
    const def = lessonWith([
      { id: "cy", type: "fn", name: "cyclic", args: [], returns: { v: 1, self: null } },
    ]);
    const verdict = await runChecks(def, { nonce: "n", files: {} });
    expect(verdict.passed).toBe(false);
    expect(verdict.details).toEqual([{ checkId: "cy", passed: false }]);
  });

  it("fn check の -0 と 0 は等しい(Math.round(-0.4) 対策)", async () => {
    registerFn("negZero", () => Math.round(-0.4));
    const def = lessonWith([{ id: "nz", type: "fn", name: "negZero", args: [], returns: 0 }]);
    const verdict = await runChecks(def, { nonce: "n", files: {} });
    expect(verdict.passed).toBe(true);
  });
});

describe("source check の ignoreComments", () => {
  const jsWithCommentHint = '// ここに console.log("hello") と書こう\nlet x = 1;\n';

  it("既定(ignoreComments なし)はコメント内にもマッチする(後方互換)", async () => {
    const passed = await evaluateCheck(
      { id: "s", type: "source", file: "script.js", pattern: "console\\.log" },
      { nonce: "n", files: { "script.js": jsWithCommentHint } },
    );
    expect(passed).toBe(true);
  });

  it("ignoreComments:true はコメント内のマッチを無視する", async () => {
    const passed = await evaluateCheck(
      { id: "s", type: "source", file: "script.js", pattern: "console\\.log", ignoreComments: true },
      { nonce: "n", files: { "script.js": jsWithCommentHint } },
    );
    expect(passed).toBe(false);
  });

  it("ignoreComments:true でもコメント外のコードにはマッチする", async () => {
    const passed = await evaluateCheck(
      { id: "s", type: "source", file: "script.js", pattern: "console\\.log", ignoreComments: true },
      { nonce: "n", files: { "script.js": `${jsWithCommentHint}console.log("hi");\n` } },
    );
    expect(passed).toBe(true);
  });

  it("HTML コメント内のタグにもマッチしない", async () => {
    const passed = await evaluateCheck(
      { id: "s", type: "source", file: "index.html", pattern: "<title>", flags: "i", ignoreComments: true },
      { nonce: "n", files: { "index.html": "<head><!-- <title>題名</title> を書こう --></head>" } },
    );
    expect(passed).toBe(false);
  });

  it("CSS コメント内の宣言にもマッチしない", async () => {
    const passed = await evaluateCheck(
      { id: "s", type: "source", file: "style.css", pattern: "color\\s*:\\s*red", ignoreComments: true },
      { nonce: "n", files: { "style.css": "h1 { /* color: red; と書こう */ }" } },
    );
    expect(passed).toBe(false);
  });

  it("file が files に無ければ不合格", async () => {
    const passed = await evaluateCheck(
      { id: "s", type: "source", file: "missing.js", pattern: "x", ignoreComments: true },
      { nonce: "n", files: {} },
    );
    expect(passed).toBe(false);
  });
});

describe("console check(node 環境での評価)", () => {
  it("__CONSOLE__ の log/info のみを照合対象にする", async () => {
    g.__CONSOLE__ = [
      { level: "log", text: "hello" },
      { level: "error", text: "boom" },
      { level: "info", text: "world" },
    ];
    const def = lessonWith([{ id: "c", type: "console", lines: ["hello", "world"], ordered: true }]);
    const verdict = await runChecks(def, { nonce: "n", files: {} });
    expect(verdict.passed).toBe(true);
  });
});
