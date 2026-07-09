import { describe, expect, it } from "vitest";
import { type ContentMeta, findLessonSlideContext } from "./content-meta";

const lesson = (slug: string, order: number, slideCount = 4): ContentMeta["courses"][0]["lessons"][0] => ({
  slug,
  title: `レッスン ${slug}`,
  estMinutes: 5,
  runner: "dom",
  order,
  slideCount,
  hintCount: 3,
});

const meta: ContentMeta = {
  contentVersion: "dev",
  courses: [
    {
      slug: "html-basics",
      title: "HTML入門",
      description: "",
      lessons: [lesson("html-01-first-page", 1, 5), lesson("html-02-headings", 2, 4)],
    },
  ],
};

describe("findLessonSlideContext", () => {
  it("コースとレッスンを解決し、prevLessonSlug を返す", () => {
    const found = findLessonSlideContext(meta, "html-basics", "html-02-headings");
    expect(found?.course.title).toBe("HTML入門");
    expect(found?.lesson.slideCount).toBe(4);
    expect(found?.prevLessonSlug).toBe("html-01-first-page");
  });

  it("先頭レッスンの prevLessonSlug は undefined", () => {
    const found = findLessonSlideContext(meta, "html-basics", "html-01-first-page");
    expect(found).not.toBeNull();
    expect(found?.prevLessonSlug).toBeUndefined();
  });

  it("未知のコース / コースに属さないレッスンは null", () => {
    expect(findLessonSlideContext(meta, "no-such-course", "html-01-first-page")).toBeNull();
    expect(findLessonSlideContext(meta, "html-basics", "css-01-color")).toBeNull();
  });

  it("スタブ(courses: [])や欠損データで壊れない", () => {
    expect(findLessonSlideContext({ contentVersion: "dev", courses: [] }, "a", "b")).toBeNull();
    expect(findLessonSlideContext(null, "a", "b")).toBeNull();
    expect(
      findLessonSlideContext(
        { contentVersion: "dev", courses: [{ slug: "x" } as ContentMeta["courses"][0]] },
        "x",
        "y",
      ),
    ).toBeNull();
  });

  it("slideCount が 1 未満のレッスンは null(スライドなし)", () => {
    const zero: ContentMeta = {
      contentVersion: "dev",
      courses: [{ slug: "c", title: "C", description: "", lessons: [lesson("c-01", 1, 0)] }],
    };
    expect(findLessonSlideContext(zero, "c", "c-01")).toBeNull();
  });
});
