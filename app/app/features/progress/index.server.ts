// 進捗・提出・ゲーミフィケーションサービス(CONTRACTS §5 / DesignDoc §7, §9)。すべて server-only。
// DB 依存ロジック(ストリーク・JST・ヒント開放・レート制限・retention 抽出)は純粋関数
// (jst.ts / streak.ts / hints.ts / rate-limit.ts / retention.ts)に分離し vitest で検証している。
import type { FileMap } from "@codesteps/lesson-kit";
import { and, eq, inArray, isNotNull, lt, max, notInArray, sql } from "drizzle-orm";
import { ulid } from "ulidx";
import { z } from "zod";
import { getDb, schema } from "~/db";
import { track } from "~/features/analytics.server";
import { ACHIEVEMENTS } from "~/features/gamification/achievements";
import { evaluateNewAchievements } from "~/features/gamification/evaluate.server";
import type { Env } from "~/lib/env";
import { findCourseMeta, findLessonMeta, getContentVersion, listCourseMeta } from "./content-meta.server";
import { deriveHintState } from "./hints";
import { jstDateString } from "./jst";
import { evaluateRateLimit } from "./rate-limit";
import { RETENTION_MS } from "./retention";
import { applyPassToStreak } from "./streak";
import type {
  BadgeView,
  CourseDetail,
  CourseOverview,
  ExerciseState,
  LessonStatus,
  MypageData,
  SubmitResult,
  VerdictPayload,
} from "./types";

export type * from "./types";

// ---------------------------------------------------------------------------
// 内部ヘルパ
// ---------------------------------------------------------------------------

function jsonError(status: number, error: string): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

/** ユーザーの合格済み lessonSlug 集合(userId null は空) */
async function passedLessonSlugs(env: Env, userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set();
  const db = getDb(env);
  const rows = await db
    .select({ lessonSlug: schema.lessonProgress.lessonSlug })
    .from(schema.lessonProgress)
    .where(and(eq(schema.lessonProgress.userId, userId), eq(schema.lessonProgress.status, "passed")));
  return new Set(rows.map((r) => r.lessonSlug));
}

// ---------------------------------------------------------------------------
// 閲覧系
// ---------------------------------------------------------------------------

export async function getCoursesOverview(env: Env, userId: string | null): Promise<CourseOverview[]> {
  const courses = listCourseMeta();
  if (courses.length === 0) return [];
  const passed = await passedLessonSlugs(env, userId);
  return courses.map((course) => ({
    slug: course.slug,
    title: course.title,
    description: course.description,
    lessonCount: course.lessons.length,
    passedCount: course.lessons.filter((l) => passed.has(l.slug)).length,
    firstLessonSlug: course.lessons[0]?.slug ?? "",
  }));
}

export async function getCourseDetail(
  env: Env,
  userId: string | null,
  courseSlug: string,
): Promise<CourseDetail | null> {
  const course = findCourseMeta(courseSlug);
  if (!course) return null;

  const statusBySlug = new Map<string, LessonStatus>();
  if (userId) {
    const db = getDb(env);
    const rows = await db
      .select({ lessonSlug: schema.lessonProgress.lessonSlug, status: schema.lessonProgress.status })
      .from(schema.lessonProgress)
      .where(eq(schema.lessonProgress.userId, userId));
    for (const row of rows) statusBySlug.set(row.lessonSlug, row.status);
  }

  const lessons = course.lessons.map((l) => ({
    slug: l.slug,
    title: l.title,
    estMinutes: l.estMinutes,
    order: l.order,
    slideCount: l.slideCount,
    status: statusBySlug.get(l.slug) ?? "not_started",
  }));
  return {
    slug: course.slug,
    title: course.title,
    description: course.description,
    lessons,
    passedCount: lessons.filter((l) => l.status === "passed").length,
    lessonCount: lessons.length,
  };
}

export async function getExerciseState(env: Env, userId: string, lessonSlug: string): Promise<ExerciseState> {
  const db = getDb(env);
  const rows = await db
    .select()
    .from(schema.lessonProgress)
    .where(and(eq(schema.lessonProgress.userId, userId), eq(schema.lessonProgress.lessonSlug, lessonSlug)));
  const row = rows[0];
  const hintCount = findLessonMeta(lessonSlug)?.lesson.hintCount ?? 0;
  const failedCount = row?.failedCount ?? 0;
  return {
    status: row?.status ?? "not_started",
    failedCount,
    ...deriveHintState(failedCount, hintCount),
    solutionViewed: row?.solutionViewedAt != null,
  };
}

