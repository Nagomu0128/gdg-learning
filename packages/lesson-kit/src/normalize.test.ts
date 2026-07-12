import { describe, expect, it } from "vitest";
import { consoleLinesMatch, deepEqualWithNaN, normalizeText, textMatches } from "./normalize";
import type { TextCheck } from "./types";

function textCheck(partial: Partial<TextCheck>): TextCheck {
  return { id: "t", type: "text", selector: "h1", ...partial };
}

describe("normalizeText(§5.3)", () => {
  it("前後を trim する", () => {
    expect(normalizeText("  hello  ")).toBe("hello");
  });

  it("連続空白を 1 つに畳む", () => {
    expect(normalizeText("a   b")).toBe("a b");
  });

  it("改行・タブも空白として畳む", () => {
    expect(normalizeText("a\n\t b\r\nc")).toBe("a b c");
  });

  it("全角スペースも空白として畳む", () => {
    expect(normalizeText("a　b")).toBe("a b");
  });

  it("exact:true で正規化を無効化する", () => {
    expect(normalizeText("  a  b ", { exact: true })).toBe("  a  b ");
  });

  it("空文字列はそのまま", () => {
    expect(normalizeText("")).toBe("");
  });
});

describe("textMatches — equals", () => {
  it("両辺を正規化して比較する", () => {
    expect(textMatches(" Hello \n World ", textCheck({ equals: "Hello World" }))).toBe(true);
  });

  it("中身が違えば不一致", () => {
    expect(textMatches("Hello", textCheck({ equals: "Hellow" }))).toBe(false);
  });

  it("exact:true では空白差で不一致", () => {
    expect(textMatches("Hello  World", textCheck({ equals: "Hello World", exact: true }))).toBe(false);
  });

  it("exact:true でも完全一致なら一致", () => {
    expect(textMatches("Hello World", textCheck({ equals: "Hello World", exact: true }))).toBe(true);
  });

  it("ignoreCase で大文字小文字を無視", () => {
    expect(textMatches("HELLO", textCheck({ equals: "hello", ignoreCase: true }))).toBe(true);
  });

  it("ignoreCase なしでは大文字小文字を区別", () => {
    expect(textMatches("HELLO", textCheck({ equals: "hello" }))).toBe(false);
  });
});

describe("textMatches — contains / pattern", () => {
  it("contains: 部分一致", () => {
    expect(textMatches("こんにちは世界", textCheck({ contains: "世界" }))).toBe(true);
  });

  it("contains: 含まれなければ不一致", () => {
    expect(textMatches("こんにちは", textCheck({ contains: "世界" }))).toBe(false);
  });

  it("contains も正規化して比較する", () => {
    expect(textMatches("foo   bar baz", textCheck({ contains: "bar baz" }))).toBe(true);
  });

  it("pattern: 正規表現で判定", () => {
    expect(textMatches("abc123", textCheck({ pattern: "^abc\\d+$" }))).toBe(true);
    expect(textMatches("abcxyz", textCheck({ pattern: "^abc\\d+$" }))).toBe(false);
  });

  it("pattern + ignoreCase は i フラグ相当", () => {
    expect(textMatches("ABC", textCheck({ pattern: "^abc$", ignoreCase: true }))).toBe(true);
  });

  it("flags 明示指定が使われる", () => {
    expect(textMatches("HELLO", textCheck({ pattern: "hello", flags: "i" }))).toBe(true);
  });

  it("equals と contains の両方を満たす必要がある", () => {
    expect(textMatches("a  b", textCheck({ equals: "a b", contains: "b" }))).toBe(true);
    expect(textMatches("a  b", textCheck({ equals: "a b", contains: "z" }))).toBe(false);
  });
});

