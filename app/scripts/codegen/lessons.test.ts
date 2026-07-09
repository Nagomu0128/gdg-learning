import { mkdtemp, readdir, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { generateLessons } from "./lessons";

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "__fixtures__");
const tempDirs: string[] = [];

async function makeTempAppDir(): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), "codesteps-codegen-"));
  tempDirs.push(dir);
  return dir;
}

afterAll(async () => {
  for (const dir of tempDirs) {
    await rm(dir, { recursive: true, force: true });
  }
});

describe("generateLessons", () => {
  it("レッスンモジュール + レジストリ + content-meta.json + assets を生成する", async () => {
    const appDir = await makeTempAppDir();
    await generateLessons({ contentRoot: path.join(FIXTURES, "valid"), appDir });

    const generatedDir = path.join(appDir, "app", "generated");
    const lessonFiles = await readdir(path.join(generatedDir, "lessons"));
    expect(lessonFiles.sort()).toEqual(["demo-01-dom.ts", "demo-02-worker.ts"]);

    const lessonModule = await readFile(path.join(generatedDir, "lessons", "demo-01-dom.ts"), "utf8");
    expect(lessonModule).toContain('export const meta: LoadedLesson["meta"]');
    expect(lessonModule).toContain("export const judgeBundle: string =");
    expect(lessonModule).toContain('"editable": true');

    const registry = await readFile(path.join(generatedDir, "lessons.client.ts"), "utf8");
    expect(registry).toContain('import.meta.glob<LoadedLesson>("./lessons/*.ts")');
    expect(registry).toContain("export function loadLesson");

    const meta = JSON.parse(await readFile(path.join(generatedDir, "content-meta.json"), "utf8")) as {
      contentVersion: string;
      courses: { slug: string; lessons: { slug: string; order: number; runner: string }[] }[];
    };
    expect(meta.contentVersion).not.toBe("");
    expect(meta.courses).toHaveLength(1);
    expect(meta.courses[0]?.lessons.map((l) => [l.slug, l.order, l.runner])).toEqual([
      ["demo-01-dom", 1, "dom"],
      ["demo-02-worker", 2, "worker"],
    ]);

    const asset = await stat(path.join(appDir, "public", "lesson-assets", "demo-01-dom", "sample.svg"));
    expect(asset.isFile()).toBe(true);
  });

  it("コンテンツ 0 件でも空レジストリを出力して正常終了する(CONTRACTS §3.1)", async () => {
    const appDir = await makeTempAppDir();
    const emptyContent = await makeTempAppDir();
    await generateLessons({ contentRoot: emptyContent, appDir });

    const generatedDir = path.join(appDir, "app", "generated");
    const registry = await readFile(path.join(generatedDir, "lessons.client.ts"), "utf8");
    expect(registry).toContain("export function loadLesson");
    const meta = JSON.parse(await readFile(path.join(generatedDir, "content-meta.json"), "utf8")) as {
      courses: unknown[];
    };
    expect(meta.courses).toEqual([]);
  });

  it("検証エラーがある教材では生成せずに throw する", async () => {
    const appDir = await makeTempAppDir();
    await expect(
      generateLessons({ contentRoot: path.join(FIXTURES, "invalid-schema"), appDir }),
    ).rejects.toThrow(/教材検証に失敗/);
  });
});
