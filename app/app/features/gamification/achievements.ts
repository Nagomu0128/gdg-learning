// バッジ定義(DesignDoc §2.5, §9.3 / CONTRACTS §5)。クライアント安全 — DB 依存なし。
export type AchievementCtx = {
  stats: { currentStreak: number; longestStreak: number; totalPassed: number };
  passedCountByCourse: Record<string, number>;
  courseLessonCounts: Record<string, number>;
  lessonSlug: string;
};

export type AchievementDef = {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (ctx: AchievementCtx) => boolean;
};

function courseComplete(courseSlug: string): (ctx: AchievementCtx) => boolean {
  return (ctx) => {
    const total = ctx.courseLessonCounts[courseSlug] ?? 0;
    return total > 0 && (ctx.passedCountByCourse[courseSlug] ?? 0) >= total;
  };
}

function totalPassedAtLeast(n: number): (ctx: AchievementCtx) => boolean {
  return (ctx) => ctx.stats.totalPassed >= n;
}

function streakAtLeast(n: number): (ctx: AchievementCtx) => boolean {
  return (ctx) => ctx.stats.currentStreak >= n;
}

// MVP 9 種(§2.5)。description は未獲得表示の条件文を兼ねる。
export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first_pass",
    title: "はじめの一歩",
    description: "はじめて演習に合格する",
    icon: "🎉",
    condition: totalPassedAtLeast(1),
  },
  {
    id: "course_complete_html-basics",
    title: "HTMLマスター",
    description: "HTML入門の全レッスンに合格する",
    icon: "🏆",
    condition: courseComplete("html-basics"),
  },
  {
    id: "course_complete_css-basics",
    title: "CSSマスター",
    description: "CSS入門の全レッスンに合格する",
    icon: "🎨",
    condition: courseComplete("css-basics"),
  },
  {
    id: "course_complete_js-basics",
    title: "JSマスター",
    description: "JS入門の全レッスンに合格する",
    icon: "⚡",
    condition: courseComplete("js-basics"),
  },
  {
    id: "passed_10",
    title: "10レッスン達成",
    description: "累計10レッスンに合格する",
    icon: "🔟",
    condition: totalPassedAtLeast(10),
  },
  {
    id: "passed_50",
    title: "50レッスン達成",
    description: "累計50レッスンに合格する",
    icon: "🌟",
    condition: totalPassedAtLeast(50),
  },
  {
    id: "passed_100",
    title: "100レッスン達成",
    description: "累計100レッスンに合格する",
    icon: "💯",
    condition: totalPassedAtLeast(100),
  },
  {
    id: "streak_7",
    title: "7日連続",
    description: "7日連続で演習に合格する",
    icon: "🔥",
    condition: streakAtLeast(7),
  },
  {
    id: "streak_30",
    title: "30日連続",
    description: "30日連続で演習に合格する",
    icon: "🚀",
    condition: streakAtLeast(30),
  },
];
