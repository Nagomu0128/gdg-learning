import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { generateSlides } from "./slides";

const fixturesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "__fixtures__/slides/courses");

let tmpDirs: string[] = [];

async function makeTmpDir(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), "codesteps-slides-"));
  tmpDirs.push(dir);
  return dir;
}

afterEach(async () => {
  for (const dir of tmpDirs) {
    await rm(dir, { recursive: true, force: true });
  }
  tmpDirs = [];
});

describe("generateSlides", () => {
  it("MDX を lessonSlug 別ディレクトリへコピーし、レジストリを出力する", async () => {
    const generatedDir = await makeTmpDir();
    const result = await generateSlides({ contentDir: fixturesDir, generatedDir });

    expect(result).toEqual({ lessonCount: 1, slideCount: 2 });

    // ディレクトリ名は lesson.ts の slug(ディレクトリ接頭辞 01-sample ではない)
    const copied = await readdir(path.join(generatedDir, "slides", "fixture-01-sample"));
    expect(copied.sort()).toEqual(["01.mdx", "02.mdx"]);

    const registry = await readFile(path.join(generatedDir, "slides.client.ts"), "utf8");
    expect(registry).toContain('import.meta.glob<{ default: React.ComponentType }>("./slides/*/*.mdx")');
    expect(registry).toContain("export function loadSlide(");

    const copiedMdx = await readFile(
      path.join(generatedDir, "slides", "fixture-01-sample", "01.mdx"),
      "utf8",
    );
    expect(copiedMdx).toContain("# フィクスチャスライド1");
  });

  it("content が空でも空レジストリで正常終了する", async () => {
    const generatedDir = await makeTmpDir();
    const emptyContentDir = path.join(await makeTmpDir(), "no-such-courses");

    const result = await generateSlides({ contentDir: emptyContentDir, generatedDir });

    expect(result).toEqual({ lessonCount: 0, slideCount: 0 });
    const registry = await readFile(path.join(generatedDir, "slides.client.ts"), "utf8");
    expect(registry).toContain("export function loadSlide(");
  });

  it("再実行時に前回の生成物を持ち越さない", async () => {
    const generatedDir = await makeTmpDir();
    await generateSlides({ contentDir: fixturesDir, generatedDir });
    // 2 回目は空 content — 前回コピーした slides/ が消えること
    const emptyContentDir = path.join(await makeTmpDir(), "no-such-courses");
    await generateSlides({ contentDir: emptyContentDir, generatedDir });

    const slidesDir = await readdir(path.join(generatedDir, "slides"));
    expect(slidesDir).toEqual([]);
  });
});
