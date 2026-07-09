// content-meta.json(B の codegen 生成物 — CONTRACTS §3.1)をスライドルートが読むための型と解決関数。
// スタブ(courses: [])や欠損フィールドでも壊れないよう null ガードする(SPEC D §5)。
export type ContentMetaLesson = {
  slug: string;
  title: string;
  estMinutes: number;
  runner: "dom" | "worker";
  order: number;
  slideCount: number;
  hintCount: number;
};

export type ContentMetaCourse = {
  slug: string;
  title: string;
  description: string;
  lessons: ContentMetaLesson[];
};

export type ContentMeta = {
  contentVersion: string;
  courses: ContentMetaCourse[];
};

export type LessonSlideContext = {
  course: ContentMetaCourse;
  lesson: ContentMetaLesson;
  /** コース内でひとつ前のレッスンの slug(先頭レッスンなら undefined) */
  prevLessonSlug: string | undefined;
};

/**
 * courseSlug / lessonSlug からレッスンのメタ情報を解決する。
 * コースが存在しない・レッスンがそのコースに属さない・slideCount が 1 未満なら null(呼び出し側で 404)。
 */
export function findLessonSlideContext(
  meta: ContentMeta | null | undefined,
  courseSlug: string,
  lessonSlug: string,
): LessonSlideContext | null {
  const course = meta?.courses?.find((c) => c?.slug === courseSlug);
  if (!course) return null;
  const lessons = course.lessons ?? [];
  const index = lessons.findIndex((l) => l?.slug === lessonSlug);
  if (index < 0) return null;
  const lesson = lessons[index];
  if (!lesson || typeof lesson.slideCount !== "number" || lesson.slideCount < 1) return null;
  return {
    course,
    lesson,
    prevLessonSlug: index > 0 ? lessons[index - 1]?.slug : undefined,
  };
}
