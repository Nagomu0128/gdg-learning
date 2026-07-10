import { describe, expect, it } from "vitest";
import { courseAccent, groupCoursesByLevel, LEVEL_LABELS, normalizeLevel } from "./levels";

describe("normalizeLevel(旧 content-meta 互換)", () => {
  it("既知の level はそのまま返す", () => {
    expect(normalizeLevel("basic")).toBe("basic");
    expect(normalizeLevel("intermediate")).toBe("intermediate");
    expect(normalizeLevel("advanced")).toBe("advanced");
    expect(normalizeLevel("capstone")).toBe("capstone");
  });

  it("欠損・未知の値は basic に倒す", () => {
    expect(normalizeLevel(undefined)).toBe("basic");
    expect(normalizeLevel(null)).toBe("basic");
    expect(normalizeLevel("")).toBe("basic");
    expect(normalizeLevel("expert")).toBe("basic");
    expect(normalizeLevel(3)).toBe("basic");
  });
});

describe("groupCoursesByLevel", () => {
  it("レベル定義順にグループ化し、空のレベルは出さない", () => {
    const sections = groupCoursesByLevel([
      { slug: "capstone-projects", level: "capstone" },
      { slug: "html-basics", level: "basic" },
      { slug: "css-basics", level: "basic" },
    ]);
    expect(sections.map((s) => s.level)).toEqual(["basic", "capstone"]);
    expect(sections[0]?.label).toBe(LEVEL_LABELS.basic);
    // コース側の並び順(content-meta 順)は保持する
    expect(sections[0]?.courses.map((c) => c.slug)).toEqual(["html-basics", "css-basics"]);
  });

  it("level が無いコース(旧 content-meta)は基礎編に入る", () => {
    const sections = groupCoursesByLevel([{ slug: "html-basics" }, { slug: "js-basics", level: undefined }]);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.level).toBe("basic");
    expect(sections[0]?.courses).toHaveLength(2);
  });

  it("null / undefined / 空配列でも壊れない", () => {
    expect(groupCoursesByLevel(null)).toEqual([]);
    expect(groupCoursesByLevel(undefined)).toEqual([]);
    expect(groupCoursesByLevel([])).toEqual([]);
    expect(groupCoursesByLevel([null, undefined])).toEqual([]);
  });
});

describe("courseAccent", () => {
  it("slug の系統ごとに GDG カラーを返す(新コースにも適用される)", () => {
    expect(courseAccent("html-basics")).toBe("var(--gdg-red)");
    expect(courseAccent("html-advanced")).toBe("var(--gdg-red)");
    expect(courseAccent("css-intermediate")).toBe("var(--gdg-blue)");
    expect(courseAccent("js-advanced")).toBe("var(--gdg-yellow)");
    expect(courseAccent("capstone-projects")).toBe("var(--gdg-green)");
  });
});
