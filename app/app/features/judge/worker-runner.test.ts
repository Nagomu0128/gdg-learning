import type { FileMap } from "@codesteps/lesson-kit";
import { describe, expect, it } from "vitest";
import { buildWorkerSource } from "./worker-runner";

describe("buildWorkerSource", () => {
  const files: FileMap = { "script.js": 'function add(a, b) { return a + b; }\nconsole.log("hello");' };

  it("構成順序: コンソールフック → try{ユーザーJS} → 判定バンドル → startWorker(CONTRACTS §3.3)", () => {
    const { source, syntaxError } = buildWorkerSource({
      files,
      judgeBundle: "/*BUNDLE_MARKER*/",
      nonce: "n1",
      relayConsole: true,
    });
    expect(syntaxError).toBeNull();
    const hook = source.indexOf("__CONSOLE__");
    const tryOpen = source.indexOf("try {");
    const user = source.indexOf("function add");
    const catchBlock = source.indexOf("__CAPTURE_ERROR__(e)");
    const bundle = source.indexOf("/*BUNDLE_MARKER*/");
    const bootstrap = source.indexOf("__JUDGE__.startWorker(");
    expect(hook).toBeGreaterThan(-1);
    expect(hook).toBeLessThan(tryOpen);
    expect(tryOpen).toBeLessThan(user);
    expect(user).toBeLessThan(catchBlock);
    expect(catchBlock).toBeLessThan(bundle);
    expect(bundle).toBeLessThan(bootstrap);
    expect(source).toContain('nonce: "n1"');
  });

  it("ループ保護をユーザー JS に適用する", () => {
    const { source } = buildWorkerSource({
      files: { "script.js": "while (true) {}" },
      judgeBundle: "/*b*/",
      nonce: "n",
      relayConsole: false,
    });
    expect(source).toContain("__lc0");
    expect(source).toContain("__LOOP_LIMIT_EXCEEDED__");
  });

  it("構文エラーは syntaxError として返す(Worker は起動されない)", () => {
    const { source, syntaxError } = buildWorkerSource({
      files: { "script.js": "const = 1;" },
      judgeBundle: "/*b*/",
      nonce: "n",
      relayConsole: false,
    });
    expect(source).toBe("");
    expect(syntaxError).not.toBeNull();
    expect(syntaxError?.line).toBe(1);
  });

  it("judgeBundle が null のとき(runWorkerConsole 用)は完了通知で終わる", () => {
    const { source } = buildWorkerSource({ files, judgeBundle: null, nonce: "n2", relayConsole: true });
    expect(source).toContain('kind: "preview:console-done"');
    expect(source).not.toContain("__JUDGE__");
  });

  it(".js 以外のファイルは無視する", () => {
    const { source } = buildWorkerSource({
      files: { "readme.md": "# x", "script.js": "console.log(1);" },
      judgeBundle: null,
      nonce: "n3",
      relayConsole: false,
    });
    expect(source).toContain("console.log(1);");
    expect(source).not.toContain("# x");
  });
});
