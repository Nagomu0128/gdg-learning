import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { discoverContent } from "./validate";

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "__fixtures__");

describe("discoverContent", () => {
  it("正常な教材を発見し、order / slideCount / runner / assets を解決する", async () => {
    const { courses, errors } = await discoverContent(path.join(FIXTURES, "valid"));
    expect(errors).toEqual([]);
    expect(courses).toHaveLength(1);
    const course = courses[0];
    expect(course?.def.slug).toBe("demo");
    expect(course?.lessons.map((l) => l.slug)).toEqual(["demo-01-dom", "demo-02-worker"]);
    expect(course?.lessons.map((l) => l.order)).toEqual([1, 2]);
    expect(course?.lessons.map((l) => l.runner)).toEqual(["dom", "worker"]);
    expect(course?.lessons.map((l) => l.slideCount)).toEqual([1, 1]);
    expect(course?.lessons[0]?.assetsDir).not.toBeNull();
    expect(course?.lessons[1]?.assetsDir).toBeNull();
  });

  it("コンテンツが 0 件でも正常終了する(空の結果)", async () => {
    const { courses, errors } = await discoverContent(path.join(FIXTURES, "does-not-exist"));
    expect(errors).toEqual([]);
    expect(courses).toEqual([]);
  });

  it("zod 違反(check id 重複 / shorthand / solution 欠落 / source file 不在)を全件列挙する", async () => {
    const { errors } = await discoverContent(path.join(FIXTURES, "invalid-schema"));
    expect(errors.length).toBeGreaterThanOrEqual(4);
    const joined = errors.join("\n");
    expect(joined).toContain("check id が重複");
    expect(joined).toContain("longhand");
    expect(joined).toContain("editable なファイルが solution にありません");
    expect(joined).toContain("source check の file が files にありません");
    // エラーはファイルパース失敗の由来がわかる形式
    expect(joined).toContain("lessons/01-bad/lesson.ts");
  });

  it("構造エラー(順序不一致 / ディレクトリ欠落 / 余分なディレクトリ / スライド無し)を検出する", async () => {
    const { errors } = await discoverContent(path.join(FIXTURES, "invalid-structure"));
    const joined = errors.join("\n");
    expect(joined).toContain("course.lessons の順序");
    expect(joined).toContain("レッスンディレクトリが見つかりません: demo-c");
    expect(joined).toContain("course.lessons に載っていないレッスン");
    expect(joined).toContain("slides/*.mdx が 1 枚もありません");
  });
});
