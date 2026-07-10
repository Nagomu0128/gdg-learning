// バッジ定義(DesignDoc §2.5, §9.3 / CONTRACTS §5)。クライアント安全 — DB・server 専用モジュール依存なし。
// course_complete_* はコース一覧から動的導出する(CURRICULUM-2 プラットフォーム変更 3)。
// コース一覧(content-meta 由来)は achievements.server.ts が buildAchievements に注入する —
// ここで content-meta.server を import するとクライアントバンドルが壊れるため、必ず引数注入にする。
// 相対 import(vitest は "~" alias を解決しない — 純粋モジュール同士は相対参照で結ぶ)
import { type CourseLevel, normalizeLevel } from "../progress/levels";

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

/** buildAchievements に注入するコース情報(content-meta の該当フィールドの部分集合) */
export type AchievementCourse = { slug: string; title: string; level?: string | null };

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

// ---------------------------------------------------------------------------
// course_complete_* の表示(title / description / icon)導出
// ---------------------------------------------------------------------------

/**
 * DB 保存済みの初期 3 バッジ(user_achievements.achievement_id が earned 行から参照)。
 * 導出規則を変えてもここは凍結 — id はもちろん title / description / icon も 1 文字も変えない。
 */
const FROZEN_COURSE_BADGES: Record<string, Pick<AchievementDef, "title" | "description" | "icon">> = {
  "html-basics": { title: "HTMLマスター", description: "HTML入門の全レッスンに合格する", icon: "🏆" },
  "css-basics": { title: "CSSマスター", description: "CSS入門の全レッスンに合格する", icon: "🎨" },
  "js-basics": { title: "JSマスター", description: "JS入門の全レッスンに合格する", icon: "⚡" },
};

/** slug の系統(levels.ts の courseAccent と同じ規則)ごとの表示名・アイコン。初期 3 バッジのトーンを踏襲 */
const FAMILIES = [
  { prefix: "html", label: "HTML", icon: "🏆" },
  { prefix: "css", label: "CSS", icon: "🎨" },
  { prefix: "js", label: "JS", icon: "⚡" },
] as const;

const LEVEL_TITLE_SUFFIX: Record<CourseLevel, string> = {
  basic: "",
  intermediate: "中級",
  advanced: "上級",
  capstone: "応用",
};

function deriveCourseBadge(
  course: AchievementCourse,
): Pick<AchievementDef, "title" | "description" | "icon"> {
  const family = FAMILIES.find((f) => course.slug === f.prefix || course.slug.startsWith(`${f.prefix}-`));
  if (family) {
    // 例: html-intermediate →「HTML中級マスター / HTML中級の全レッスンに合格する / 🏆」
    return {
      title: `${family.label}${LEVEL_TITLE_SUFFIX[normalizeLevel(course.level)]}マスター`,
      description: `${course.title}の全レッスンに合格する`,
      icon: family.icon,
    };
  }
  // 系統外(応用編など): コースタイトルから導出(「応用編: つくってみよう」→「応用編」)
  const label = course.title.split(/[:：]/, 1)[0]?.trim() || course.title;
  return { title: `${label}マスター`, description: `${label}の全レッスンに合格する`, icon: "🛠️" };
}

// ---------------------------------------------------------------------------
// バッジ定義の組み立て
// ---------------------------------------------------------------------------

/**
 * バッジ定義を組み立てる(MVP 9 種 §2.5 の一般化)。course_complete_{slug} はコース一覧から
 * 動的生成し、表示順(me.tsx は定義順で表示)は「first_pass → コース修了(コース表示順)→
 * 節目・ストリーク」。コース一覧が空(codegen 未実行スタブ)でも固定 6 種は返る。
 */
export function buildAchievements(courses: readonly AchievementCourse[]): AchievementDef[] {
  return [
    {
      id: "first_pass",
      title: "はじめの一歩",
      description: "はじめて演習に合格する",
      icon: "🎉",
      condition: totalPassedAtLeast(1),
    },
    ...courses.map((course) => ({
      id: `course_complete_${course.slug}`,
      ...(FROZEN_COURSE_BADGES[course.slug] ?? deriveCourseBadge(course)),
      condition: courseComplete(course.slug),
    })),
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
}
