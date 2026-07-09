import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildJudgeBundle } from "./judge-bundle";

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "__fixtures__");

describe("buildJudgeBundle", () => {
  it("lesson.ts + runtime を IIFE 1 本に束ね、__JUDGE__ を定義するコードを出力する", async () => {
    const lessonTs = path.join(FIXTURES, "valid", "courses", "demo", "lessons", "01-dom", "lesson.ts");
    const { code, bytes } = await buildJudgeBundle(lessonTs);
    expect(code).toContain("__JUDGE__");
    expect(code).toContain("judge:result");
    expect(bytes).toBeGreaterThan(0);
    // §4.2: 1 バンドル数 KB 程度。50KB を大きく超えたら依存の混入を疑う
    expect(bytes).toBeLessThan(50 * 1024);
  });

  it("worker 系レッスンも同様にビルドできる", async () => {
    const lessonTs = path.join(FIXTURES, "valid", "courses", "demo", "lessons", "02-worker", "lesson.ts");
    const { code } = await buildJudgeBundle(lessonTs);
    expect(code).toContain("__JUDGE__");
  });

  it("zod が混入するレッスンはビルドを拒否する(SPEC B §2)", async () => {
    const lessonTs = path.join(FIXTURES, "bundle-zod", "lesson.ts");
    await expect(buildJudgeBundle(lessonTs)).rejects.toThrow(/禁止依存/);
  });
});