// ---------------------------------------------------------------------------
// 提出(§9.1, §9.2)
// ---------------------------------------------------------------------------

const verdictPayloadSchema = z.object({
  passed: z.boolean(),
  timedOut: z.boolean(),
  details: z.array(z.object({ checkId: z.string().min(1).max(200), passed: z.boolean() })).max(100),
});

const codeSchema = z.record(z.string().max(500), z.string());
const CODE_TOTAL_MAX = 200 * 1024; // 合計 200KB(SPEC F §1-1)

export async function submitVerdict(
  env: Env,
  userId: string,
  input: { lessonSlug: string; verdict: VerdictPayload; code: FileMap },
): Promise<SubmitResult> {
  const now = new Date();
  const nowMs = now.getTime();

  // 1. レート制限(§10.4): KV スライディングウィンドウ 30回/分
  const rlKey = `rl:${userId}`;
  const stored = await env.RATE_LIMIT_KV.get(rlKey, "json");
  const rl = evaluateRateLimit(stored, nowMs);
  if (rl.limited) {
    throw jsonError(429, "送信が多すぎます。少し待ってから再度お試しください。");
  }
  await env.RATE_LIMIT_KV.put(rlKey, JSON.stringify(rl.next), { expirationTtl: 120 });

  // 2. 入力検証(切詰めず 400)
  const verdictParsed = verdictPayloadSchema.safeParse(input.verdict);
  const codeParsed = codeSchema.safeParse(input.code);
  if (!verdictParsed.success || !codeParsed.success) {
    throw jsonError(400, "提出データの形式が正しくありません。");
  }
  const verdict = verdictParsed.data;
  const code = codeParsed.data;
  const codeSize = Object.entries(code).reduce((sum, [k, v]) => sum + k.length + v.length, 0);
  if (codeSize > CODE_TOTAL_MAX) {
    throw jsonError(400, "提出コードが大きすぎます。");
  }

  // 3. 教材メタの存在確認(content-meta.json が正)
  const lessonMeta = findLessonMeta(input.lessonSlug);
  if (!lessonMeta) {
    throw jsonError(404, "レッスンが見つかりません。");
  }
  const hintCount = lessonMeta.lesson.hintCount;

  // 4. 読み(§9.2): user_stats + lesson_progress
  const db = getDb(env);
  const [statsRows, progressRows] = await db.batch([
    db.select().from(schema.userStats).where(eq(schema.userStats.userId, userId)),
    db
      .select()
      .from(schema.lessonProgress)
      .where(
        and(eq(schema.lessonProgress.userId, userId), eq(schema.lessonProgress.lessonSlug, input.lessonSlug)),
      ),
  ]);
  const statsRow = statsRows[0];
  const progressRow = progressRows[0];

  const submissionInsert = db.insert(schema.submissions).values({
    id: ulid(),
    userId,
    lessonSlug: input.lessonSlug,
    passed: verdict.passed ? 1 : 0,
    timedOut: verdict.timedOut ? 1 : 0,
    details: JSON.stringify(verdict.details),
    code: JSON.stringify(code),
    contentVersion: getContentVersion(),
    createdAt: now,
  });

  track(env, "submit", { lessonSlug: input.lessonSlug });

  if (!verdict.passed) {
    // 不合格(§9.2): submissions INSERT + failed_count+1 のみ
    await db.batch([
      submissionInsert,
      db
        .insert(schema.lessonProgress)
        .values({
          userId,
          lessonSlug: input.lessonSlug,
          status: "in_progress",
          failedCount: 1,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [schema.lessonProgress.userId, schema.lessonProgress.lessonSlug],
          set: {
            failedCount: sql`${schema.lessonProgress.failedCount} + 1`,
            updatedAt: now,
          },
        }),
    ]);
    const failedCount = (progressRow?.failedCount ?? 0) + 1;
    return {
      passed: false,
      streak: null,
      newBadges: [],
      ...deriveHintState(failedCount, hintCount),
    };
  }

  // 5. 合格(§9.2): db.batch が原子性の単位
  const today = jstDateString(nowMs);
  const streak = applyPassToStreak(
    {
      currentStreak: statsRow?.currentStreak ?? 0,
      longestStreak: statsRow?.longestStreak ?? 0,
      lastActiveDate: statsRow?.lastActiveDate ?? null,
    },
    today,
  );
  // total_passed はそのレッスンの初合格時のみ +1(passed_10 系バッジ = レッスン数の節目。SPEC F §1-1)
  const firstPass = progressRow?.status !== "passed";
  const totalPassed = (statsRow?.totalPassed ?? 0) + (firstPass ? 1 : 0);

  await db.batch([
    submissionInsert,
    db
      .insert(schema.lessonProgress)
      .values({
        userId,
        lessonSlug: input.lessonSlug,
        status: "passed",
        failedCount: 0,
        firstPassedAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [schema.lessonProgress.userId, schema.lessonProgress.lessonSlug],
        set: {
          status: "passed",
          // 初回のみ set(既存値優先 — coalesce)
          firstPassedAt: sql`coalesce(${schema.lessonProgress.firstPassedAt}, ${nowMs})`,
          updatedAt: now,
        },
      }),
    db.insert(schema.dailyActivity).values({ userId, activityDate: today }).onConflictDoNothing(),
    db
      .insert(schema.userStats)
      .values({
        userId,
        currentStreak: streak.current,
        longestStreak: streak.longest,
        lastActiveDate: today,
        totalPassed,
      })
      .onConflictDoUpdate({
        target: schema.userStats.userId,
        set: {
          currentStreak: streak.current,
          longestStreak: streak.longest,
          lastActiveDate: today,
          // 相対インクリメント: 別レッスンの同時初合格で「読み値+1」の後勝ち書き込みが
          // 片方の +1 を踏み潰す lost update を避ける(streak は絶対値収束するため対象外)
          ...(firstPass ? { totalPassed: sql`${schema.userStats.totalPassed} + 1` } : {}),
        },
      }),
  ]);

  // 6. バッジ評価(§9.3): batch 外。PK(INSERT OR IGNORE)で冪等
  const newBadges = await evaluateNewAchievements(
    env,
    userId,
    {
      stats: { currentStreak: streak.current, longestStreak: streak.longest, totalPassed },
      lessonSlug: input.lessonSlug,
    },
    now,
  );

  track(env, "pass", { lessonSlug: input.lessonSlug });

  const failedCount = progressRow?.failedCount ?? 0;
  return {
    passed: true,
    streak: { current: streak.current, longest: streak.longest, extended: streak.extended },
    newBadges,
    ...deriveHintState(failedCount, hintCount),
  };
}

