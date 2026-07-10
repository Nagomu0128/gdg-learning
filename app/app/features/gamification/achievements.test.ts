import { describe, expect, it } from "vitest";
import { type AchievementCourse, type AchievementCtx, buildAchievements } from "./achievements";

// 実カリキュラム(CURRICULUM-2 / ADR #19)を模したコース一覧(content-meta の表示順)
const COURSES: AchievementCourse[] = [
  { slug: "html-basics", title: "HTML入門", level: "basic" },
  { slug: "css-basics", title: "CSS入門", level: "basic" },
  { slug: "js-basics", title: "JavaScript入門", level: "basic" },
  { slug: "html-intermediate", title: "HTML中級", level: "intermediate" },
  { slug: "css-intermediate", title: "CSS中級", level: "intermediate" },
  { slug: "js-intermediate", title: "JavaScript中級", level: "intermediate" },
  { slug: "html-advanced", title: "HTML上級", level: "advanced" },
  { slug: "css-advanced", title: "CSS上級", level: "advanced" },
  { slug: "js-advanced", title: "JavaScript上級", level: "advanced" },
  { slug: "capstone-projects", title: "応用編: つくってみよう", level: "capstone" },
];

const ACHIEVEMENTS = buildAchievements(COURSES);

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
      "html-intermediate": 10,
    },
    lessonSlug: "html-01-intro",
  };
}

function condition(id: string): (c: AchievementCtx) => boolean {
  const def = ACHIEVEMENTS.find((a) => a.id === id);
  if (!def) throw new Error(`achievement not found: ${id}`);
  return def.condition;
}

describe("buildAchievements(固定 6 種 + course_complete_* の動的導出)", () => {
  it("固定 6 種 + コース数ぶんの course_complete_* が定義され、id が一意で title/description/icon を持つ", () => {
    expect(ACHIEVEMENTS).toHaveLength(6 + COURSES.length);
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length);
    for (const a of ACHIEVEMENTS) {
      expect(a.title.length).toBeGreaterThan(0);
      expect(a.description.length).toBeGreaterThan(0);
      expect(a.icon.length).toBeGreaterThan(0);
    }
  });

  it("表示順(= me.tsx の定義順): first_pass → コース修了(コース表示順)→ 節目・ストリーク", () => {
    expect(ACHIEVEMENTS.map((a) => a.id)).toEqual([
      "first_pass",
      ...COURSES.map((c) => `course_complete_${c.slug}`),
      "passed_10",
      "passed_50",
      "passed_100",
      "streak_7",
      "streak_30",
    ]);
  });

  it("DB 保存済みの初期 3 バッジは id / title / description / icon を 1 文字も変えない(凍結)", () => {
    const byId = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));
    expect(byId.get("course_complete_html-basics")).toMatchObject({
      title: "HTMLマスター",
      description: "HTML入門の全レッスンに合格する",
      icon: "🏆",
    });
    expect(byId.get("course_complete_css-basics")).toMatchObject({
      title: "CSSマスター",
      description: "CSS入門の全レッスンに合格する",
      icon: "🎨",
    });
    expect(byId.get("course_complete_js-basics")).toMatchObject({
      title: "JSマスター",
      description: "JS入門の全レッスンに合格する",
      icon: "⚡",
    });
  });

  it("新コースは系統 × レベルから title / icon を導出し、description はコースタイトルから導出する", () => {
    const byId = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));
    expect(byId.get("course_complete_html-intermediate")).toMatchObject({
      title: "HTML中級マスター",
      description: "HTML中級の全レッスンに合格する",
      icon: "🏆",
    });
    expect(byId.get("course_complete_css-advanced")).toMatchObject({
      title: "CSS上級マスター",
      description: "CSS上級の全レッスンに合格する",
      icon: "🎨",
    });
    expect(byId.get("course_complete_js-intermediate")).toMatchObject({
      title: "JS中級マスター",
      description: "JavaScript中級の全レッスンに合格する",
      icon: "⚡",
    });
    expect(byId.get("course_complete_js-advanced")).toMatchObject({ title: "JS上級マスター", icon: "⚡" });
  });

  it("系統外(応用編)はコースタイトルの区切り前から導出する", () => {
    const cap = ACHIEVEMENTS.find((a) => a.id === "course_complete_capstone-projects");
    expect(cap).toMatchObject({
      title: "応用編マスター",
      description: "応用編の全レッスンに合格する",
      icon: "🛠️",
    });
  });

  it("level 欠損・未知は basic 扱いで導出する(旧 content-meta 互換)", () => {
    const [, badge] = buildAchievements([{ slug: "html-extra", title: "HTML特別編" }]);
    expect(badge).toMatchObject({ id: "course_complete_html-extra", title: "HTMLマスター", icon: "🏆" });
    const [, badge2] = buildAchievements([{ slug: "html-extra", title: "HTML特別編", level: "expert" }]);
    expect(badge2).toMatchObject({ title: "HTMLマスター" });
  });

  it("コース一覧が空(codegen 未実行スタブ)でも固定 6 種は返す", () => {
    const built = buildAchievements([]);
    expect(built.map((a) => a.id)).toEqual([
      "first_pass",
      "passed_10",
      "passed_50",
      "passed_100",
      "streak_7",
      "streak_30",
    ]);
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

  it("course_complete: 全レッスン合格で成立(動的生成されたコースも同じ規則)", () => {
    const c = condition("course_complete_html-basics");
    expect(c(ctx({ passedCountByCourse: { "html-basics": 9 } }))).toBe(false);
    expect(c(ctx({ passedCountByCourse: { "html-basics": 10 } }))).toBe(true);
    // 他コースの合格は影響しない
    expect(c(ctx({ passedCountByCourse: { "css-basics": 10 } }))).toBe(false);

    const cInt = condition("course_complete_html-intermediate");
    expect(cInt(ctx({ passedCountByCourse: { "html-intermediate": 9 } }))).toBe(false);
    expect(cInt(ctx({ passedCountByCourse: { "html-intermediate": 10 } }))).toBe(true);
  });

  it("course_complete: レッスン数が不明(0 / 未定義)なら成立しない(0 >= 0 の誤発火防止)", () => {
    const c = condition("course_complete_html-basics");
    expect(c(ctx({ passedCountByCourse: {}, courseLessonCounts: {} }))).toBe(false);
    expect(
      c(ctx({ passedCountByCourse: { "html-basics": 0 }, courseLessonCounts: { "html-basics": 0 } })),
    ).toBe(false);
  });
});
