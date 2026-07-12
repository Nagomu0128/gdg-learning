// TS / TSX / JSX パイプライン(sucrase → instrumentLoops → インライン化)の統合テスト(L-runtime)。
import type { FileMap } from "@codesteps/lesson-kit";
import { beforeAll, describe, expect, it } from "vitest";
import { composeDocument } from "./composer";
import { loadTranspiler, type Transpiler } from "./transpile";
import { buildWorkerSource } from "./worker-runner";

const ORIGIN = "https://example.test";

let transpile: Transpiler;

beforeAll(async () => {
  transpile = await loadTranspiler();
});

function compose(files: FileMap, mode: "preview" | "judge" = "preview") {
  return composeDocument({
    files,
    lessonSlug: "demo-01",
    origin: ORIGIN,
    nonce: "test-nonce",
    mode,
    judgeBundle: mode === "judge" ? "/*bundle*/" : undefined,
    transpile,
  });
}

describe("composeDocument × TS/JSX", () => {
  const tsxFiles: FileMap = {
    "index.html": `<!doctype html>
<html><head><title>t</title></head><body>
<div id="root"></div>
<script src="app.jsx"></script>
</body></html>
`,
    "app.jsx": "function Hello() { return <h1>やあ</h1>; }\nconsole.log(<Hello />);",
  };

  /** 実行されるインライン script の中身(コンソールフックと __FILES__ データ注入を除く) */
  function userScriptBodies(html: string): string[] {
    return [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)]
      .map((m) => m[1] ?? "")
      .filter((body) => !body.includes("__CONSOLE__") && !body.trimStart().startsWith("globalThis.__FILES__"));
  }

  it("script src の .jsx を変換してインライン化する(実行コードに JSX 原文は残らない)", () => {
    const { html, jsSyntaxError } = compose(tsxFiles);
    expect(jsSyntaxError).toBeNull();
    const scripts = userScriptBodies(html).join("\n");
    expect(scripts).toContain("React.createElement");
    expect(scripts).not.toContain("<h1>やあ</h1>"); // 実行コードは変換後のみ
    expect(html).not.toMatch(/<script[^>]*src="app\.jsx"/i);
  });

  it("TS の構文エラーは jsSyntaxError になり JS を注入しない", () => {
    const files: FileMap = {
      "index.html": '<script src="main.ts"></script>',
      "main.ts": "let a: string = ;",
    };
    const { html, jsSyntaxError } = compose(files);
    expect(jsSyntaxError).not.toBeNull();
    expect(jsSyntaxError?.message).toContain("1行目");
    // 実行対象のスクリプトとしては注入されない(__FILES__ の不活性データは対象外)
    expect(userScriptBodies(html).join("\n")).not.toContain("let a");
  });

  it("変換後のコードにもループ保護がかかる", () => {
    const files: FileMap = {
      "index.html": '<script src="main.ts"></script>',
      "main.ts": "while (true) { const n: number = 1; }",
    };
    const { html, jsSyntaxError } = compose(files);
    expect(jsSyntaxError).toBeNull();
    expect(html).toContain("__LOOP_LIMIT_EXCEEDED__");
  });

  it("transpile 未指定で TS ファイルがあると throw する(実装ミスの早期検出)", () => {
    expect(() =>
      composeDocument({
        files: { "main.ts": "let a = 1;" },
        lessonSlug: "demo-01",
        origin: ORIGIN,
        nonce: "n",
        mode: "preview",
      }),
    ).toThrow(/transpile/);
  });

  it("CSP は script-src に自オリジンを含む(vendor 用)。外部オリジンは含まない", () => {
    const { html } = compose(tsxFiles);
    expect(html).toContain(`script-src 'unsafe-inline' ${ORIGIN}`);
    expect(html).toContain("default-src 'none'");
  });

  it("preview モードは __FILES__ を注入し、judge モードは注入しない(files は start(cfg) 経由)", () => {
    const files: FileMap = { "index.html": "<p>a</p>", "commands.sh": 'echo "hi" > f.txt' };
    const preview = compose(files, "preview");
    expect(preview.html).toContain("globalThis.__FILES__");
    expect(preview.html).toContain("echo");
    const judge = compose(files, "judge");
    expect(judge.html).not.toContain("globalThis.__FILES__");
  });

  it("__FILES__ の JSON は < をエスケープする(閉じタグ注入防止)", () => {
    const files: FileMap = { "index.html": "<p>a</p>", "memo.txt": "</script><script>alert(1)</script>" };
    const preview = compose(files, "preview");
    const injected = preview.html.slice(preview.html.indexOf("__FILES__"));
    expect(injected).not.toContain("</script><script>alert(1)");
  });
});

describe("buildWorkerSource × TS", () => {
  it(".ts を変換してから組み立てる", () => {
    const built = buildWorkerSource({
      files: { "script.ts": 'function greet(name: string): string { return "hi " + name; }' },
      judgeBundle: null,
      nonce: "n",
      relayConsole: false,
      transpile,
    });
    expect(built.syntaxError).toBeNull();
    expect(built.source).toContain("function greet(name)");
    expect(built.source).not.toContain(": string");
  });

  it("TS 構文エラーは syntaxError として返る", () => {
    const built = buildWorkerSource({
      files: { "script.ts": "let a = ;\n" },
      judgeBundle: null,
      nonce: "n",
      relayConsole: false,
      transpile,
    });
    expect(built.syntaxError).not.toBeNull();
    expect(built.syntaxError?.message).toContain("1行目");
  });

  it("transpile 未指定で TS ファイルがあると throw する", () => {
    expect(() =>
      buildWorkerSource({
        files: { "script.ts": "let a = 1;" },
        judgeBundle: null,
        nonce: "n",
        relayConsole: false,
      }),
    ).toThrow(/transpile/);
  });
});
