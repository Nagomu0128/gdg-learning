import { describe, expect, it } from "vitest";
import {
  diagnoseJsParseError,
  diagnoseMarkupZenkaku,
  findZenkakuChars,
  findZenkakuSpaces,
  formatZenkakuDiagnosis,
  generalSyntaxErrorMessage,
  ZENKAKU_MAP,
} from "./zenkaku";

describe("findZenkakuChars — 対象文字(CONTRACTS §2)", () => {
  it.each([
    ["＜", "<"],
    ["＞", ">"],
    ["（", "("],
    ["）", ")"],
    ["＂", '"'],
    ["＇", "'"],
    ["＝", "="],
    ["；", ";"],
    ["：", ":"],
    ["｛", "{"],
    ["｝", "}"],
    ["　", " "],
    ["＋", "+"],
    ["－", "-"],
    ["＊", "*"],
    ["／", "/"],
    ["％", "%"],
    ["！", "!"],
    ["？", "?"],
    ["＆", "&"],
    ["｜", "|"],
    ["．", "."],
    ["，", ","],
  ])("「%s」を検出し「%s」を提案する", (char, suggestion) => {
    const hits = findZenkakuChars(`a${char}b`);
    expect(hits).toHaveLength(1);
    expect(hits[0]).toEqual({ index: 1, line: 1, column: 2, char, suggestion });
  });

  it.each([
    ["”", '"'],
    ["“", '"'],
    ["’", "'"],
    ["‘", "'"],
  ])("曲がり引用符「%s」も検出する", (char, suggestion) => {
    const hits = findZenkakuChars(char);
    expect(hits).toHaveLength(1);
    expect(hits[0]).toMatchObject({ char, suggestion });
  });

  it("複数行の line / column を正しく返す", () => {
    const hits = findZenkakuChars("abc\nde＞f");
    expect(hits).toHaveLength(1);
    expect(hits[0]).toEqual({ index: 6, line: 2, column: 3, char: "＞", suggestion: ">" });
  });

  it("複数ヒットを出現順に返す", () => {
    const hits = findZenkakuChars("＜p＞");
    expect(hits.map((h) => h.char)).toEqual(["＜", "＞"]);
  });

  it("通常の日本語テキストは検出しない(偽陽性ゼロ)", () => {
    expect(findZenkakuChars("こんにちは、世界。「引用」・ーです")).toEqual([]);
  });

  it("半角のみのコードは検出しない", () => {
    expect(findZenkakuChars('const x = "<h1>hello</h1>";')).toEqual([]);
  });

  it("空文字列は空配列", () => {
    expect(findZenkakuChars("")).toEqual([]);
  });
});

describe("findZenkakuSpaces", () => {
  it("全角スペースなしは空配列", () => {
    expect(findZenkakuSpaces("const x = 1;")).toEqual([]);
  });

  it("単独の全角スペース", () => {
    expect(findZenkakuSpaces("a　b")).toEqual([{ from: 1, to: 2 }]);
  });

  it("連続する全角スペースは 1 範囲にまとめる", () => {
    expect(findZenkakuSpaces("a　　b")).toEqual([{ from: 1, to: 3 }]);
  });

  it("複数の範囲を返す", () => {
    expect(findZenkakuSpaces("　a　")).toEqual([
      { from: 0, to: 1 },
      { from: 2, to: 3 },
    ]);
  });

  it("末尾の全角スペースも閉じる", () => {
    expect(findZenkakuSpaces("ab　")).toEqual([{ from: 2, to: 3 }]);
  });
});

describe("diagnoseJsParseError", () => {
  it("エラー行の全角記号を診断する(文言形式の完全一致)", () => {
    const diag = diagnoseJsParseError('console.log（"hi"）', { line: 1, column: 11 });
    expect(diag).toEqual({
      line: 1,
      message: "1行目に全角の「（」が入っています。半角の「(」に直しましょう",
    });
  });

  it("全角スペースは専用文言になる", () => {
    const diag = diagnoseJsParseError("let　x = 1", { line: 1, column: 3 });
    expect(diag).toEqual({
      line: 1,
      message: "1行目に全角スペースが入っています。半角スペースに直しましょう",
    });
  });

  it("エラー行に無ければ前の行を見る(acorn は次トークンを指すため)", () => {
    const diag = diagnoseJsParseError("const a = ｛\nlet = 5", { line: 2, column: 0 });
    expect(diag).toEqual({
      line: 1,
      message: "1行目に全角の「｛」が入っています。半角の「{」に直しましょう",
    });
  });

  it("次の行も見る", () => {
    const diag = diagnoseJsParseError("const = 5\nconst y = （2）;", { line: 1, column: 6 });
    expect(diag?.line).toBe(2);
    expect(diag?.message).toContain("全角の「（」");
  });

  it("エラー行では column に最も近い記号を選ぶ", () => {
    // 文字列リテラル内の ） より、エラー位置の ＝ を優先する
    const diag = diagnoseJsParseError('const t = "a）b"; let x ＝ 5;', { line: 1, column: 23 });
    expect(diag?.message).toContain("全角の「＝」");
  });

  it("全角記号が無ければ全角英数字を疑う", () => {
    const diag = diagnoseJsParseError("ｌｅｔ x = 1", { line: 1, column: 4 });
    expect(diag).toEqual({
      line: 1,
      message: "1行目に全角の「ｌ」が入っています。半角の「l」に直しましょう",
    });
  });

  it("全角記号は全角英数字より優先される", () => {
    const diag = diagnoseJsParseError("ｌｅｔ x ＝ 1", { line: 1, column: 8 });
    expect(diag?.message).toContain("全角の「＝」");
  });

  it("全角が無ければ null(一般診断に落とす)", () => {
    expect(diagnoseJsParseError("const = 5", { line: 1, column: 6 })).toBeNull();
  });

  it("範囲外の行番号は null", () => {
    expect(diagnoseJsParseError("const x = 1;", { line: 99, column: 0 })).toBeNull();
  });
});

