// スライド codegen(D 所有。CONTRACTS §3.1 / SPEC D §2)。
// content/courses/*/lessons/*/slides/NN.mdx を app/app/generated/slides/{lessonSlug}/NN.mdx へコピーし、
// generated/slides.client.ts に loadSlide レジストリ(import.meta.glob・遅延)を出力する。
// スライド枚数の集計は B の content-meta.json が持つ — こちらはコピーとレジストリのみ。
// content が空(コース/レッスン/スライドなし)でも空レジストリで正常終了する。
import type { Dirent } from "node:fs";
import { copyFile, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CONTENT_DIR = path.resolve(scriptDir, "../../../content/courses");
const DEFAULT_GENERATED_DIR = path.resolve(scriptDir, "../../app/generated");

const SLIDE_FILE_RE = /^\d{2}\.mdx$/;

// 自動生成されるレジストリ本体。glob の中身(generated/slides/**)だけが実行ごとに変わる。
const SLIDES_CLIENT = `// 自動生成ファイル(scripts/codegen が出力。コミットしない)
// loadSlide(lessonSlug, n): n は 1 始まり。generated/slides/{lessonSlug}/NN.mdx(ゼロ埋め2桁)を
// import.meta.glob で遅延 import する(レッスン単位チャンク — §10.1)。未知のスライドは reject。
import type * as React from "react";

const modules = import.meta.glob<{ default: React.ComponentType }>("./slides/*/*.mdx");

export function loadSlide(lessonSlug: string, n: number): Promise<{ default: React.ComponentType }> {
  const key = \`./slides/\${lessonSlug}/\${String(n).padStart(2, "0")}.mdx\`;
  const loader = modules[key];
  if (!loader) {
    return Promise.reject(new Error(\`unknown slide: \${lessonSlug}/\${n}\`));
  }
  return loader();
}
`;

export type GenerateSlidesOptions = {
  /** content/courses 相当のディレクトリ(テスト用に差し替え可) */
  contentDir?: string;
  /** app/app/generated 相当の出力先(テスト用に差し替え可) */
  generatedDir?: string;
};

export type GenerateSlidesResult = {
  lessonCount: number;
  slideCount: number;
};

async function listDirents(dir: string): Promise<Dirent[]> {
  try {
    return await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

/** lesson.ts(default export の defineLesson 結果)から slug を読む。slug が SSOT(CONTRACTS §8)。 */
async function readLessonSlug(lessonTsPath: string): Promise<string | null> {
  try {
    const mod = (await import(pathToFileURL(lessonTsPath).href)) as { default?: { slug?: unknown } };
    const slug = mod.default?.slug;
    return typeof slug === "string" && slug.length > 0 ? slug : null;
  } catch {
    return null;
  }
}

export async function generateSlides(options: GenerateSlidesOptions = {}): Promise<GenerateSlidesResult> {
  const contentDir = options.contentDir ?? DEFAULT_CONTENT_DIR;
  const generatedDir = options.generatedDir ?? DEFAULT_GENERATED_DIR;
  const slidesOutDir = path.join(generatedDir, "slides");

  // 前回生成分の残骸(削除済みレッスン等)を持ち越さない
  await rm(slidesOutDir, { recursive: true, force: true });
  await mkdir(slidesOutDir, { recursive: true });

  let lessonCount = 0;
  let slideCount = 0;
  const seenSlugs = new Set<string>();

  for (const courseEnt of await listDirents(contentDir)) {
    if (!courseEnt.isDirectory()) continue;
    const lessonsDir = path.join(contentDir, courseEnt.name, "lessons");
    for (const lessonEnt of await listDirents(lessonsDir)) {
      if (!lessonEnt.isDirectory()) continue;
      const lessonDir = path.join(lessonsDir, lessonEnt.name);
      const slideFiles = (await listDirents(path.join(lessonDir, "slides")))
        .filter((e) => e.isFile() && SLIDE_FILE_RE.test(e.name))
        .map((e) => e.name)
        .sort();
      if (slideFiles.length === 0) continue; // スライドなしのレッスンは対象外(検証は B のステージ1)

      const slug = await readLessonSlug(path.join(lessonDir, "lesson.ts"));
      if (!slug) {
        console.warn(
          `[codegen:slides] ${courseEnt.name}/${lessonEnt.name}: lesson.ts から slug を読めないためスキップ`,
        );
        continue;
      }
      if (seenSlugs.has(slug)) {
        throw new Error(`[codegen:slides] slug 重複: ${slug}(${courseEnt.name}/${lessonEnt.name})`);
      }
      seenSlugs.add(slug);

      // 01.mdx から連番であることを確認(loadSlide は 1..slideCount を仮定する)
      slideFiles.forEach((name, i) => {
        const expected = `${String(i + 1).padStart(2, "0")}.mdx`;
        if (name !== expected) {
          console.warn(`[codegen:slides] ${slug}: スライドが連番ではありません(${name} ≠ ${expected})`);
        }
      });

      const destDir = path.join(slidesOutDir, slug);
      await mkdir(destDir, { recursive: true });
      for (const name of slideFiles) {
        await copyFile(path.join(lessonDir, "slides", name), path.join(destDir, name));
      }
      lessonCount += 1;
      slideCount += slideFiles.length;
    }
  }

  await writeFile(path.join(generatedDir, "slides.client.ts"), SLIDES_CLIENT, "utf8");
  console.log(`[codegen:slides] ${lessonCount} レッスン / ${slideCount} スライドを生成しました`);
  return { lessonCount, slideCount };
}
