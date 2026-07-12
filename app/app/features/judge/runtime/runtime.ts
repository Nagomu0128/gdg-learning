// 判定ランタイム(サンドボックス内で実行される。codegen がレッスンごとに esbuild で束ねる — SPEC B §2)。
// 制約: import は lesson-kit の純粋モジュール・../protocol・./constants のみ。
// zod / acorn を判定バンドルに入れないこと(judge-bundle.ts が metafile で検証する)。

import type {
  Check,
  ConsoleEntry,
  CustomCheckContext,
  FileMap,
  LessonDef,
  Verdict,
} from "@codesteps/lesson-kit";
import {
  CHECK_TIMEOUT_MS,
  consoleLinesMatch,
  deepEqualWithNaN,
  defaultMessageFor,
  diagnoseMarkupZenkaku,
  diagnoseTextZenkaku,
  stripCommentsForFile,
  suggestCssProperty,
  textMatches,
} from "@codesteps/lesson-kit";
import { JUDGE_RESULT_KIND } from "../protocol";
import { LOOP_LIMIT_MESSAGE_JP } from "./constants";

type JudgeConfig = { nonce: string; files: FileMap };

/** window.load 待ちの上限。画像等が壊れていても判定タイムアウト(5000ms)内に必ず進む */
const LOAD_WAIT_CAP_MS = 1500;

type SandboxGlobals = {
  __CONSOLE__?: ConsoleEntry[];
  __LOOP_LIMIT_HIT__?: boolean;
};

function sandboxGlobals(): SandboxGlobals {
  return globalThis as unknown as SandboxGlobals;
}

/** コンソールフック(composer が注入)が捕捉したエントリ。フックが無い環境では空 */
function capturedConsole(): ConsoleEntry[] {
  return sandboxGlobals().__CONSOLE__ ?? [];
}

function hasDom(): boolean {
  return typeof document !== "undefined";
}

function buildCustomContext(cfg: JudgeConfig): CustomCheckContext {
  return {
    document,
    window: window as Window & typeof globalThis,
    fire: (selector: string, event: string): void => {
      const el = document.querySelector(selector);
      if (el === null) throw new Error(`fire: 要素が見つかりません: ${selector}`);
      const ev =
        event === "click"
          ? new MouseEvent("click", { bubbles: true, cancelable: true })
          : new Event(event, { bubbles: true });
      el.dispatchEvent(ev);
    },
    wait: (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms)),
    console: capturedConsole(),
    // 提出ファイルの原文(hidden 含む)。git-sim 等、原文を要する custom check 用(L-runtime)
    files: cfg.files,
  };
}

/** check 評価(CONTRACTS §3.4)。throw / reject は evaluateWithTimeout が不合格に落とす。export はテスト用 */
export async function evaluateCheck(check: Check, cfg: JudgeConfig): Promise<boolean> {
  switch (check.type) {
    case "element": {
      if (!hasDom()) return false;
      const count = document.querySelectorAll(check.selector).length;
      return check.count !== undefined ? count === check.count : count >= 1;
    }
    case "text": {
      if (!hasDom()) return false;
      const el = document.querySelector(check.selector);
      if (el === null) return false;
      return textMatches(el.textContent ?? "", check);
    }
    case "attribute": {
      if (!hasDom()) return false;
      const el = document.querySelector(check.selector);
      if (el === null) return false;
      const value = el.getAttribute(check.name);
      if (check.exists !== undefined && (value !== null) !== check.exists) return false;
      if (check.equals !== undefined && (value === null || value.trim() !== check.equals)) return false;
      return true;
    }
    case "style": {
      // 期待値をプローブ要素で computed に解決してから比較する(§5.3 canonicalization)
      if (!hasDom()) return false;
      const el = document.querySelector(check.selector);
      if (el === null) return false;
      const actual = getComputedStyle(el).getPropertyValue(check.property);
      const probe = document.createElement("div");
      document.body.appendChild(probe);
      let expected = "";
      try {
        // border-*-width / outline-width は style が none だと computed が 0px に潰れるため、
        // プローブには対応する style を先に立てて幅を解決させる
        const widthProp = /^(border-(?:top|right|bottom|left)|outline|column-rule)-width$/.exec(
          check.property,
        );
        if (widthProp !== null) {
          probe.style.setProperty(`${widthProp[1]}-style`, "solid");
        }
        probe.style.setProperty(check.property, check.equals);
        expected = getComputedStyle(probe).getPropertyValue(check.property);
      } finally {
        probe.remove();
      }
      return expected !== "" && actual === expected;
    }
    case "source": {
      const content = cfg.files[check.file];
      if (content === undefined) return false;
      // ignoreComments: コメント内のサンプルコードへの誤マッチを防ぐ(J-judge-hardening)
      const subject = check.ignoreComments === true ? stripCommentsForFile(check.file, content) : content;
      return new RegExp(check.pattern, check.flags).test(subject);
    }
    case "console": {
      const lines = capturedConsole()
        .filter((e) => e.level === "log" || e.level === "info")
        .map((e) => e.text);
      return consoleLinesMatch(lines, check.lines, check.ordered === true);
    }
    case "fn": {
      // 教材規約: fn 対象は function 宣言(worker では try ブロック内でも Annex B で global に昇格する)
      const fn = (globalThis as unknown as Record<string, unknown>)[check.name];
      if (typeof fn !== "function") return false;
      const result = await Promise.resolve((fn as (...args: unknown[]) => unknown)(...check.args));
      return deepEqualWithNaN(result, check.returns);
    }
    case "custom": {
      if (!hasDom()) return false;
      const result = await check.run(buildCustomContext(cfg));
      return Boolean(result);
    }
  }
}

