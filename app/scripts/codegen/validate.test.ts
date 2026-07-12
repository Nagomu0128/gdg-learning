import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { discoverContent, type LessonDefParsed, lintLessonChecks } from "./validate";

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "__fixtures__");

describe("discoverContent", () => {
  it("正常な教材を発見し、order / slideCount / runner / assets / level を解決する", async () => {
    const { courses, errors, warnings } = await discoverContent(path.join(FIXTURES, "valid"));
    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
    expect(courses).toHaveLength(2);
    // order 未指定同士は slug 順(content-meta.json の courses 配列順の正)
    expect(courses.map((c) => c.def.slug)).toEqual(["demo", "demo-two"]);
    const course = courses[0];
    expect(course?.def.level).toBeUndefined(); // 未指定は codegen 側で "basic" に倒す
    expect(course?.lessons.map((l) => l.slug)).toEqual(["demo-01-dom", "demo-02-worker"]);
    expect(course?.lessons.map((l) => l.order)).toEqual([1, 2]);
    expect(course?.lessons.map((l) => l.runner)).toEqual(["dom", "worker"]);
    expect(course?.lessons.map((l) => l.slideCount)).toEqual([1, 1]);
    expect(course?.lessons[0]?.assetsDir).not.toBeNull();
    expect(course?.lessons[1]?.assetsDir).toBeNull();
    expect(courses[1]?.def.level).toBe("intermediate");
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

describe("lintLessonChecks(ステージ1 教材リント — J-judge-hardening)", () => {
  function lesson(partial: Partial<LessonDefParsed>): LessonDefParsed {
    return {
      slug: "demo-01-test",
      title: "テスト",
      files: { "script.js": { initial: "" } },
      checks: [{ id: "c", type: "console", lines: ["x"] }],
      hints: ["h"],
      solution: { "script.js": "" },
      ...partial,
    } as LessonDefParsed;
  }

  it("source check のみのレッスンに警告する", () => {
    const warnings = lintLessonChecks(
      lesson({ checks: [{ id: "s", type: "source", file: "script.js", pattern: "let" }] }),
      "L",
    );
    expect(warnings.join("\n")).toContain("source check しかありません");
  });

  it("挙動検証の check が 1 つでもあれば source-only 警告は出ない", () => {
    const warnings = lintLessonChecks(
      lesson({
        checks: [
          { id: "s", type: "source", file: "script.js", pattern: "xyz" },
          { id: "c", type: "console", lines: ["x"] },
        ],
      }),
      "L",
    );
    expect(warnings.join("\n")).not.toContain("source check しかありません");
  });

  it("pattern が initial のコメント内にだけマッチする source check に ignoreComments を提案する", () => {
    const warnings = lintLessonChecks(
      lesson({
        files: { "script.js": { initial: '// ここに console.log("hi") と書こう\n' } },
        checks: [
          { id: "use-log", type: "source", file: "script.js", pattern: "console\\.log" },
          { id: "c", type: "console", lines: ["hi"] },
        ],
      }),
      "L",
    );
    const joined = warnings.join("\n");
    expect(joined).toContain("コメント内にだけマッチ");
    expect(joined).toContain("ignoreComments: true");
    expect(joined).toContain('"use-log"');
  });

  it("pattern がコード本体にマッチする場合は keep-check 扱いの警告になる", () => {
    const warnings = lintLessonChecks(
      lesson({
        files: { "index.html": { initial: "<!doctype html>\n<html></html>" }, "script.js": { initial: "" } },
        checks: [
          { id: "doctype", type: "source", file: "index.html", pattern: "<!doctype\\s+html>", flags: "i" },
          { id: "c", type: "console", lines: ["x"] },
        ],
        solution: { "index.html": "", "script.js": "" },
      }),
      "L",
    );
    const joined = warnings.join("\n");
    expect(joined).toContain("initial に既にマッチしています");
    expect(joined).toContain("keep-check");
  });

  it("ignoreComments:true 済みでコメント内にしかマッチしない check は警告しない", () => {
    const warnings = lintLessonChecks(
      lesson({
        files: { "script.js": { initial: '// ここに console.log("hi") と書こう\n' } },
        checks: [
          {
            id: "use-log",
            type: "source",
            file: "script.js",
            pattern: "console\\.log",
            ignoreComments: true,
          },
          { id: "c", type: "console", lines: ["hi"] },
        ],
      }),
      "L",
    );
    expect(warnings).toEqual([]);
  });

  it("initial にマッチしない source check は警告しない", () => {
    const warnings = lintLessonChecks(
      lesson({
        files: { "script.js": { initial: "let x = 1;\n" } },
        checks: [
          { id: "use-log", type: "source", file: "script.js", pattern: "console\\.log" },
          { id: "c", type: "console", lines: ["hi"] },
        ],
      }),
      "L",
    );
    expect(warnings).toEqual([]);
  });

  it("count 未指定 element check のタグが initial に既に存在すれば警告する", () => {
    const warnings = lintLessonChecks(
      lesson({
        files: { "index.html": { initial: "<ul>\n  <li>既存</li>\n</ul>" } },
        checks: [{ id: "li-exists", type: "element", selector: "li" }],
        solution: { "index.html": "" },
      }),
      "L",
    );
    const joined = warnings.join("\n");
    expect(joined).toContain('"li-exists"');
    expect(joined).toContain("count 指定を検討");
  });

  it("count 指定済み・複合セレクタ・initial に無いタグは警告しない", () => {
    const warnings = lintLessonChecks(
      lesson({
        files: { "index.html": { initial: "<ul>\n  <li>既存</li>\n</ul>" } },
        checks: [
          { id: "li-3", type: "element", selector: "li", count: 3 },
          { id: "nested", type: "element", selector: "ul > li" },
          { id: "h1", type: "element", selector: "h1" },
        ],
        solution: { "index.html": "" },
      }),
      "L",
    );
    expect(warnings).toEqual([]);
  });
});
