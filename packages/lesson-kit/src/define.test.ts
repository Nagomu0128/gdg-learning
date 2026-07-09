import { describe, expect, it } from "vitest";
import { defineCourse, defineLesson, resolveRunner } from "./define";
import type { Check, CourseDef, LessonDef } from "./types";

describe("defineLesson / defineCourse(実行時は恒等関数)", () => {
  it("defineLesson は同じオブジェクトを返す", () => {
    const def: LessonDef = {
      slug: "html-01-intro",
      title: "はじめてのHTML",
      files: { "index.html": { initial: "" } },
      checks: [{ id: "has-h1", type: "element", selector: "h1" }],
      hints: ["ヒント"],
      solution: { "index.html": "<h1>x</h1>" },
    };
    expect(defineLesson(def)).toBe(def);
  });

  it("defineCourse は同じオブジェクトを返す", () => {
    const def: CourseDef = {
      slug: "html-basics",
      title: "HTML入門",
      description: "説明",
      lessons: ["html-01-intro"],
    };
    expect(defineCourse(def)).toBe(def);
  });
});

describe("resolveRunner(CONTRACTS §2 の規則)", () => {
  const check = (partial: Check): Check => partial;

  it("runner 明示があればそれを使う", () => {
    const domChecks: Check[] = [check({ id: "e", type: "element", selector: "h1" })];
    expect(resolveRunner({ runner: "worker", checks: domChecks })).toBe("worker");
    const workerChecks: Check[] = [check({ id: "c", type: "console", lines: ["Hello"] })];
    expect(resolveRunner({ runner: "dom", checks: workerChecks })).toBe("dom");
  });

  it.each<[Check["type"], Check]>([
    ["element", { id: "x", type: "element", selector: "h1" }],
    ["text", { id: "x", type: "text", selector: "h1", equals: "a" }],
    ["attribute", { id: "x", type: "attribute", selector: "img", name: "alt", exists: true }],
    ["style", { id: "x", type: "style", selector: "h1", property: "color", equals: "red" }],
    ["custom", { id: "x", type: "custom", message: "m", run: () => true }],
  ])("DOM 系 check(%s)が 1 つでもあれば dom", (_type, domCheck) => {
    expect(resolveRunner({ checks: [domCheck] })).toBe("dom");
  });

  it.each<[Check["type"], Check]>([
    ["console", { id: "x", type: "console", lines: ["Hello"] }],
    ["fn", { id: "x", type: "fn", name: "add", args: [1, 2], returns: 3 }],
    ["source", { id: "x", type: "source", file: "script.js", pattern: "for" }],
  ])("非 DOM 系 check(%s)のみなら worker", (_type, workerCheck) => {
    expect(resolveRunner({ checks: [workerCheck] })).toBe("worker");
  });

  it("worker 系と DOM 系が混在すれば dom", () => {
    const checks: Check[] = [
      { id: "c", type: "console", lines: ["Hello"] },
      { id: "e", type: "element", selector: "button" },
    ];
    expect(resolveRunner({ checks })).toBe("dom");
  });
});
