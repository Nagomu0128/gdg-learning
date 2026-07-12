import { describe, expect, it } from "vitest";
import { commentLangForFile, stripComments, stripCommentsForFile } from "./strip-comments";

describe("commentLangForFile", () => {
  it.each([
    ["script.js", "js"],
    ["util.mjs", "js"],
    ["style.css", "css"],
    ["index.html", "html"],
    ["page.HTM", "html"],
  ] as const)("%s → %s", (file, lang) => {
    expect(commentLangForFile(file)).toBe(lang);
  });

  it("不明な拡張子は null", () => {
    expect(commentLangForFile("data.json")).toBeNull();
    expect(commentLangForFile("README.md")).toBeNull();
  });
});

describe("stripComments — html", () => {
  it("<!-- --> を除去する", () => {
    expect(stripComments("<p>a</p><!-- コメント --><p>b</p>", "html")).toBe("<p>a</p> <p>b</p>");
  });

  it("コメント内の改行は保持する(行番号を守る)", () => {
    expect(stripComments("<p>a</p>\n<!-- 1\n2\n3 -->\n<p>b</p>", "html")).toBe("<p>a</p>\n\n\n\n<p>b</p>");
  });

  it("コメント内のタグ様テキストが消える", () => {
    const out = stripComments("<!-- <title>ここに書く</title> -->", "html");
    expect(out).not.toContain("<title>");
  });

  it("未終端コメントは末尾まで除去する", () => {
    expect(stripComments("<p>a</p><!-- 未終端", "html")).toBe("<p>a</p> ");
  });

  it("コメントが無ければ原文のまま", () => {
    const src = "<p>a --> b</p>";
    expect(stripComments(src, "html")).toBe(src);
  });

  // 属性値内の <!-- をコメント開始と誤認しない(レビュー実証: 後続の <meta> が消えていた)
  it("属性値内の <!-- で後続要素が消えない", () => {
    const src = '<meta content="Use <!-- for legacy"><meta name="viewport">';
    const out = stripComments(src, "html");
    expect(out).toContain('name="viewport"');
    expect(out).toBe(src);
  });

  it("raw-text 要素 <style> 内の <!-- で CSS が消えない", () => {
    const src = "<style><!-- h1 { color: red; } --></style><p>x</p>";
    const out = stripComments(src, "html");
    expect(out).toContain("color: red");
    expect(out).toContain("<p>x</p>");
    expect(out).toBe(src);
  });

  it("raw-text 要素 <script> 内の <!-- で JS が消えない", () => {
    const src = "<script>var a = 1; // note\n</script><p>y</p>";
    const out = stripComments(src, "html");
    // script 内は raw-text として逐語保持(JS コメントは除去対象外)。後続要素も保持
    expect(out).toBe(src);
  });

  it("引用符の外(データ状態)の <!-- は従来どおり除去する", () => {
    const src = '<meta content="x"><!-- 消える --><p>z</p>';
    expect(stripComments(src, "html")).toBe('<meta content="x"> <p>z</p>');
  });
});

describe("stripComments — css", () => {
  it("/* */ を除去する", () => {
    expect(stripComments("h1 { /* color: red; */ color: blue; }", "css")).toBe("h1 {   color: blue; }");
  });

  it("文字列内の /* はコメント扱いしない", () => {
    const src = 'h1::before { content: "/* not comment */"; }';
    expect(stripComments(src, "css")).toBe(src);
  });

  it("複数行コメントの改行は保持する", () => {
    expect(stripComments("a{}\n/*\nx\n*/\nb{}", "css")).toBe("a{}\n\n\n\nb{}");
  });

  it("未終端コメントは末尾まで除去する", () => {
    expect(stripComments("a{} /* 未終端", "css")).toBe("a{}  ");
  });
});

