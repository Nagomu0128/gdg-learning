import { describe, expect, it } from "vitest";
import { courseSchema, lessonSchema, SHORTHAND_BLOCKLIST } from "./schemas";

function validLesson(): Record<string, unknown> {
  return {
    slug: "html-01-intro",
    title: "はじめてのHTML",
    estMinutes: 5,
    files: {
      "index.html": { initial: "<h1>test</h1>" },
      "base.css": { initial: "body { margin: 0; }", editable: false },
    },
    checks: [
      { id: "has-h1", type: "element", selector: "h1" },
      { id: "h1-text", type: "text", selector: "h1", equals: "自己紹介" },
    ],
    hints: ["h1 タグを使いましょう"],
    solution: { "index.html": "<h1>自己紹介</h1>" },
  };
}

function lessonWith(overrides: Record<string, unknown>): Record<string, unknown> {
  return { ...validLesson(), ...overrides };
}

describe("lessonSchema — 正常系", () => {
  it("正しい教材定義を受理する", () => {
    expect(lessonSchema.safeParse(validLesson()).success).toBe(true);
  });

  it("runner の明示指定を受理する", () => {
    expect(lessonSchema.safeParse(lessonWith({ runner: "worker" })).success).toBe(true);
    expect(lessonSchema.safeParse(lessonWith({ runner: "dom" })).success).toBe(true);
  });

  it("editable:false のファイルは solution に無くてよい", () => {
    // validLesson の base.css がそのケース
    expect(lessonSchema.safeParse(validLesson()).success).toBe(true);
  });

  it("hidden のファイルは solution に無くてよい", () => {
    const lesson = lessonWith({
      files: {
        "index.html": { initial: "" },
        "setup.js": { initial: "// 採点用", hidden: true },
      },
    });
    expect(lessonSchema.safeParse(lesson).success).toBe(true);
  });

  it("custom check(message + run)を受理する", () => {
    const lesson = lessonWith({
      checks: [{ id: "todo-add", type: "custom", message: "項目が増えるようにしましょう", run: () => true }],
    });
    expect(lessonSchema.safeParse(lesson).success).toBe(true);
  });
});

describe("lessonSchema — slug", () => {
  it.each([
    "HTML-Intro",
    "html_intro",
    "-html",
    "html-",
    "html--intro",
    "html intro",
    "",
  ])("不正な slug を拒否する: %s", (slug) => {
    expect(lessonSchema.safeParse(lessonWith({ slug })).success).toBe(false);
  });

  it.each(["html-01-intro", "a", "css2", "js-12-dom-events"])("正しい slug を受理する: %s", (slug) => {
    expect(lessonSchema.safeParse(lessonWith({ slug })).success).toBe(true);
  });
});

describe("lessonSchema — checks", () => {
  it("checks 空を拒否する", () => {
    expect(lessonSchema.safeParse(lessonWith({ checks: [] })).success).toBe(false);
  });

  it("check id の重複を拒否する", () => {
    const lesson = lessonWith({
      checks: [
        { id: "dup", type: "element", selector: "h1" },
        { id: "dup", type: "element", selector: "p" },
      ],
    });
    expect(lessonSchema.safeParse(lesson).success).toBe(false);
  });

  it("text check に equals / contains / pattern のいずれも無ければ拒否", () => {
    const lesson = lessonWith({ checks: [{ id: "t", type: "text", selector: "h1" }] });
    expect(lessonSchema.safeParse(lesson).success).toBe(false);
  });

  it("text check の不正な正規表現を拒否", () => {
    const lesson = lessonWith({ checks: [{ id: "t", type: "text", selector: "h1", pattern: "(" }] });
    expect(lessonSchema.safeParse(lesson).success).toBe(false);
  });

  it("attribute check に equals も exists も無ければ拒否", () => {
    const lesson = lessonWith({ checks: [{ id: "a", type: "attribute", selector: "img", name: "alt" }] });
    expect(lessonSchema.safeParse(lesson).success).toBe(false);
  });

  it("attribute check は exists:true だけで受理", () => {
    const lesson = lessonWith({
      checks: [{ id: "a", type: "attribute", selector: "img", name: "alt", exists: true }],
    });
    expect(lessonSchema.safeParse(lesson).success).toBe(true);
  });

  it("source check の file が files に無ければ拒否", () => {
    const lesson = lessonWith({
      checks: [{ id: "s", type: "source", file: "missing.html", pattern: "<!doctype" }],
    });
    expect(lessonSchema.safeParse(lesson).success).toBe(false);
  });

  it("source check の file が files にあれば受理", () => {
    const lesson = lessonWith({
      checks: [{ id: "s", type: "source", file: "index.html", pattern: "<!doctype", flags: "i" }],
    });
    expect(lessonSchema.safeParse(lesson).success).toBe(true);
  });

  it("source check の不正な正規表現を拒否", () => {
    const lesson = lessonWith({
      checks: [{ id: "s", type: "source", file: "index.html", pattern: "[" }],
    });
    expect(lessonSchema.safeParse(lesson).success).toBe(false);
  });

  it("console check の lines 空配列を拒否", () => {
    const lesson = lessonWith({ checks: [{ id: "c", type: "console", lines: [] }] });
    expect(lessonSchema.safeParse(lesson).success).toBe(false);
  });

  it("fn check の不正な関数名を拒否", () => {
    const lesson = lessonWith({ checks: [{ id: "f", type: "fn", name: "123abc", args: [], returns: 1 }] });
    expect(lessonSchema.safeParse(lesson).success).toBe(false);
  });

  it("fn check の正しい定義を受理", () => {
    const lesson = lessonWith({
      checks: [{ id: "f", type: "fn", name: "add", args: [1, 2], returns: 3 }],
    });
    expect(lessonSchema.safeParse(lesson).success).toBe(true);
  });

  it("custom check の message 欠落を拒否(必須)", () => {
    const lesson = lessonWith({ checks: [{ id: "c", type: "custom", run: () => true }] });
    expect(lessonSchema.safeParse(lesson).success).toBe(false);
  });

  it("custom check の run が関数でなければ拒否", () => {
    const lesson = lessonWith({
      checks: [{ id: "c", type: "custom", message: "やってみましょう", run: "not-a-function" }],
    });
    expect(lessonSchema.safeParse(lesson).success).toBe(false);
  });

  it("element check の count 負数を拒否", () => {
    const lesson = lessonWith({ checks: [{ id: "e", type: "element", selector: "li", count: -1 }] });
    expect(lessonSchema.safeParse(lesson).success).toBe(false);
  });
});