// ---------------------------------------------------------------------------
// 答えの閲覧記録(§2.4, §9.4)
// ---------------------------------------------------------------------------

export async function markSolutionViewed(env: Env, userId: string, lessonSlug: string): Promise<void> {
  const db = getDb(env);
  const now = new Date();
  await db
    .insert(schema.lessonProgress)
    .values({ userId, lessonSlug, status: "in_progress", solutionViewedAt: now, updatedAt: now })
    .onConflictDoUpdate({
      target: [schema.lessonProgress.userId, schema.lessonProgress.lessonSlug],
      set: {
        // 初回閲覧時刻を保持(既存値優先)
        solutionViewedAt: sql`coalesce(${schema.lessonProgress.solutionViewedAt}, ${now.getTime()})`,
        updatedAt: now,
      },
    });
}

// ---------------------------------------------------------------------------
// マイページ(§2.2)
// ---------------------------------------------------------------------------

export async function getMypage(env: Env, userId: string): Promise<MypageData> {
  const db = getDb(env);

  // user×lesson の最新合格提出(id = ULID なので max(id) が最新)
  const latestPassedIds = db
    .select({ id: max(schema.submissions.id) })
    .from(schema.submissions)
    .where(and(eq(schema.submissions.userId, userId), eq(schema.submissions.passed, 1)))
    .groupBy(schema.submissions.lessonSlug);

  const [statsRows, achievementRows, progressRows, solutionRows] = await db.batch([
    db.select().from(schema.userStats).where(eq(schema.userStats.userId, userId)),
    db.select().from(schema.userAchievements).where(eq(schema.userAchievements.userId, userId)),
    db
      .select({ lessonSlug: schema.lessonProgress.lessonSlug, status: schema.lessonProgress.status })
      .from(schema.lessonProgress)
      .where(eq(schema.lessonProgress.userId, userId)),
    db
      .select({ lessonSlug: schema.submissions.lessonSlug, code: schema.submissions.code })
      .from(schema.submissions)
      .where(and(inArray(schema.submissions.id, latestPassedIds), isNotNull(schema.submissions.code))),
  ]);

  const statsRow = statsRows[0];
  const stats = {
    totalPassed: statsRow?.totalPassed ?? 0,
    currentStreak: statsRow?.currentStreak ?? 0,
    longestStreak: statsRow?.longestStreak ?? 0,
  };

  // バッジ: 定義順で earned / locked に分ける
  const earnedAtById = new Map(achievementRows.map((r) => [r.achievementId, r.earnedAt.getTime()]));
  const earned: BadgeView[] = [];
  const locked: BadgeView[] = [];
  for (const def of ACHIEVEMENTS) {
    const earnedAt = earnedAtById.get(def.id);
    const view: BadgeView = {
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.icon,
      earnedAt: earnedAt ?? null,
    };
    if (earnedAt !== undefined) earned.push(view);
    else locked.push(view);
  }

  // 進捗マップ(resume・コース別進捗の導出元)
  const statusBySlug = new Map<string, LessonStatus>();
  for (const row of progressRows) statusBySlug.set(row.lessonSlug, row.status);

  const courses = listCourseMeta();
  const courseOverviews: CourseOverview[] = courses.map((course) => ({
    slug: course.slug,
    title: course.title,
    description: course.description,
    lessonCount: course.lessons.length,
    passedCount: course.lessons.filter((l) => statusBySlug.get(l.slug) === "passed").length,
    firstLessonSlug: course.lessons[0]?.slug ?? "",
  }));

  // resume 規則(§2.2 / SPEC F §1): 最初の in_progress → exercise、なければ最初の not_started → slides/1
  let firstInProgress: MypageData["resume"] = null;
  let firstNotStarted: MypageData["resume"] = null;
  for (const course of courses) {
    for (const lesson of course.lessons) {
      const status = statusBySlug.get(lesson.slug) ?? "not_started";
      if (status === "in_progress" && !firstInProgress) {
        firstInProgress = {
          courseSlug: course.slug,
          courseTitle: course.title,
          lessonSlug: lesson.slug,
          lessonTitle: lesson.title,
          target: "exercise",
        };
      }
      if (status === "not_started" && !firstNotStarted) {
        firstNotStarted = {
          courseSlug: course.slug,
          courseTitle: course.title,
          lessonSlug: lesson.slug,
          lessonTitle: lesson.title,
          target: "slides",
        };
      }
    }
  }
  const resume = firstInProgress ?? firstNotStarted;

  // 自分の解答: 最新合格コードを教材順に(教材改訂で消えたレッスンは表示しない)
  const codeBySlug = new Map<string, string>();
  for (const row of solutionRows) {
    if (row.code != null) codeBySlug.set(row.lessonSlug, row.code);
  }
  const solutions: MypageData["solutions"] = [];
  for (const course of courses) {
    for (const lesson of course.lessons) {
      const rawCode = codeBySlug.get(lesson.slug);
      if (rawCode === undefined) continue;
      const parsed = parseFileMap(rawCode);
      if (parsed) solutions.push({ lessonSlug: lesson.slug, lessonTitle: lesson.title, code: parsed });
    }
  }

  return { stats, badges: { earned, locked }, courses: courseOverviews, solutions, resume };
}

