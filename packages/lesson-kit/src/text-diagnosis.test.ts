import { describe, expect, it } from "vitest";
import { diagnoseTextZenkaku, toHalfWidth } from "./text-diagnosis";
import type { TextCheck } from "./types";

describe("toHalfWidth", () => {
  it("全角英数字・記号・全角スペースを半角化する", () => {
    expect(toHalfWidth("Ｈｅｌｌｏ　１２３！")).toBe("Hello 123!");
    expect(toHalfWidth("＃＄＠［］＾＿｀～")).toBe("#$@[]^_`~");
  });

  it("かな・漢字・半角はそのまま", () => {
    expect(toHalfWidth("こんにちは world 123")).toBe("こんにちは world 123");
  });
});

describe("diagnoseTextZenkaku — text check の全角診断(症状駆動)", () => {
  const check = (partial: Partial<TextCheck>): TextCheck => ({
    id: "t",
    type: "text",
    selector: "h1",
    ...partial,
  });

  it("equals: 全角数字が原因の不一致を診断する", () => {
    expect(diagnoseTextZenkaku("３個です", check({ equals: "3個です" }))).toBe(
      "「３」が全角で入力されています。半角の「3」に直しましょう",
    );
  });

  it("contains: 全角英字が原因の不一致を診断する", () => {
    expect(diagnoseTextZenkaku("私は ＨＴＭＬ を学ぶ", check({ contains: "HTML" }))).toBe(
      "「Ｈ」が全角で入力されています。半角の「H」に直しましょう",
    );
  });

  it("記号(!)が原因の不一致を診断する", () => {
    expect(diagnoseTextZenkaku("Hello！", check({ equals: "Hello!" }))).toBe(
      "「！」が全角で入力されています。半角の「!」に直しましょう",
    );
  });

  it("exact:true の全角スペースを診断する", () => {
    expect(diagnoseTextZenkaku("a　b", check({ equals: "a b", exact: true }))).toBe(
      "全角スペースが入っています。半角スペースに直しましょう",
    );
  });

  it("期待値側が全角を要求するときは発火しない(偽陽性ゼロ)", () => {
    // ユーザーが半角で「Hello!」、期待は全角「Hello！」→ 半角化しても合格しない
    expect(diagnoseTextZenkaku("Hello!", check({ equals: "Hello！" }))).toBeNull();
  });

  it("全角が原因ではない不一致には発火しない", () => {
    expect(diagnoseTextZenkaku("ちがう内容", check({ equals: "3個です" }))).toBeNull();
  });

  it("全角を含まない入力には発火しない", () => {
    expect(diagnoseTextZenkaku("hello", check({ equals: "world" }))).toBeNull();
  });

  it("pattern でも機能する", () => {
    expect(diagnoseTextZenkaku("価格は１００円", check({ pattern: "価格は100円" }))).toBe(
      "「１」が全角で入力されています。半角の「1」に直しましょう",
    );
  });

  // レビュー指摘の核心: 先頭の全角(合否に無関係)ではなく、実際に効く全角を指摘する。
  // 旧実装は actual 先頭から最初の全角(Ｈ)を指し、直しても合格しない誤誘導になっていた。
  it("先頭の無関係な全角ではなく、合否を反転させる全角を指摘する", () => {
    expect(diagnoseTextZenkaku("Ｈｅｌｌｏ３", check({ contains: "3" }))).toBe(
      "「３」が全角で入力されています。半角の「3」に直しましょう",
    );
  });

  it("複数箇所が全角のときは効く先頭文字を指摘する(単独では合格に転じない)", () => {
    expect(diagnoseTextZenkaku("Ｈｅｌｌｏ３００", check({ contains: "300" }))).toBe(
      "「３」が全角で入力されています。半角の「3」に直しましょう",
    );
  });
});
