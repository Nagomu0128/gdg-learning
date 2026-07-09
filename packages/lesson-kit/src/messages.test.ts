import { describe, expect, it } from "vitest";
import { defaultMessageFor } from "./messages";

describe("defaultMessageFor(§5.2 のトーン)", () => {
  it("element(count なし): タグが見つかりません", () => {
    expect(defaultMessageFor({ id: "c", type: "element", selector: "h1" })).toBe("<h1>タグが見つかりません");
  });

  it("element(count あり): N 個にしましょう", () => {
    expect(defaultMessageFor({ id: "c", type: "element", selector: "li", count: 3 })).toBe(
      "<li>タグを3個にしましょう",
    );
  });

  it("element(複合セレクタ): セレクタ表記に落ちる", () => {
    expect(defaultMessageFor({ id: "c", type: "element", selector: "ul > li" })).toBe(
      "「ul > li」に当てはまる要素が見つかりません",
    );
  });

  it("text(equals): 中身を〜にしましょう", () => {
    expect(defaultMessageFor({ id: "c", type: "text", selector: "h1", equals: "自己紹介" })).toBe(
      "<h1>タグの中身を「自己紹介」にしましょう",
    );
  });

  it("text(contains): 文字を入れましょう", () => {
    expect(defaultMessageFor({ id: "c", type: "text", selector: "p", contains: "こんにちは" })).toBe(
      "<p>タグに「こんにちは」という文字を入れましょう",
    );
  });

  it("text(pattern のみ): 見直しましょう", () => {
    expect(defaultMessageFor({ id: "c", type: "text", selector: "p", pattern: "^\\d+$" })).toBe(
      "<p>タグの中身を見直してみましょう",
    );
  });

  it("attribute(equals): 属性を〜にしましょう", () => {
    expect(
      defaultMessageFor({ id: "c", type: "attribute", selector: "img", name: "alt", equals: "猫" }),
    ).toBe("<img>タグのalt属性を「猫」にしましょう");
  });

  it("attribute(exists): 属性を付けましょう", () => {
    expect(
      defaultMessageFor({ id: "c", type: "attribute", selector: "img", name: "alt", exists: true }),
    ).toBe("<img>タグにalt属性を付けましょう");
  });

  it("style: プロパティが期待値になっていません", () => {
    expect(
      defaultMessageFor({ id: "c", type: "style", selector: "h1", property: "color", equals: "red" }),
    ).toBe("h1 の color が red になっていません");
  });

  it("source: 一般文言", () => {
    expect(defaultMessageFor({ id: "c", type: "source", file: "index.html", pattern: "<!doctype" })).toBe(
      "コードに必要な記述が見つかりません。スライドを見直してみましょう",
    );
  });

  it("console(1 行): 出力されていません", () => {
    expect(defaultMessageFor({ id: "c", type: "console", lines: ["Hello"] })).toBe(
      "「Hello」がコンソールに出力されていません",
    );
  });

  it("console(複数行): N 行の出力がそろっていません", () => {
    expect(defaultMessageFor({ id: "c", type: "console", lines: ["a", "b"] })).toBe(
      "「a」など2行の出力がコンソールにそろっていません",
    );
  });

  it("fn: 戻り値が〜ではありません", () => {
    expect(defaultMessageFor({ id: "c", type: "fn", name: "add", args: [1, 2], returns: 3 })).toBe(
      "add(1, 2) の戻り値が 3 ではありません",
    );
  });

  it("fn(文字列引数): JSON 表記で埋め込む", () => {
    expect(
      defaultMessageFor({ id: "c", type: "fn", name: "greet", args: ["世界"], returns: "こんにちは、世界" }),
    ).toBe('greet("世界") の戻り値が "こんにちは、世界" ではありません');
  });

  it("custom: 著者の message をそのまま返す", () => {
    expect(
      defaultMessageFor({
        id: "c",
        type: "custom",
        message: "追加ボタンでリストに項目が増えるようにしましょう",
        run: () => true,
      }),
    ).toBe("追加ボタンでリストに項目が増えるようにしましょう");
  });
});
