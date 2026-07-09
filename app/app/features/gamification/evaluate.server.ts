// バッジ評価(DesignDoc §9.3)。合格処理の直後に呼ぶ。INSERT OR IGNORE で冪等。
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "~/db";
import { courseLessonCounts, courseSlugByLesson } from "~/features/progress/content-meta.server";
import type { Env } from "~/lib/env";
import { ACHIEVEMENTS, type AchievementCtx } from "./achievements";

export type NewBadge = { id: string; title: string; description: string; icon: string };

/**
 * ACHIEVEMENTS を評価し、新規成立分を user_achievements へ INSERT OR IGNORE して返す。
 * stats は合格処理で更新した後の値を呼び出し側から渡す(§9.2 の直後評価)。
 */
export async function evaluateNewAchievements(
  env: Env,
  userId: string,
  input: {
    stats: { currentStreak: number; longestStreak: number; totalPassed: number };
    lessonSlug: string;
  },
  now: Date = new Date(),
): Promise<NewBadge[]> {
  const db = getDb(env);
  const [passedRows, earnedRows] = await db.batch([
    db
      .select({ lessonSlug: schema.lessonProgress.lessonSlug })
      .from(schema.lessonProgress)
      .where(and(eq(schema.lessonProgress.userId, userId), eq(schema.lessonProgress.status, "passed"))),
    db
      .select({ achievementId: schema.userAchievements.achievementId })
      .from(schema.userAchievements)
      .where(eq(schema.userAchievements.userId, userId)),
  ]);

  const lessonToCourse = courseSlugByLesson();
  const passedCountByCourse: Record<string, number> = {};
  for (const row of passedRows) {
    const courseSlug = lessonToCourse.get(row.lessonSlug);
    if (!courseSlug) continue; // 教材改訂で消えたレッスンは数えない
    passedCountByCourse[courseSlug] = (passedCountByCourse[courseSlug] ?? 0) + 1;
  }

  const ctx: AchievementCtx = {
    stats: input.stats,
    passedCountByCourse,
    courseLessonCounts: courseLessonCounts(),
    lessonSlug: input.lessonSlug,
  };

  const earned = new Set(earnedRows.map((r) => r.achievementId));
  const newOnes = ACHIEVEMENTS.filter((a) => !earned.has(a.id) && a.condition(ctx));
  if (newOnes.length > 0) {
    await db
      .insert(schema.userAchievements)
      .values(newOnes.map((a) => ({ userId, achievementId: a.id, earnedAt: now })))
      .onConflictDoNothing();
  }
  return newOnes.map(({ id, title, description, icon }) => ({ id, title, description, icon }));
}
