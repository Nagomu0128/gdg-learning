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
    expect(stripComments("<p>a</p>\n<!-- 1\n2\n3 -->\n<p>b</p>", "html")).toBe(
      "<p>a</p>\n\n\n\n<p>b</p>",
    );
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
});

describe("stripComments — css", () => {
  it("/* */ を除去する", () => {
    expect(stripComments("h1 { /* color: red; */ color: blue; }", "css")).toBe(
      "h1 {   color: blue; }",
    );
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
    expect(stripComments("const a = 1; // メモ\nconst b = 2;", "js")).toBe(
      "const a = 1;  \nconst b = 2;",
    );
  });

  it("ブロックコメントを除去する", () => {
    expect(stripComments("const a /* まん中 */ = 1;", "js")).toBe("const a   = 1;");
  });

  it("コメント内の console.log がマッチ対象から消える", () => {
    const src = "// ここに console.log(\"hello\") と書こう\n";
    expect(stripComments(src, "js")).not.toContain("console.log");
  });

  it("文字列リテラル内の // はコメント扱いしない", () => {
    const src = 'const url = "https://example.com"; const s = \'a // b\';';
    expect(stripComments(src, "js")).toBe(src);
  });

  it("テンプレートリテラル内の // と /* はコメント扱いしない", () => {
    const src = "const s = `https://example.com /* keep */`;";
    expect(stripComments(src, "js")).toBe(src);
  });

  it("テンプレートリテラルの補間内のコメントは除去する", () => {
    expect(stripComments("const s = `v=${x /* c */ + 1}`;", "js")).toBe(
      "const s = `v=${x   + 1}`;",
    );
  });

  it("補間内のオブジェクトリテラルの } でテンプレートが壊れない", () => {
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
