import { describe, expect, it } from "vitest";
import { ACHIEVEMENTS, type AchievementCtx } from "./achievements";

function ctx(partial?: {
  totalPassed?: number;
  currentStreak?: number;
  passedCountByCourse?: Record<string, number>;
  courseLessonCounts?: Record<string, number>;
}): AchievementCtx {
  return {
    stats: {
      currentStreak: partial?.currentStreak ?? 0,
      longestStreak: partial?.currentStreak ?? 0,
      totalPassed: partial?.totalPassed ?? 0,
    },
    passedCountByCourse: partial?.passedCountByCourse ?? {},
    courseLessonCounts: partial?.courseLessonCounts ?? {
      "html-basics": 10,
      "css-basics": 10,
      "js-basics": 12,
    },
    lessonSlug: "html-01-intro",
  };
}

function condition(id: string): (c: AchievementCtx) => boolean {
  const def = ACHIEVEMENTS.find((a) => a.id === id);
  if (!def) throw new Error(`achievement not found: ${id}`);
  return def.condition;
}

describe("ACHIEVEMENTS(MVP 9種 §2.5)", () => {
  it("9 種が定義され、id が一意で title/description/icon を持つ", () => {
    expect(ACHIEVEMENTS).toHaveLength(9);
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(9);
    expect(ACHIEVEMENTS.map((a) => a.id).sort()).toEqual(
      [
        "course_complete_css-basics",
        "course_complete_html-basics",
        "course_complete_js-basics",
        "first_pass",
        "passed_10",
        "passed_100",
        "passed_50",
        "streak_30",
        "streak_7",
      ].sort(),
    );
    for (const a of ACHIEVEMENTS) {
      expect(a.title.length).toBeGreaterThan(0);
      expect(a.description.length).toBeGreaterThan(0);
      expect(a.icon.length).toBeGreaterThan(0);
    }
  });

  it("first_pass: 合格 1 以上で成立", () => {
    expect(condition("first_pass")(ctx({ totalPassed: 0 }))).toBe(false);
    expect(condition("first_pass")(ctx({ totalPassed: 1 }))).toBe(true);
  });

  it("passed_10 / 50 / 100: 節目ちょうどで成立", () => {
    expect(condition("passed_10")(ctx({ totalPassed: 9 }))).toBe(false);
    expect(condition("passed_10")(ctx({ totalPassed: 10 }))).toBe(true);
    expect(condition("passed_50")(ctx({ totalPassed: 49 }))).toBe(false);
    expect(condition("passed_50")(ctx({ totalPassed: 50 }))).toBe(true);
    expect(condition("passed_100")(ctx({ totalPassed: 99 }))).toBe(false);
    expect(condition("passed_100")(ctx({ totalPassed: 100 }))).toBe(true);
  });

  it("streak_7 / 30: 現在ストリークで判定", () => {
    expect(condition("streak_7")(ctx({ currentStreak: 6 }))).toBe(false);
    expect(condition("streak_7")(ctx({ currentStreak: 7 }))).toBe(true);
    expect(condition("streak_30")(ctx({ currentStreak: 29 }))).toBe(false);
    expect(condition("streak_30")(ctx({ currentStreak: 30 }))).toBe(true);
  });

  it("course_complete: 全レッスン合格で成立", () => {
    const c = condition("course_complete_html-basics");
    expect(c(ctx({ passedCountByCourse: { "html-basics": 9 } }))).toBe(false);
    expect(c(ctx({ passedCountByCourse: { "html-basics": 10 } }))).toBe(true);
    // 他コースの合格は影響しない
    expect(c(ctx({ passedCountByCourse: { "css-basics": 10 } }))).toBe(false);
  });

  it("course_complete: レッスン数が不明(0 / 未定義)なら成立しない(0 >= 0 の誤発火防止)", () => {
    const c = condition("course_complete_html-basics");
    expect(c(ctx({ passedCountByCourse: {}, courseLessonCounts: {} }))).toBe(false);
    expect(
      c(ctx({ passedCountByCourse: { "html-basics": 0 }, courseLessonCounts: { "html-basics": 0 } })),
    ).toBe(false);
  });
});