describe("deepEqualWithNaN(§5.3)", () => {
  it("NaN === NaN は真", () => {
    expect(deepEqualWithNaN(Number.NaN, Number.NaN)).toBe(true);
  });

  it("配列内の NaN も真", () => {
    expect(deepEqualWithNaN([1, Number.NaN], [1, Number.NaN])).toBe(true);
  });

  it("オブジェクト内の NaN も真", () => {
    expect(deepEqualWithNaN({ a: Number.NaN }, { a: Number.NaN })).toBe(true);
  });

  it("深いネストの比較", () => {
    expect(
      deepEqualWithNaN({ a: [1, { b: Number.NaN, c: "x" }] }, { a: [1, { b: Number.NaN, c: "x" }] }),
    ).toBe(true);
    expect(deepEqualWithNaN({ a: [1, { b: 2 }] }, { a: [1, { b: 3 }] })).toBe(false);
  });

  it("プリミティブの一致 / 不一致", () => {
    expect(deepEqualWithNaN(1, 1)).toBe(true);
    expect(deepEqualWithNaN("a", "a")).toBe(true);
    expect(deepEqualWithNaN(true, true)).toBe(true);
    expect(deepEqualWithNaN(1, "1")).toBe(false);
    expect(deepEqualWithNaN(true, 1)).toBe(false);
  });

  it("null / undefined の扱い", () => {
    expect(deepEqualWithNaN(null, null)).toBe(true);
    expect(deepEqualWithNaN(undefined, undefined)).toBe(true);
    expect(deepEqualWithNaN(null, undefined)).toBe(false);
    expect(deepEqualWithNaN({ a: 1 }, null)).toBe(false);
  });

  it("配列の順序と長さ", () => {
    expect(deepEqualWithNaN([1, 2], [1, 2])).toBe(true);
    expect(deepEqualWithNaN([1, 2], [2, 1])).toBe(false);
    expect(deepEqualWithNaN([1, 2], [1, 2, 3])).toBe(false);
  });

  it("配列とオブジェクトは不一致", () => {
    expect(deepEqualWithNaN([1], { 0: 1 })).toBe(false);
  });

  it("キーの過不足は不一致", () => {
    expect(deepEqualWithNaN({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(deepEqualWithNaN({ a: 1, b: 2 }, { a: 1 })).toBe(false);
  });

  it("キーの順序は無関係", () => {
    expect(deepEqualWithNaN({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
  });
});

describe("deepEqualWithNaN — 堅牢化(J-judge-hardening)", () => {
  it("+0 と -0 は等しい(=== と同じ直感。Math.round(-0.4) 対策)", () => {
    expect(deepEqualWithNaN(0, -0)).toBe(true);
    expect(deepEqualWithNaN(-0, 0)).toBe(true);
    expect(deepEqualWithNaN([Math.round(-0.4)], [0])).toBe(true);
    expect(deepEqualWithNaN({ a: -0 }, { a: 0 })).toBe(true);
  });

  it("循環参照を返されてもスタックオーバーフローしない(片側循環)", () => {
    const a: Record<string, unknown> = { name: "x" };
    a.self = a;
    expect(deepEqualWithNaN(a, { name: "x", self: { name: "x", self: null } })).toBe(false);
    expect(deepEqualWithNaN(a, { name: "x" })).toBe(false);
  });

  it("両側循環: 同型の循環は等しい・異なる値を含む循環は等しくない", () => {
    const a: Record<string, unknown> = { v: 1 };
    a.self = a;
    const b: Record<string, unknown> = { v: 1 };
    b.self = b;
    expect(deepEqualWithNaN(a, b)).toBe(true);
    const c: Record<string, unknown> = { v: 2 };
    c.self = c;
    expect(deepEqualWithNaN(a, c)).toBe(false);
  });

  it("循環配列も落ちない", () => {
    const a: unknown[] = [1];
    a.push(a);
    const b: unknown[] = [1];
    b.push(b);
    expect(deepEqualWithNaN(a, b)).toBe(true);
    expect(deepEqualWithNaN(a, [1, [1, null]])).toBe(false);
  });

  it("深い入れ子は浅い側の深さで打ち切られる(期待値が浅ければ安全)", () => {
    // 学習者が異常に深い構造を返しても、authored な期待値(浅い)との比較は早期に false
    let deep: unknown = 1;
    for (let i = 0; i < 200000; i++) deep = [deep];
    expect(deepEqualWithNaN(deep, [[1]])).toBe(false);
  });
});

describe("consoleLinesMatch(CONTRACTS §2)", () => {
  it("非 ordered: 順不同で全期待行が存在すれば真", () => {
    expect(consoleLinesMatch(["b", "a"], ["a", "b"], false)).toBe(true);
  });

  it("非 ordered: 多重集合として判定(重複行は回数分必要)", () => {
    expect(consoleLinesMatch(["a"], ["a", "a"], false)).toBe(false);
    expect(consoleLinesMatch(["a", "a"], ["a", "a"], false)).toBe(true);
  });

  it("非 ordered: 期待行が欠けていれば偽", () => {
    expect(consoleLinesMatch(["a"], ["a", "b"], false)).toBe(false);
  });

  it("ordered: 部分列(順序保存)なら真", () => {
    expect(consoleLinesMatch(["x", "a", "y", "b"], ["a", "b"], true)).toBe(true);
  });

  it("ordered: 順序が逆なら偽", () => {
    expect(consoleLinesMatch(["b", "a"], ["a", "b"], true)).toBe(false);
  });

  it("ordered: 重複行の部分列", () => {
    expect(consoleLinesMatch(["a", "b", "a"], ["a", "a"], true)).toBe(true);
    expect(consoleLinesMatch(["a", "b"], ["a", "a"], true)).toBe(false);
  });

  it("各行は normalizeText 後の完全一致", () => {
    expect(consoleLinesMatch(["  Hello   World  "], ["Hello World"], false)).toBe(true);
    expect(consoleLinesMatch(["Hello World!"], ["Hello"], false)).toBe(false);
  });

  it("期待行が空なら常に真", () => {
    expect(consoleLinesMatch(["a"], [], false)).toBe(true);
    expect(consoleLinesMatch([], [], true)).toBe(true);
  });

  it("出力が空で期待行があれば偽", () => {
    expect(consoleLinesMatch([], ["a"], false)).toBe(false);
    expect(consoleLinesMatch([], ["a"], true)).toBe(false);
  });

  it("ordered: 交互に重複する期待行(a,b,a)も消費順に正しく照合する", () => {
    expect(consoleLinesMatch(["a", "b", "a"], ["a", "b", "a"], true)).toBe(true);
    expect(consoleLinesMatch(["a", "a", "b"], ["a", "b", "a"], true)).toBe(false);
    expect(consoleLinesMatch(["x", "a", "b", "y", "a"], ["a", "b", "a"], true)).toBe(true);
  });

  it("trim の一貫性: 実出力・期待行の両方が正規化される(全角スペース含む)", () => {
    expect(consoleLinesMatch(["合計　10"], ["合計 10"], false)).toBe(true);
    expect(consoleLinesMatch(["合計 10"], [" 合計　10 "], true)).toBe(true);
  });
});
