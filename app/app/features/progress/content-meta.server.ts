// content-meta.json(B の codegen 出力)の型付きアクセサ。教材メタの正はこのファイル(§7.1: DB に教材テーブルはない)。
// codegen 未実行のスタブ(courses: [])でも壊れないよう null ガードを徹底する。
import rawContentMeta from "~/generated/content-meta.json";

export type ContentLessonMeta = {
  slug: string;
  title: string;
  estMinutes: number;
  runner: "dom" | "worker";
  order: number;
  slideCount: number;
  hintCount: number;
};

export type ContentCourseMeta = {
  slug: string;
  title: string;
  description: string;
  lessons: ContentLessonMeta[];
};

export type ContentMeta = {
  contentVersion: string;
  courses: ContentCourseMeta[];
};

const raw = rawContentMeta as { contentVersion?: unknown; courses?: unknown };

const contentMeta: ContentMeta = {
  contentVersion: typeof raw.contentVersion === "string" ? raw.contentVersion : "dev",
  courses: Array.isArray(raw.courses) ? (raw.courses as ContentCourseMeta[]) : [],
};

export function getContentVersion(): string {
  return contentMeta.contentVersion;
}

/** コース一覧(content-meta の並び順 = 表示順)。レッスンは order 昇順に整列済みで返す */
export function listCourseMeta(): ContentCourseMeta[] {
  return contentMeta.courses.map((course) => ({
    ...course,
    lessons: [...(course.lessons ?? [])].sort((a, b) => a.order - b.order),
  }));
}

export function findCourseMeta(courseSlug: string): ContentCourseMeta | null {
  return listCourseMeta().find((c) => c.slug === courseSlug) ?? null;
}

export function findLessonMeta(
  lessonSlug: string,
): { course: ContentCourseMeta; lesson: ContentLessonMeta } | null {
  for (const course of listCourseMeta()) {
    const lesson = course.lessons.find((l) => l.slug === lessonSlug);
    if (lesson) return { course, lesson };
  }
  return null;
}

/** lessonSlug → courseSlug の対応表 */
export function courseSlugByLesson(): Map<string, string> {
  const map = new Map<string, string>();
  for (const course of listCourseMeta()) {
    for (const lesson of course.lessons) {
      map.set(lesson.slug, course.slug);
    }
  }
  return map;
}

/** courseSlug → レッスン総数(バッジ評価 ctx 用) */
export function courseLessonCounts(): Record<string, number> {
  return Object.fromEntries(listCourseMeta().map((c) => [c.slug, c.lessons.length]));
}
