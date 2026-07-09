// 教材の発見 + 検証ステージ1(DesignDoc §4.4、CONTRACTS §8、SPEC B §4)。
// tsx / vitest(vite-node)実行前提: content/ の TS を動的 import できる。
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { courseSchema, lessonSchema } from "@codesteps/lesson-kit/schemas";
import type { ZodError, z } from "zod";

// 注意: scripts は tsconfig.node(DOM lib なし)でコンパイルされるため、
// DOM 型(Document / Window)を参照する lesson-kit の index は import できない。
// 型は zod スキーマから導出し、resolveRunner は CONTRACTS §2 の規則を同一実装する。
export type LessonDefParsed = z.infer<typeof lessonSchema>;
export type CourseDefParsed = z.infer<typeof courseSchema>;
export type RunnerKind = "dom" | "worker";

const DOM_CHECK_TYPES: ReadonlySet<string> = new Set(["element", "text", "attribute", "style", "custom"]);

/** runner 省略時の解決規則(lesson-kit の resolveRunner と同一 — CONTRACTS §2) */
function resolveRunner(def: Pick<LessonDefParsed, "runner" | "checks">): RunnerKind {
  if (def.runner) return def.runner;
  return def.checks.some((c) => DOM_CHECK_TYPES.has(c.type)) ? "dom" : "worker";
}

export type DiscoveredLesson = {
  slug: string;
  /** course.lessons 内の位置(1 始まり)。ディレクトリ接頭辞 NN と一致することを検証済み */
  order: number;
  dirName: string;
  lessonDir: string;
  lessonTsPath: string;
  slideCount: number;
  runner: RunnerKind;
  /** assets/ ディレクトリ(存在する場合のみ) */
  assetsDir: string | null;
  def: LessonDefParsed;
};

export type DiscoveredCourse = {
  def: CourseDefParsed;
  courseDir: string;
  lessons: DiscoveredLesson[];
};

export type DiscoveryResult = { courses: DiscoveredCourse[]; errors: string[] };

const HERE = path.dirname(fileURLToPath(import.meta.url));

export function defaultContentRoot(): string {
  return path.resolve(HERE, "../../../content");
}

function formatZodError(error: ZodError): string[] {
  return error.issues.map((issue) => {
    const at = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
    return `${at}${issue.message}`;
  });
}

async function listDirs(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }
}

async function listFiles(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }
}

async function importDefault(tsPath: string): Promise<unknown> {
  const mod = (await import(pathToFileURL(tsPath).href)) as { default?: unknown };
  return mod.default;
}

function rel(contentRoot: string, p: string): string {
  return path.relative(path.dirname(contentRoot), p).split(path.sep).join("/");
}

const LESSON_DIR_RE = /^(\d{2})-.+$/;

/**
 * content/courses/ を走査して全教材を発見・検証する。
 * エラーは「ファイル + slug + issue」の人間可読な文字列で全件収集する(fail fast しない)。
 * コンテンツが 0 件でも正常(空の結果を返す)。
 */
