import { describe, expect, it } from "vitest";
import { applyPassToStreak } from "./streak";

const TODAY = "2026-07-09";

describe("applyPassToStreak(DesignDoc §9.2 のストリーク規則)", () => {
  it("初アクティビティ(last_active_date が null)→ 1 にセット・extended", () => {
    const r = applyPassToStreak({ currentStreak: 0, longestStreak: 0, lastActiveDate: null }, TODAY);
    expect(r).toEqual({ current: 1, longest: 1, lastActiveDate: TODAY, extended: true });
  });

  it("last == today → 変更なし・extended false", () => {
    const r = applyPassToStreak({ currentStreak: 5, longestStreak: 8, lastActiveDate: TODAY }, TODAY);
    expect(r).toEqual({ current: 5, longest: 8, lastActiveDate: TODAY, extended: false });
  });

  it("last == 昨日 → +1・extended", () => {
    const r = applyPassToStreak({ currentStreak: 5, longestStreak: 8, lastActiveDate: "2026-07-08" }, TODAY);
    expect(r).toEqual({ current: 6, longest: 8, lastActiveDate: TODAY, extended: true });
  });

  it("+1 が longest を超えたら longest も更新", () => {
    const r = applyPassToStreak({ currentStreak: 8, longestStreak: 8, lastActiveDate: "2026-07-08" }, TODAY);
    expect(r.current).toBe(9);
    expect(r.longest).toBe(9);
  });

  it("2日以上空いたら 1 にリセット(longest は維持)", () => {
    const r = applyPassToStreak({ currentStreak: 5, longestStreak: 8, lastActiveDate: "2026-07-07" }, TODAY);
    expect(r).toEqual({ current: 1, longest: 8, lastActiveDate: TODAY, extended: true });
  });

  it("月跨ぎの昨日も継続と判定(7/1 に対する 6/30)", () => {
    const r = applyPassToStreak(
      { currentStreak: 3, longestStreak: 3, lastActiveDate: "2026-06-30" },
      "2026-07-01",
    );
    expect(r.current).toBe(4);
    expect(r.extended).toBe(true);
  });

  it("未来日が last に入っていても安全にリセット扱い", () => {
    const r = applyPassToStreak({ currentStreak: 5, longestStreak: 8, lastActiveDate: "2026-07-20" }, TODAY);
    expect(r.current).toBe(1);
  });
});
