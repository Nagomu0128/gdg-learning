import { describe, expect, it } from "vitest";
import { computeRetentionTargets, RETENTION_MS, type RetentionRow } from "./retention";

const NOW = Date.UTC(2026, 6, 9); // 2026-07-09
const OLD = NOW - RETENTION_MS - 1000; // 90日より前
const RECENT = NOW - 1000;

function row(partial: Partial<RetentionRow> & { id: string }): RetentionRow {
  return {
    userId: "u1",
    lessonSlug: "html-01",
    passed: 0,
    createdAt: OLD,
    hasCode: true,
    ...partial,
  };
}

describe("computeRetentionTargets(§7.5: 90日、最新合格は除外)", () => {
  it("90日より古い不合格提出は対象", () => {
    expect(computeRetentionTargets([row({ id: "a" })], NOW)).toEqual(["a"]);
  });

  it("90日以内の提出は対象外", () => {
    expect(computeRetentionTargets([row({ id: "a", createdAt: RECENT })], NOW)).toEqual([]);
  });

  it("ちょうど 90 日前(created_at == cutoff)は対象外(< の厳密判定)", () => {
    expect(computeRetentionTargets([row({ id: "a", createdAt: NOW - RETENTION_MS })], NOW)).toEqual([]);
  });

  it("code が既に NULL の行は対象外", () => {
    expect(computeRetentionTargets([row({ id: "a", hasCode: false })], NOW)).toEqual([]);
  });

  it("user×lesson の最新合格提出は古くても残す。古い方の合格は対象", () => {
    const rows = [
      row({ id: "01A", passed: 1 }), // 古い合格(非最新)
      row({ id: "01B", passed: 1 }), // 最新合格(ULID 辞書順で新しい)
      row({ id: "01C", passed: 0 }), // 不合格
    ];
    expect(computeRetentionTargets(rows, NOW).sort()).toEqual(["01A", "01C"]);
  });

  it("最新合格の判定は user×lesson ごとに独立", () => {
    const rows = [
      row({ id: "01A", userId: "u1", lessonSlug: "html-01", passed: 1 }),
      row({ id: "01B", userId: "u1", lessonSlug: "html-02", passed: 1 }),
      row({ id: "01C", userId: "u2", lessonSlug: "html-01", passed: 1 }),
    ];
    // それぞれが自分のグループの最新合格 → 全部残す
    expect(computeRetentionTargets(rows, NOW)).toEqual([]);
  });

  it("最新合格が 90 日以内にある場合、古い合格・不合格はすべて対象", () => {
    const rows = [
      row({ id: "01A", passed: 1 }),
      row({ id: "01B", passed: 0 }),
      row({ id: "01Z", passed: 1, createdAt: RECENT }), // 最新合格(窓内なのでそもそも対象外)
    ];
    expect(computeRetentionTargets(rows, NOW).sort()).toEqual(["01A", "01B"]);
  });
});