export async function discoverContent(contentRoot: string): Promise<DiscoveryResult> {
  const errors: string[] = [];
  const courses: DiscoveredCourse[] = [];
  const coursesRoot = path.join(contentRoot, "courses");
  const courseDirs = await listDirs(coursesRoot);

  const globalLessonSlugs = new Map<string, string>(); // slug -> 最初に見つかった場所
  const courseSlugs = new Set<string>();

  for (const courseDirName of courseDirs) {
    const courseDir = path.join(coursesRoot, courseDirName);
    const courseTsPath = path.join(courseDir, "course.ts");
    const courseLabel = rel(contentRoot, courseTsPath);

    let rawCourse: unknown;
    try {
      rawCourse = await importDefault(courseTsPath);
    } catch (e) {
      errors.push(`${courseLabel}: import に失敗しました: ${e instanceof Error ? e.message : String(e)}`);
      continue;
    }
    const parsedCourse = courseSchema.safeParse(rawCourse);
    if (!parsedCourse.success) {
      for (const issue of formatZodError(parsedCourse.error)) {
        errors.push(`${courseLabel}: ${issue}`);
      }
      continue;
    }
    const courseDef = parsedCourse.data;
    if (courseSlugs.has(courseDef.slug)) {
      errors.push(`${courseLabel} [${courseDef.slug}]: コース slug が重複しています`);
      continue;
    }
    courseSlugs.add(courseDef.slug);

    // レッスンディレクトリの走査
    const lessonsRoot = path.join(courseDir, "lessons");
    const lessonDirNames = await listDirs(lessonsRoot);
    const bySlug = new Map<string, DiscoveredLesson>();

    for (const dirName of lessonDirNames) {
      const lessonDir = path.join(lessonsRoot, dirName);
      const m = LESSON_DIR_RE.exec(dirName);
      if (m === null) {
        errors.push(`${rel(contentRoot, lessonDir)}: ディレクトリ名が NN-* 形式ではありません`);
        continue;
      }
      const lessonTsPath = path.join(lessonDir, "lesson.ts");
      const lessonLabel = rel(contentRoot, lessonTsPath);

      let rawLesson: unknown;
      try {
        rawLesson = await importDefault(lessonTsPath);
      } catch (e) {
        errors.push(`${lessonLabel}: import に失敗しました: ${e instanceof Error ? e.message : String(e)}`);
        continue;
      }
      const parsedLesson = lessonSchema.safeParse(rawLesson);
      if (!parsedLesson.success) {
        const slug =
          typeof rawLesson === "object" && rawLesson !== null
            ? String((rawLesson as Record<string, unknown>).slug ?? "?")
            : "?";
        for (const issue of formatZodError(parsedLesson.error)) {
          errors.push(`${lessonLabel} [${slug}]: ${issue}`);
        }
        continue;
      }
      // codegen は checks の中身(run 関数)を必要としない(判定バンドルは lesson.ts を直接 import する)
      const def = parsedLesson.data;

      const dup = globalLessonSlugs.get(def.slug);
      if (dup !== undefined) {
        errors.push(`${lessonLabel} [${def.slug}]: レッスン slug が重複しています(既出: ${dup})`);
        continue;
      }
      globalLessonSlugs.set(def.slug, lessonLabel);

      const slideFiles = (await listFiles(path.join(lessonDir, "slides"))).filter((f) =>
        f.toLowerCase().endsWith(".mdx"),
      );
      if (slideFiles.length === 0) {
        errors.push(`${lessonLabel} [${def.slug}]: slides/*.mdx が 1 枚もありません`);
      }
      const assetFiles = await listFiles(path.join(lessonDir, "assets"));

      bySlug.set(def.slug, {
        slug: def.slug,
        order: Number.parseInt(m[1] ?? "0", 10),
        dirName,
        lessonDir,
        lessonTsPath,
        slideCount: slideFiles.length,
        runner: resolveRunner(def),
        assetsDir: assetFiles.length > 0 ? path.join(lessonDir, "assets") : null,
        def,
      });
    }

    // course.lessons ↔ 実ディレクトリの 1:1(CONTRACTS §8)
    const ordered: DiscoveredLesson[] = [];
    courseDef.lessons.forEach((slug, i) => {
      const lesson = bySlug.get(slug);
      if (lesson === undefined) {
        errors.push(`${courseLabel} [${courseDef.slug}]: レッスンディレクトリが見つかりません: ${slug}`);
        return;
      }
      const expectedOrder = i + 1;
      if (lesson.order !== expectedOrder) {
        errors.push(
          `${rel(contentRoot, lesson.lessonDir)} [${slug}]: ディレクトリ接頭辞 ${String(lesson.order).padStart(2, "0")} が course.lessons の順序 ${String(expectedOrder).padStart(2, "0")} と一致しません`,
        );
        return;
      }
      ordered.push({ ...lesson, order: expectedOrder });
    });
    for (const [slug, lesson] of bySlug) {
      if (!courseDef.lessons.includes(slug)) {
        errors.push(
          `${rel(contentRoot, lesson.lessonDir)} [${slug}]: course.lessons に載っていないレッスンです`,
        );
      }
    }

    courses.push({ def: courseDef, courseDir, lessons: ordered });
  }

  return { courses, errors };
}

/**
 * `pnpm validate:content`(--validate-only)のエントリ。検証のみ・出力なし。
 * エラーは人間可読で列挙し、Error を throw する(index.ts の catch が exit 1 にする)。
 */
export async function runValidation(contentRoot: string = defaultContentRoot()): Promise<void> {
  const { courses, errors } = await discoverContent(contentRoot);
  if (errors.length > 0) {
    console.error(`[codegen] 教材検証エラー(${errors.length} 件):`);
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    throw new Error(`教材検証に失敗しました(${errors.length} 件)`);
  }
  const lessonCount = courses.reduce((acc, c) => acc + c.lessons.length, 0);
  console.log(`[codegen] 検証 OK: ${courses.length} コース / ${lessonCount} レッスン`);
}
