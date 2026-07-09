// バッジ定義(CONTRACTS §5)。クライアント安全 — DB 依存なし。
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

// STUB(F が実装): MVP 9種(first_pass / course_complete_* / passed_10・50・100 / streak_7・30)
export const ACHIEVEMENTS: AchievementDef[] = [];
