// コースレベル(CURRICULUM-2 / ADR #19)。content-meta の course.level を UI 表示用に
// グループ化する純粋ロジック。旧 content-meta(level フィールド無し)でも壊れないよう
// 未知・欠損は "basic" に正規化する(null 安全)。
export const COURSE_LEVELS = ["basic", "intermediate", "advanced", "capstone"] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

export const LEVEL_LABELS: Record<CourseLevel, string> = {
  basic: "基礎編",
  intermediate: "中級編",
  advanced: "上級編",
  capstone: "応用編",
};

/** level の欠損・未知の値を "basic" に倒す(旧 content-meta 互換) */
export function normalizeLevel(value: unknown): CourseLevel {
  return (COURSE_LEVELS as readonly unknown[]).includes(value) ? (value as CourseLevel) : "basic";
}

export type LevelSection<T> = { level: CourseLevel; label: string; courses: T[] };

/**
 * コース配列を level ごとにグループ化し、コースが 1 件以上あるレベルだけを
 * 基礎 → 中級 → 上級 → 応用 の順で返す。コース側の並び順(content-meta 順)は保持する。
 */
export function groupCoursesByLevel<T extends { level?: string | null }>(
  courses: readonly (T | null | undefined)[] | null | undefined,
): LevelSection<T>[] {
  const buckets = new Map<CourseLevel, T[]>();
  for (const course of courses ?? []) {
    if (!course) continue;
    const level = normalizeLevel(course.level);
    const list = buckets.get(level);
    if (list) list.push(course);
    else buckets.set(level, [course]);
  }
  const sections: LevelSection<T>[] = [];
  for (const level of COURSE_LEVELS) {
    const list = buckets.get(level);
    if (list && list.length > 0) sections.push({ level, label: LEVEL_LABELS[level], courses: list });
  }
  return sections;
}

/** コースカードのアクセントカラー(GDG カラー。slug の系統で決める — コース数が増えても破綻しない) */
export function courseAccent(slug: string): string {
  if (slug.startsWith("html")) return "var(--gdg-red)";
  if (slug.startsWith("css")) return "var(--gdg-blue)";
  if (slug.startsWith("js")) return "var(--gdg-yellow)";
  return "var(--gdg-green)";
}
