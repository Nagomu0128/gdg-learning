// アプリ側テーブル(DesignDoc §7.2 の DDL に忠実 — 変更は DesignDoc 改訂が先)。
// オーケストレーター執筆・凍結。マイグレーション生成と適用は C が所有。

import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

export * from "./auth-schema";

export const lessonProgress = sqliteTable(
  "lesson_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lessonSlug: text("lesson_slug").notNull(),
    // CHECK (status IN ('in_progress','passed')) — D1/SQLite の CHECK はマイグレーション SQL 側で担保
    status: text("status", { enum: ["in_progress", "passed"] })
      .notNull()
      .default("in_progress"),
    failedCount: integer("failed_count").notNull().default(0),
    firstPassedAt: integer("first_passed_at", { mode: "timestamp_ms" }),
    solutionViewedAt: integer("solution_viewed_at", { mode: "timestamp_ms" }),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonSlug] })],
);

export const submissions = sqliteTable(
  "submissions",
  {
    id: text("id").primaryKey(), // ULID(時系列ソート可能)
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lessonSlug: text("lesson_slug").notNull(),
    passed: integer("passed").notNull(), // 0 / 1
    timedOut: integer("timed_out").notNull().default(0),
    details: text("details").notNull(), // JSON: [{checkId, passed}]
    code: text("code"), // FileMap の JSON。90日で NULL 化(§7.5)
    contentVersion: text("content_version").notNull(), // ビルド時埋め込みの git 短 SHA(§7.2)
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    index("idx_sub_user_lesson").on(t.userId, t.lessonSlug, t.createdAt),
    index("idx_sub_lesson").on(t.lessonSlug, t.passed),
  ],
);

export const dailyActivity = sqliteTable(
  "daily_activity",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    activityDate: text("activity_date").notNull(), // 'YYYY-MM-DD'(JST 基準)
    // [冪等性] 同日重複を PK で無害化(§7.2)
  },
  (t) => [primaryKey({ columns: [t.userId, t.activityDate] })],
);

export const userStats = sqliteTable("user_stats", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: text("last_active_date"),
  totalPassed: integer("total_passed").notNull().default(0),
});

export const userAchievements = sqliteTable(
  "user_achievements",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    achievementId: text("achievement_id").notNull(),
    earnedAt: integer("earned_at", { mode: "timestamp_ms" }).notNull(),
    // [冪等性] 二重付与を PK で無害化(§7.2)
  },
  (t) => [primaryKey({ columns: [t.userId, t.achievementId] })],
);
