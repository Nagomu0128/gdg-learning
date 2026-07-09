import type { CourseDef, LessonDef, RunnerKind } from "./types";

// 実行時は恒等関数。zod 検証はビルド時に codegen が schemas.ts で行う
// (§4.1「ビルド時に全教材を parse」/ 判定バンドルへ zod を持ち込まないための分離)。

export function defineLesson(def: LessonDef): LessonDef {
  return def;
}

export function defineCourse(def: CourseDef): CourseDef {
  return def;
}

const DOM_CHECK_TYPES = new Set(["element", "text", "attribute", "style", "custom"]);

/** runner 省略時の解決規則(CONTRACTS §2)。 */
export function resolveRunner(def: Pick<LessonDef, "runner" | "checks">): RunnerKind {
  if (def.runner) return def.runner;
  return def.checks.some((c) => DOM_CHECK_TYPES.has(c.type)) ? "dom" : "worker";
}