describe("lessonSchema — style check(longhand 限定)", () => {
  it.each([
    "margin",
    "padding",
    "background",
    "font",
    "flex",
    "border",
    "grid",
  ])("shorthand を拒否する: %s", (property) => {
    expect(SHORTHAND_BLOCKLIST.has(property)).toBe(true);
    const lesson = lessonWith({
      checks: [{ id: "st", type: "style", selector: "h1", property, equals: "red" }],
    });
    expect(lessonSchema.safeParse(lesson).success).toBe(false);
  });

  it.each([
    "color",
    "background-color",
    "margin-top",
    "font-size",
    "flex-direction",
  ])("longhand を受理する: %s", (property) => {
    expect(SHORTHAND_BLOCKLIST.has(property)).toBe(false);
    const lesson = lessonWith({
      checks: [{ id: "st", type: "style", selector: "h1", property, equals: "red" }],
    });
    expect(lessonSchema.safeParse(lesson).success).toBe(true);
  });

  it("プロパティ名の大文字を拒否する", () => {
    const lesson = lessonWith({
      checks: [{ id: "st", type: "style", selector: "h1", property: "Color", equals: "red" }],
    });
    expect(lessonSchema.safeParse(lesson).success).toBe(false);
  });
});

describe("lessonSchema — files / hints / solution", () => {
  it("files 空を拒否する", () => {
    expect(lessonSchema.safeParse(lessonWith({ files: {}, solution: {} })).success).toBe(false);
  });

  it("hints 空を拒否する", () => {
    expect(lessonSchema.safeParse(lessonWith({ hints: [] })).success).toBe(false);
  });

  it("空文字のヒントを拒否する", () => {
    expect(lessonSchema.safeParse(lessonWith({ hints: [""] })).success).toBe(false);
  });

  it("solution のキーが files に無ければ拒否", () => {
    const lesson = lessonWith({
      solution: { "index.html": "<h1>x</h1>", "other.html": "<p>y</p>" },
    });
    expect(lessonSchema.safeParse(lesson).success).toBe(false);
  });

  it("editable なファイルが solution に無ければ拒否", () => {
    expect(lessonSchema.safeParse(lessonWith({ solution: {} })).success).toBe(false);
  });

  it("estMinutes は正の整数のみ", () => {
    expect(lessonSchema.safeParse(lessonWith({ estMinutes: 0 })).success).toBe(false);
    expect(lessonSchema.safeParse(lessonWith({ estMinutes: 2.5 })).success).toBe(false);
  });
});

describe("courseSchema", () => {
  const validCourse = {
    slug: "html-basics",
    title: "HTML入門",
    description: "ページの骨格から学ぶ",
    lessons: ["html-01-intro", "html-02-headings"],
  };

  it("正しいコース定義を受理する", () => {
    expect(courseSchema.safeParse(validCourse).success).toBe(true);
  });

  it("lessons の slug 重複を拒否する", () => {
    const course = { ...validCourse, lessons: ["html-01-intro", "html-01-intro"] };
    expect(courseSchema.safeParse(course).success).toBe(false);
  });

  it("lessons 空を拒否する", () => {
    expect(courseSchema.safeParse({ ...validCourse, lessons: [] }).success).toBe(false);
  });

  it("不正な slug を拒否する", () => {
    expect(courseSchema.safeParse({ ...validCourse, slug: "HTML_Basics" }).success).toBe(false);
  });

  it("description 空を拒否する", () => {
    expect(courseSchema.safeParse({ ...validCourse, description: "" }).success).toBe(false);
  });
});
