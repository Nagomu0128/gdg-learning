import { describe, expect, it } from "vitest";
import { jstDateString, jstYesterday } from "./jst";

describe("jstDateString", () => {
  it("UTC 15:00 が JST の日付境界(翌日 0:00)になる", () => {
    // 2026-07-08T15:00:00Z = JST 2026-07-09 00:00
    expect(jstDateString(Date.UTC(2026, 6, 8, 15, 0, 0))).toBe("2026-07-09");
    // その 1ms 前は前日
    expect(jstDateString(Date.UTC(2026, 6, 8, 14, 59, 59, 999))).toBe("2026-07-08");
  });

  it("UTC 正午は JST 同日の 21 時", () => {
    expect(jstDateString(Date.UTC(2026, 6, 9, 12, 0, 0))).toBe("2026-07-09");
  });

  it("年跨ぎ: UTC 12/31 15:00 は JST 1/1", () => {
    expect(jstDateString(Date.UTC(2025, 11, 31, 15, 0, 0))).toBe("2026-01-01");
    expect(jstDateString(Date.UTC(2025, 11, 31, 14, 59, 59))).toBe("2025-12-31");
  });
});

describe("jstYesterday", () => {
  it("同月内", () => {
    expect(jstYesterday("2026-07-09")).toBe("2026-07-08");
  });

  it("月跨ぎ", () => {
    expect(jstYesterday("2026-07-01")).toBe("2026-06-30");
    expect(jstYesterday("2026-03-01")).toBe("2026-02-28");
  });

  it("うるう年の 3/1 は 2/29", () => {
    expect(jstYesterday("2024-03-01")).toBe("2024-02-29");
  });

  it("年跨ぎ", () => {
    expect(jstYesterday("2026-01-01")).toBe("2025-12-31");
  });

  it("不正な形式は throw", () => {
    expect(() => jstYesterday("2026/07/09")).toThrow();
    expect(() => jstYesterday("not-a-date")).toThrow();
  });
});
