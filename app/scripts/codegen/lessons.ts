// 教材 codegen 本体(DesignDoc §4.2、CONTRACTS §3.1 / §8、SPEC B §4)。
// content/ を発見・検証し、レッスンモジュール群 + レジストリ + content-meta.json を生成、
// assets を app/public/lesson-assets/{lessonSlug}/ へコピーする。
import { execSync } from "node:child_process";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildJudgeBundle } from "./judge-bundle";
import type { DiscoveredCourse, DiscoveredLesson } from "./validate";
import { defaultContentRoot, discoverContent } from "./validate";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_APP_DIR = path.resolve(HERE, "../..");

/** バンドル肥大の警告しきい値(§4.2 は数 KB 想定) */
const BUNDLE_WARN_BYTES = 50 * 1024;
const DEFAULT_EST_MINUTES = 5;

// LoadedLesson 型は契約(CONTRACTS §3.1)。レジストリは import.meta.glob の遅延チャンク。
const LESSONS_CLIENT = `// 自動生成ファイル(scripts/codegen が出力。コミットしない)
// LoadedLesson 型と loadLesson は契約(CONTRACTS §3.1)。

export type LoadedLesson = {
  meta: {
    slug: string;
    title: string;
    estMinutes: number;
    runner: "dom" | "worker";
    courseSlug: string;
    order: number;
    slideCount: number;
    hintCount: number;
  };
  files: Record<string, { initial: string; editable: boolean; hidden: boolean }>;
  hints: string[];
  solution: Record<string, string>;
  judgeBundle: string;
};

const modules = import.meta.glob<LoadedLesson>("./lessons/*.ts");

export function loadLesson(slug: string): Promise<LoadedLesson> {
  const load = modules[\`./lessons/\${slug}.ts\`];
  if (load === undefined) {
    return Promise.reject(new Error(\`unknown lesson: \${slug}\`));
  }
  return load();
}
`;

function contentVersion(repoRoot: string): string {
  try {
    const sha = execSync("git rev-parse --short HEAD", {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    return sha !== "" ? sha : "dev";
  } catch {
    return "dev";
  }
}

type LessonMeta = {
  slug: string;
  title: string;
  estMinutes: number;
  runner: "dom" | "worker";
  courseSlug: string;
  order: number;
  slideCount: number;
  hintCount: number;
};

function lessonMeta(course: DiscoveredCourse, lesson: DiscoveredLesson): LessonMeta {
  return {
    slug: lesson.slug,
    title: lesson.def.title,
    estMinutes: lesson.def.estMinutes ?? DEFAULT_EST_MINUTES,
    runner: lesson.runner,
    courseSlug: course.def.slug,
    order: lesson.order,
    slideCount: lesson.slideCount,
    hintCount: lesson.def.hints.length,
  };
}

function renderLessonModule(course: DiscoveredCourse, lesson: DiscoveredLesson, bundle: string): string {
  const files: Record<string, { initial: string; editable: boolean; hidden: boolean }> = {};
  for (const [name, file] of Object.entries(lesson.def.files)) {
    files[name] = {
      initial: file.initial,
      editable: file.editable !== false,
      hidden: file.hidden === true,
    };
  }
  return [
    "// 自動生成ファイル(scripts/codegen が出力。コミットしない)",
    'import type { LoadedLesson } from "../lessons.client";',
    "",
    `export const meta: LoadedLesson["meta"] = ${JSON.stringify(lessonMeta(course, lesson), null, 2)};`,
    "",
    `export const files: LoadedLesson["files"] = ${JSON.stringify(files, null, 2)};`,
    "",
    `export const hints: string[] = ${JSON.stringify(lesson.def.hints, null, 2)};`,
    "",
    `export const solution: LoadedLesson["solution"] = ${JSON.stringify(lesson.def.solution, null, 2)};`,
    "",
    `export const judgeBundle: string = ${JSON.stringify(bundle)};`,
    "",
  ].join("\n");
}

function renderContentMeta(courses: DiscoveredCourse[], version: string): string {
  const meta = {
    contentVersion: version,
    courses: courses.map((course) => ({
      slug: course.def.slug,
      title: course.def.title,
      description: course.def.description,
      lessons: course.lessons.map((lesson) => lessonMeta(course, lesson)),
    })),
  };
  return `${JSON.stringify(meta, null, 2)}\n`;
}

export async function generateLessons(opts?: { contentRoot?: string; appDir?: string }): Promise<void> {
  const appDir = opts?.appDir ?? DEFAULT_APP_DIR;
  const contentRoot = opts?.contentRoot ?? defaultContentRoot();
  const repoRoot = path.resolve(contentRoot, "..");
  const generatedDir = path.join(appDir, "app", "generated");
  const lessonsDir = path.join(generatedDir, "lessons");
  const assetsRoot = path.join(appDir, "public", "lesson-assets");

  const { courses, errors } = await discoverContent(contentRoot);
  if (errors.length > 0) {
    console.error(`[codegen] 教材検証エラー(${errors.length} 件):`);
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    throw new Error(`教材検証に失敗しました(${errors.length} 件)`);
  }

  // 生成物ディレクトリの掃除(slug 改名時の残骸を残さない)
  await rm(lessonsDir, { recursive: true, force: true });
  await mkdir(lessonsDir, { recursive: true });
  await rm(assetsRoot, { recursive: true, force: true });

  const sizes: { slug: string; bytes: number }[] = [];
  for (const course of courses) {
    for (const lesson of course.lessons) {
      const { code, bytes } = await buildJudgeBundle(lesson.lessonTsPath);
      sizes.push({ slug: lesson.slug, bytes });
      if (bytes > BUNDLE_WARN_BYTES) {
        console.warn(
          `[codegen] 警告: 判定バンドルが 50KB を超えています: ${lesson.slug} (${(bytes / 1024).toFixed(1)}KB)`,
        );
      }
      await writeFile(
        path.join(lessonsDir, `${lesson.slug}.ts`),
        renderLessonModule(course, lesson, code),
        "utf8",
      );
      if (lesson.assetsDir !== null) {
        const dest = path.join(assetsRoot, lesson.slug);
        await mkdir(dest, { recursive: true });
        await cp(lesson.assetsDir, dest, { recursive: true });
      }
    }
  }

  await writeFile(path.join(generatedDir, "lessons.client.ts"), LESSONS_CLIENT, "utf8");
  await writeFile(
    path.join(generatedDir, "content-meta.json"),
    renderContentMeta(courses, contentVersion(repoRoot)),
    "utf8",
  );

  const lessonCount = sizes.length;
  if (lessonCount > 0) {
    const total = sizes.reduce((acc, s) => acc + s.bytes, 0);
    const max = sizes.reduce((a, b) => (a.bytes >= b.bytes ? a : b));
    console.log(
      `[codegen] lessons: ${courses.length} コース / ${lessonCount} レッスン生成。判定バンドル 平均 ${(total / lessonCount / 1024).toFixed(1)}KB / 最大 ${(max.bytes / 1024).toFixed(1)}KB (${max.slug})`,
    );
  } else {
    console.log("[codegen] lessons: コンテンツ 0 件(空レジストリを出力)");
  }
}
