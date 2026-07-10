import type { FileMap } from "@codesteps/lesson-kit";
import { describe, expect, it } from "vitest";
import { composeDocument, escapeInlineScript, escapeJsonForScript } from "./composer";

const ORIGIN = "https://example.test";

const domFiles: FileMap = {
  "index.html": `<!doctype html>
<html>
  <head>
    <title>demo</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>デモ</h1>
    <script src="script.js"></script>
  </body>
</html>
`,
  "style.css": "h1 { color: red; }",
  "script.js": 'console.log("hi");',
};

function compose(files: FileMap, mode: "preview" | "judge" = "preview", judgeBundle?: string) {
  return composeDocument({
    files,
    lessonSlug: "demo-01",
    origin: ORIGIN,
    nonce: "test-nonce",
    mode,
    judgeBundle,
  });
}

describe("composeDocument", () => {
  it("link/script を files の中身でインライン化する", () => {
    const { html, jsSyntaxError } = compose(domFiles);
    expect(jsSyntaxError).toBeNull();
    expect(html).toContain("h1 { color: red; }");
    expect(html).toContain('console.log("hi");');
    expect(html).not.toContain("<link");
    expect(html).not.toContain("src=");
  });

  it("注入順序は CSP → <base> → コンソールフック(CONTRACTS §3.3)", () => {
    const { html } = compose(domFiles);
    const csp = html.indexOf("Content-Security-Policy");
    const base = html.indexOf("<base href=");
    const hook = html.indexOf("__CONSOLE__");
    const user = html.indexOf("h1 { color: red; }");
    expect(csp).toBeGreaterThan(-1);
    expect(csp).toBeLessThan(base);
    expect(base).toBeLessThan(hook);
    expect(hook).toBeLessThan(user);
    // ヘッダは <head> の内側(doctype の前に置くと quirks mode になる)
    expect(html.indexOf("<head>")).toBeLessThan(csp);
    expect(html).toContain(`<base href="${ORIGIN}/lesson-assets/demo-01/">`);
    expect(html).toContain(`img-src data: ${ORIGIN}`);
  });

  it("preview はコンソール中継あり、judge は中継なし", () => {
    expect(compose(domFiles, "preview").html).toContain("var relay = true;");
    expect(compose(domFiles, "judge", "/*bundle*/").html).toContain("var relay = false;");
  });

  it("judge モードは判定バンドル + bootstrap を <head>(ユーザー本文より前)に注入する [フェイルセーフ]", () => {
    // 本文より後ろに注入すると、壊れた終了タグ(`</a,` 等)が <script> 開始タグごと
    // トークナイザに食われて判定が実行されず、タイムアウトに化ける(2026-07-10 実地報告)
    const { html } = compose(domFiles, "judge", "/*BUNDLE_MARKER*/");
    const bundle = html.indexOf("/*BUNDLE_MARKER*/");
    const bootstrap = html.indexOf("__JUDGE__.start(");
    const consoleHook = html.indexOf("var relay");
    const bodyOpen = html.toLowerCase().indexOf("<body");
    const user = html.indexOf('console.log("hi");');
    expect(consoleHook).toBeLessThan(bundle); // コンソールフックが先(CONTRACTS §3.3)
    expect(bundle).toBeLessThan(bootstrap);
    expect(bootstrap).toBeLessThan(bodyOpen); // 本文より前 = ユーザーマークアップに食われない
    expect(bootstrap).toBeLessThan(user);
    // files は JSON で埋め込まれ、< は < にエスケープされる
    expect(html).toContain('nonce: "test-nonce"');
    expect(html).toContain("\\u003c!doctype html>");
  });

  it("ユーザー JS 内の </script> をエスケープしてドキュメントを壊さない", () => {
    const files: FileMap = {
      "index.html": '<!doctype html><html><head></head><body><script src="script.js"></script></body></html>',
      "script.js": 'console.log("</script>");',
    };
    const { html, jsSyntaxError } = compose(files);
    expect(jsSyntaxError).toBeNull();
    expect(html).toContain('console.log("<\\/script>");');
  });

  it("JS 構文エラー時は jsSyntaxError を返し、JS を一切注入しない(HTML/CSS は残る)", () => {
    const files: FileMap = { ...domFiles, "script.js": "const x = ;" };
    const { html, jsSyntaxError } = compose(files);
    expect(jsSyntaxError).not.toBeNull();
    expect(jsSyntaxError?.message).toContain("文法エラー");
    expect(html).toContain("h1 { color: red; }");
    expect(html).not.toContain("const x = ;");
  });

  it("全角記号による構文エラーは全角診断メッセージになる(§5.4)", () => {
    const files: FileMap = { ...domFiles, "script.js": "let x ＝ 1;" };
    const { jsSyntaxError } = compose(files);
    expect(jsSyntaxError?.message).toContain("全角");
    expect(jsSyntaxError?.message).toContain("＝");
  });

  it("HTML 内インライン <script> にもループ保護を適用する(§6.2)", () => {
    const files: FileMap = {
      "index.html": "<!doctype html><html><head></head><body><script>while(true){}</script></body></html>",
    };
    const { html, jsSyntaxError } = compose(files);
    expect(jsSyntaxError).toBeNull();
    expect(html).toContain("__lc0");
    expect(html).toContain("__LOOP_LIMIT_EXCEEDED__");
  });

  it("script src のループ保護も適用される", () => {
    const files: FileMap = {
      "index.html": '<html><head></head><body><script src="script.js"></script></body></html>',
      "script.js": "for (let i = 0; i < 10; i++) {}",
    };
    const { html } = compose(files);
    expect(html).toContain("__lc0");
  });

  it("files に存在しない参照はそのまま残す(§6.1)", () => {
    const files: FileMap = {
      "index.html":
        '<html><head><link rel="stylesheet" href="nope.css"></head><body><script src="nope.js"></script></body></html>',
    };
    const { html } = compose(files);
    expect(html).toContain('href="nope.css"');
    expect(html).toContain('src="nope.js"');
  });

  it("骨格の無い HTML は先頭にヘッダを注入する", () => {
    const files: FileMap = { "index.html": "<p>hi</p>" };
    const { html } = compose(files);
    expect(html.startsWith('<meta http-equiv="Content-Security-Policy"')).toBe(true);
    expect(html).toContain("<p>hi</p>");
  });

  it("head 無し・doctype ありの HTML は doctype の直後に注入する(quirks mode 回避)", () => {
    const files: FileMap = { "index.html": "<!doctype html><p>hi</p>" };
    const { html } = compose(files);
    expect(html.startsWith("<!doctype html><meta http-equiv=")).toBe(true);
  });
});

describe("エスケープヘルパ", () => {
  it("escapeInlineScript は </script を <\\/script にする", () => {
    expect(escapeInlineScript("a</script>b</SCRIPT>c")).toBe("a<\\/script>b<\\/SCRIPT>c");
  });

  it("escapeJsonForScript は < を \\u003c にする", () => {
    expect(escapeJsonForScript({ a: "</script>" })).toBe('{"a":"\\u003c/script>"}');
  });
});