function firstHtmlSource(files: FileMap): string | null {
  for (const name of Object.keys(files)) {
    if (name.toLowerCase().endsWith(".html")) return files[name] ?? null;
  }
  return null;
}

/** element / attribute / style の失敗時のみ、該当ソースへ全角診断をかける(§5.4) */
function zenkakuSwappedMessage(check: Check, files: FileMap): string | null {
  let sources: string[] = [];
  if (check.type === "element" || check.type === "attribute") {
    const html = firstHtmlSource(files);
    if (html !== null) sources = [html];
  } else if (check.type === "style") {
    const names = Object.keys(files);
    const css = names.filter((n) => n.toLowerCase().endsWith(".css"));
    const html = names.filter((n) => n.toLowerCase().endsWith(".html"));
    sources = [...css, ...html].map((n) => files[n] ?? "");
  } else {
    return null;
  }
  for (const source of sources) {
    const diag = diagnoseMarkupZenkaku(source);
    if (diag !== null) return diag.message;
  }
  return null;
}

/**
 * style check 失敗時のみ: 期待プロパティのタイポ(編集距離 <= 2)が CSS 内に書かれていたら指摘する。
 * 提案が失敗した check の property と一致するときだけ発火するため偽陽性がない(症状駆動 — §5.4)。
 */
function cssTypoSwappedMessage(check: Check, files: FileMap): string | null {
  if (check.type !== "style") return null;
  const cssSources = Object.keys(files)
    .filter((n) => n.toLowerCase().endsWith(".css"))
    .map((n) => files[n] ?? "");
  for (const source of cssSources) {
    for (const m of source.matchAll(/(?<![\w-])([a-zA-Z][a-zA-Z-]{1,30})\s*:/g)) {
      const written = (m[1] ?? "").toLowerCase();
      if (written === check.property) continue;
      if (suggestCssProperty(written) === check.property) {
        const line = source.slice(0, m.index ?? 0).split("\n").length;
        return `${line}行目の「${written}」は「${check.property}」の書き間違いかもしれません`;
      }
    }
  }
  return null;
}

/**
 * text check 失敗時のみ: 表示テキストの全角英数字・記号が原因なら指摘する(§5.4 と同じ症状駆動)。
 * 半角化すると check が合格するときだけ発火するため偽陽性がない。
 */
function textZenkakuSwappedMessage(check: Check): string | null {
  if (check.type !== "text" || !hasDom()) return null;
  try {
    const el = document.querySelector(check.selector);
    if (el === null) return null;
    return diagnoseTextZenkaku(el.textContent ?? "", check);
  } catch {
    return null;
  }
}

/**
 * 1 check あたりの評価上限(J-judge-hardening)。解決しない Promise を返す fn / custom check が
 * 判定全体タイムアウト(dom 5000ms / worker 2000ms)まで巻き込むのを防ぎ、
 * タイムアウトした check は不合格として後続の評価を続行する(Verdict.details の完全性)。
 */
function evaluateWithTimeout(check: Check, cfg: JudgeConfig): Promise<boolean> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), CHECK_TIMEOUT_MS);
    evaluateCheck(check, cfg).then(
      (passed) => {
        clearTimeout(timer);
        resolve(passed);
      },
      () => {
        // throw は不合格(CONTRACTS §3.4)。タイムアウト後に遅れて reject しても未処理拒否にしない
        clearTimeout(timer);
        resolve(false);
      },
    );
  });
}