describe("stripComments — js", () => {
  it("行コメントを除去する(改行は残す)", () => {
    expect(stripComments("const a = 1; // メモ\nconst b = 2;", "js")).toBe("const a = 1;  \nconst b = 2;");
  });

  it("ブロックコメントを除去する", () => {
    expect(stripComments("const a /* まん中 */ = 1;", "js")).toBe("const a   = 1;");
  });

  it("コメント内の console.log がマッチ対象から消える", () => {
    const src = '// ここに console.log("hello") と書こう\n';
    expect(stripComments(src, "js")).not.toContain("console.log");
  });

  it("文字列リテラル内の // はコメント扱いしない", () => {
    const src = "const url = \"https://example.com\"; const s = 'a // b';";
    expect(stripComments(src, "js")).toBe(src);
  });

  it("テンプレートリテラル内の // と /* はコメント扱いしない", () => {
    const src = "const s = `https://example.com /* keep */`;";
    expect(stripComments(src, "js")).toBe(src);
  });

  it("テンプレートリテラルの補間内のコメントは除去する", () => {
    // biome-ignore lint/suspicious/noTemplateCurlyInString: 走査対象の JS ソースとしての ${} が意図
    const input = "const s = `v=${x /* c */ + 1}`;";
    // biome-ignore lint/suspicious/noTemplateCurlyInString: 同上
    const expected = "const s = `v=${x   + 1}`;";
    expect(stripComments(input, "js")).toBe(expected);
  });

  it("補間内のオブジェクトリテラルの } でテンプレートが壊れない", () => {
    // biome-ignore lint/suspicious/noTemplateCurlyInString: 走査対象の JS ソースとしての ${} が意図
    const src = "const s = `${JSON.stringify({ a: 1 })} // not comment`;";
    expect(stripComments(src, "js")).toBe(src);
  });

  it("エスケープされたクオートで文字列状態が壊れない", () => {
    const src = 'const s = "a\\" // b"; // 本物のコメント';
    expect(stripComments(src, "js")).toBe('const s = "a\\" // b";  ');
  });

  it("コメント除去でトークンが結合しない(空白 1 つを残す)", () => {
    expect(stripComments("a/*x*/b", "js")).toBe("a b");
  });

  it("複数行ブロックコメントの改行は保持する", () => {
    expect(stripComments("1;\n/*\n2\n*/\n3;", "js")).toBe("1;\n\n\n\n3;");
  });

  it("未終端ブロックコメントは末尾まで除去する", () => {
    expect(stripComments("const a = 1; /* 未終端", "js")).toBe("const a = 1;  ");
  });

  it("コメントが無ければ原文のまま", () => {
    const src = "const a = 1 / 2;\nconst b = a / 3;";
    expect(stripComments(src, "js")).toBe(src);
  });

  // 正規表現リテラルを行コメントと誤認しない(レビュー実証: \/ の直後の / を // と誤読していた)
  it("split(/\\//) の後続コードが消えない(レビュー実証例)", () => {
    const src = "const parts = p.split(/\\//); markDone();";
    const out = stripComments(src, "js");
    expect(out).toContain("markDone()");
    expect(out).toBe(src);
  });

  it("正規表現 /\\// をコメント開始と誤認しない", () => {
    const src = "const re = /\\//; run();";
    expect(stripComments(src, "js")).toBe(src);
  });

  it("正規表現 /^\\/api\\// を保持する", () => {
    const src = "if (/^\\/api\\//.test(path)) go();";
    expect(stripComments(src, "js")).toBe(src);
  });

  it("正規表現 /\\/\\// を保持する", () => {
    const src = "const doubleSlash = /\\/\\//; next();";
    expect(stripComments(src, "js")).toBe(src);
  });

  it("文字クラス内のスラッシュ /[/]/ を保持する", () => {
    const src = "const re = /[/]/; after();";
    expect(stripComments(src, "js")).toBe(src);
  });

  it("除算の連鎖 a / b / c は正規表現扱いしない(原文のまま)", () => {
    const src = "const x = a / b / c;";
    expect(stripComments(src, "js")).toBe(src);
  });

  it("return の後は正規表現(/x/ を保持しつつ行コメントは残さない)", () => {
    const src = "function f(s){ return /x/.test(s); }";
    expect(stripComments(src, "js")).toBe(src);
  });

  it("正規表現の後の本物の行コメントは除去する", () => {
    const src = "const re = /a\\/b/; // 本物のコメント";
    expect(stripComments(src, "js")).toBe("const re = /a\\/b/;  ");
  });

  it("正規表現リテラルの内側にある // はコメント扱いしない(値の除去が起きない)", () => {
    const src = "const re = /a\\/\\/b/; keep();";
    const out = stripComments(src, "js");
    expect(out).toContain("keep()");
    expect(out).toBe(src);
  });

  // 再レビュー must-fix: 曖昧な `/`(} ) キーワード直後)を除算に倒すと、続く正規表現の
  // 文字クラス内 // や /* を外側ループが誤検出して実コードを削除していた。正規表現側に倒して修正。
  it("} 直後の正規表現(文字クラス内 //)で後続コードが消えない", () => {
    const src = "function noop() {}\n/[a//z]/.test(x);\nmarkDone();";
    const out = stripComments(src, "js");
    expect(out).toContain(".test(x)");
    expect(out).toContain("markDone()");
    expect(out).toBe(src);
  });

  it("} 直後の正規表現(文字クラス内 /*)で未終端ブロックコメント誤検出が起きない", () => {
    const src = "if (x) {}\n/[/*]/.test(s);\nmarkDone();";
    const out = stripComments(src, "js");
    expect(out).toContain("markDone()");
    expect(out).toBe(src);
  });

  it("export default 直後の正規表現(文字クラス内 //)を保持する", () => {
    const src = "export default /[a//z]/;\nmarkDone();";
    const out = stripComments(src, "js");
    expect(out).toContain("/[a//z]/");
    expect(out).toContain("markDone()");
    expect(out).toBe(src);
  });

  it(") 直後の正規表現 if(x)/re/.test(y) を保持する", () => {
    const src = "if (x) /re/.test(y);";
    expect(stripComments(src, "js")).toBe(src);
  });

  it("値(数値)の直後の本物のブロックコメントは従来どおり除去する", () => {
    expect(stripComments("1 / 2; /* c */ x", "js")).toBe("1 / 2;   x");
  });

  it("値の直後の本物の行コメント(除算を挟む)も除去する", () => {
    expect(stripComments("const r = a / b; // c", "js")).toBe("const r = a / b;  ");
  });

  // 3巡目 must-fix: extends 漏れによる同種のコード削除(class Foo extends /[a//z]/ {} で z]/ {} が消える)。
  // キーワード集合を ECMAScript 予約語と網羅監査し、value→division 分岐を閉じたクラスにする。
  it("class extends 直後の正規表現(文字クラス内 //)で後続コードが消えない", () => {
    const src = "class Foo extends /[a//z]/ {}\nmarkDone();";
    const out = stripComments(src, "js");
    expect(out).toContain("markDone()");
    expect(out).toContain("/[a//z]/");
    expect(out).toBe(src);
  });

  it("class extends 直後の正規表現(文字クラス内 /*)で未終端ブロックコメント誤検出が起きない", () => {
    const src = "class Foo extends /[/*]/ {}\nmarkDone();";
    const out = stripComments(src, "js");
    expect(out).toContain("markDone()");
    expect(out).toBe(src);
  });

  // 監査で網羅した他の式先行キーワードの regex-after ケース(文字クラス内 // /* を保持)
  it("throw 直後の正規表現(文字クラス内 //)を保持する", () => {
    const src = "throw /[a//z]/;\nmarkDone();";
    const out = stripComments(src, "js");
    expect(out).toContain("markDone()");
    expect(out).toBe(src);
  });

  it("typeof 直後の正規表現(文字クラス内 /*)を保持する", () => {
    const src = "const t = typeof /[/*]/;\nmarkDone();";
    const out = stripComments(src, "js");
    expect(out).toContain("markDone()");
    expect(out).toBe(src);
  });

  it("void 直後の正規表現(文字クラス内 //)を保持する", () => {
    const src = "void /[a//z]/;\nmarkDone();";
    expect(stripComments(src, "js")).toBe(src);
  });

  // 既知トレードオフの固定(安全側劣化の退行検知): 曖昧位置(} ) 後置 ++/--)直後の本物の除算+同一行
  // コメントは、コード削除を防ぐ regex バイアスの副作用でコメントが消し残る。将来 ) } 判定を「賢く」して
  // ここを除去するようにした場合、この assert が落ちて意図的な挙動変更に気づける。
  it("[既知の割り切り] ) 直後の除算+同一行コメントはコメントを消し残す(逐語のまま)", () => {
    // 明確な値(数値)の直後は曖昧でないため従来どおり除去される(対比)
    expect(stripComments("1 / 2; /* c */ x", "js")).toBe("1 / 2;   x");
    // ) 直後は regex 側に倒すため、続く本物の除算のコメントは消し残る = 入力のまま
    expect(stripComments("f() / 2; /* c */ x", "js")).toBe("f() / 2; /* c */ x");
    // 後置 ++ も同様(+ が prevWasValue を下ろすため)
    expect(stripComments("x++ / 2; // c", "js")).toBe("x++ / 2; // c");
  });
});

describe("stripCommentsForFile", () => {
  it("拡張子から言語を推定する", () => {
    expect(stripCommentsForFile("script.js", "// c\n1;")).toBe(" \n1;");
    expect(stripCommentsForFile("index.html", "<!-- c -->x")).toBe(" x");
  });

  it("不明な拡張子は原文のまま返す", () => {
    expect(stripCommentsForFile("data.txt", "// そのまま")).toBe("// そのまま");
  });
});