function parseFileMap(raw: string): FileMap | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (value === null || typeof value !== "object" || Array.isArray(value)) return null;
    const out: FileMap = {};
    for (const [k, v] of Object.entries(value)) {
      if (typeof v === "string") out[k] = v;
    }
    return out;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// retention(§7.5)— workers/app.ts の scheduled から呼ぶ
// ---------------------------------------------------------------------------

export async function runRetention(env: Env, now: Date = new Date()): Promise<{ cleared: number }> {
  const db = getDb(env);
  const cutoff = new Date(now.getTime() - RETENTION_MS);

  // 抽出条件は retention.ts(computeRetentionTargets)の SQL 写し。変更時は両方を揃える。
  const latestPassedIds = db
    .select({ id: max(schema.submissions.id) })
    .from(schema.submissions)
    .where(eq(schema.submissions.passed, 1))
    .groupBy(schema.submissions.userId, schema.submissions.lessonSlug);

  const targets = await db
    .select({ id: schema.submissions.id })
    .from(schema.submissions)
    .where(
      and(
        lt(schema.submissions.createdAt, cutoff),
        isNotNull(schema.submissions.code),
        notInArray(schema.submissions.id, latestPassedIds),
      ),
    );

  if (targets.length === 0) return { cleared: 0 };

  // D1 のバインド変数上限を避けて 50 件ずつ NULL 化
  const updates = [];
  for (let i = 0; i < targets.length; i += 50) {
    const ids = targets.slice(i, i + 50).map((t) => t.id);
    updates.push(
      db.update(schema.submissions).set({ code: null }).where(inArray(schema.submissions.id, ids)),
    );
  }
  const [first, ...rest] = updates;
  if (first) await db.batch([first, ...rest]);

  return { cleared: targets.length };
}