/** 全 check を上から評価(失敗後も全件継続 — §5.1)。表示は最初の失敗 1 件。export はテスト用 */
export async function runChecks(def: LessonDef, cfg: JudgeConfig): Promise<Verdict> {
  const details: { checkId: string; passed: boolean }[] = [];
  let display: { checkId: string; message: string } | null = null;
  for (const check of def.checks) {
    const passed = await evaluateWithTimeout(check, cfg);
    details.push({ checkId: check.id, passed });
    if (!passed && display === null) {
      const message =
        zenkakuSwappedMessage(check, cfg.files) ??
        cssTypoSwappedMessage(check, cfg.files) ??
        textZenkakuSwappedMessage(check) ??
        check.message ??
        defaultMessageFor(check);
      display = { checkId: check.id, message };
    }
  }
  // ループ保護超過が捕捉されていたら、失敗表示を専用メッセージに差し替える(SPEC B §3)
  if (display !== null && sandboxGlobals().__LOOP_LIMIT_HIT__ === true) {
    display = { checkId: display.checkId, message: LOOP_LIMIT_MESSAGE_JP };
  }
  return {
    passed: display === null,
    display,
    details,
    console: capturedConsole().slice(),
    timedOut: false,
  };
}

function errorVerdict(): Verdict {
  return {
    passed: false,
    display: { checkId: "__error__", message: "判定中にエラーが発生しました。もう一度お試しください" },
    details: [],
    console: capturedConsole().slice(),
    timedOut: false,
  };
}

/** rAF が回らない環境(スロットリング等)でも先へ進むための上限 */
const RENDER_SETTLE_CAP_MS = 150;
/** フレーム確定後にスケジューラ(React 18 の初期 render 等)を流しきる微小待ち */
const RENDER_SETTLE_TAIL_MS = 30;

/**
 * load 後の描画確定待ち(L-runtime): React 18 の初期 render は非同期スケジュール
 * されるため、ダブル requestAnimationFrame + 微小待ちを挟んでから check を評価する。
 * 判定 iframe は非表示位置にあり rAF が throttle され得るため、上限付きで必ず進む。
 */
function afterRenderSettled(): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = (): void => {
      if (done) return;
      done = true;
      clearTimeout(cap);
      setTimeout(resolve, RENDER_SETTLE_TAIL_MS);
    };
    const cap = setTimeout(finish, RENDER_SETTLE_CAP_MS);
    try {
      requestAnimationFrame(() => requestAnimationFrame(finish));
    } catch {
      // rAF が無い環境は cap 側で進む
    }
  });
}

/** DOM 判定は document の load(画像等)を上限付きで待ち、描画確定後に評価する */
function whenDocumentSettled(): Promise<void> {
  if (!hasDom()) return Promise.resolve();
  if (document.readyState === "complete") return afterRenderSettled();
  return new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, LOAD_WAIT_CAP_MS);
    window.addEventListener(
      "load",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  }).then(afterRenderSettled);
}

/**
 * 判定バンドルのエントリ(CONTRACTS §3.3)。
 * `globalThis.__JUDGE__ = { start(cfg), startWorker(cfg) }` を定義し、
 * 結果は 1 回だけ postMessage する(送信済みフラグ)。
 */
export function createJudgeRuntime(def: LessonDef): void {
  let sent = false;
  const send = (post: (msg: unknown) => void, nonce: string, verdict: Verdict): void => {
    if (sent) return;
    sent = true;
    post({ kind: JUDGE_RESULT_KIND, nonce, verdict });
  };

  const judgeApi = {
    start(cfg: JudgeConfig): void {
      void whenDocumentSettled()
        .then(() => runChecks(def, cfg))
        .catch(() => errorVerdict())
        .then((verdict) => {
          send((msg) => window.parent.postMessage(msg, "*"), cfg.nonce, verdict);
        });
    },
    startWorker(cfg: JudgeConfig): void {
      void runChecks(def, cfg)
        .catch(() => errorVerdict())
        .then((verdict) => {
          send(
            (msg) => (globalThis as unknown as { postMessage: (m: unknown) => void }).postMessage(msg),
            cfg.nonce,
            verdict,
          );
        });
    },
  };

  (globalThis as unknown as { __JUDGE__: unknown }).__JUDGE__ = judgeApi;
}
