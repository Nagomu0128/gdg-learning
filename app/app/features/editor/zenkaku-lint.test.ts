import { describe, expect, it } from "vitest";
import { zenkakuDiagnostics, zenkakuSpaceRanges, zenkakuWarningMessage } from "./zenkaku-lint";

describe("zenkakuDiagnostics", () => {
  it("空文字列は診断なし", () => {
    expect(zenkakuDiagnostics("")).toEqual([]);
  });

  it("全角記号を warning として位置つきで検出する", () => {
    const diags = zenkakuDiagnostics("＜p＞");
    expect(diags).toHaveLength(2);
    expect(diags[0]).toEqual({
      from: 0,
      to: 1,
      severity: "warning",
      message: "全角の「＜」が入っています。半角の「<」に直しましょう",
    });
    expect(diags[1]).toMatchObject({ from: 2, to: 3 });
  });

  it("複数行でもドキュメント内オフセットで検出する", () => {
    const diags = zenkakuDiagnostics("ab\n＝");
    expect(diags).toHaveLength(1);
    expect(diags[0]).toMatchObject({ from: 3, to: 4 });
  });

  it("通常の日本語本文には反応しない(偽陽性なし)", () => {
    expect(zenkakuDiagnostics("<p>こんにちは、世界。</p>")).toEqual([]);
  });

  it("全角スペースは専用文言", () => {
    const diags = zenkakuDiagnostics("a　b");
    expect(diags).toHaveLength(1);
    expect(diags[0]?.message).toBe("全角スペースが入っています。半角スペースに直しましょう");
  });
});

describe("zenkakuWarningMessage", () => {
  it("記号は char と suggestion を含む", () => {
    expect(zenkakuWarningMessage("（", "(")).toBe("全角の「（」が入っています。半角の「(」に直しましょう");
  });
});

describe("zenkakuSpaceRanges", () => {
  it("連続する全角スペースを 1 範囲にまとめる", () => {
    expect(zenkakuSpaceRanges("a　　b")).toEqual([{ from: 1, to: 3 }]);
  });

  it("全角スペースがなければ空", () => {
    expect(zenkakuSpaceRanges("a b")).toEqual([]);
  });
});