describe("diagnoseMarkupZenkaku — 検出(構文を模した全角列)", () => {
  it("全角のタグ様の列(＜ｈ１＞)を診断する", () => {
    const diag = diagnoseMarkupZenkaku("＜ｈ１＞見出し＜／ｈ１＞");
    expect(diag).toEqual({
      line: 1,
      message: "1行目に全角の「＜」が入っています。半角の「<」に直しましょう",
    });
  });

  it("複数行 HTML で正しい行番号を返す", () => {
    const diag = diagnoseMarkupZenkaku("<html>\n<body>\n＜ｐ＞テキスト\n</body>");
    expect(diag?.line).toBe(3);
    expect(diag?.message).toContain("3行目に全角の「＜」");
  });

  it("半角<>内の全角タグ名(<ｈ１>)も診断する", () => {
    const diag = diagnoseMarkupZenkaku("<ｈ１>見出し</h1>");
    expect(diag).toEqual({
      line: 1,
      message: "1行目に全角の「ｈ」が入っています。半角の「h」に直しましょう",
    });
  });

  it("CSS 宣言の全角コロンを診断する", () => {
    const diag = diagnoseMarkupZenkaku("h1 {\n  color：red；\n}");
    expect(diag?.line).toBe(2);
    expect(diag?.message).toContain("全角の「：」");
  });

  it("CSS 宣言の全角セミコロンを診断する", () => {
    const diag = diagnoseMarkupZenkaku("h1 { color: red； }");
    expect(diag?.message).toContain("全角の「；」");
  });

  it("属性代入の全角イコールを診断する", () => {
    const diag = diagnoseMarkupZenkaku('<img src＝"cat.png">');
    expect(diag?.message).toContain("全角の「＝」");
  });

  it("属性値の全角クオートを診断する", () => {
    const diag = diagnoseMarkupZenkaku("<img src=＂cat.png＂>");
    expect(diag?.message).toContain("全角の「＂」");
  });

  it("診断は構文様の領域内の文字を指す(同一行の本文の全角を指さない)", () => {
    const diag = diagnoseMarkupZenkaku("<p>（例）＜ｓｐａｎ＞</p>");
    expect(diag?.message).toContain("全角の「＜」");
    expect(diag?.message).not.toContain("（");
  });
});

describe("diagnoseMarkupZenkaku — 偽陽性ゼロ(正当な全角は咎めない)", () => {
  it.each([
    "<p>（全角の）本文</p>",
    "<p>こんにちは、世界！</p>",
    "<h1>自己紹介：私について</h1>",
    "<p>価格：100円；税込</p>",
    "<p>こんにちは　世界</p>",
    '<p class="intro">hello</p>',
    "h1 { color: red; }",
    "",
  ])("誤検出しない: %s", (source) => {
    expect(diagnoseMarkupZenkaku(source)).toBeNull();
  });
});

describe("メッセージ形式", () => {
  it("generalSyntaxErrorMessage は行番号入りの一般診断", () => {
    expect(generalSyntaxErrorMessage(5)).toBe(
      "5行目に文法エラーがあります。タグや記号の書き方を見直してみましょう",
    );
  });

  it("formatZenkakuDiagnosis の全角スペース文言", () => {
    expect(formatZenkakuDiagnosis(2, "　", " ")).toBe(
      "2行目に全角スペースが入っています。半角スペースに直しましょう",
    );
  });

  it("formatZenkakuDiagnosis の記号文言", () => {
    expect(formatZenkakuDiagnosis(3, "＜", "<")).toBe(
      "3行目に全角の「＜」が入っています。半角の「<」に直しましょう",
    );
  });

  it("ZENKAKU_MAP は全角スペースを含む", () => {
    expect(ZENKAKU_MAP.get("　")).toBe(" ");
  });
});
