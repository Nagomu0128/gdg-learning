// 進捗・ゲーミフィケーションサービス(CONTRACTS §5)。すべて server-only。STUB(F が実装)。
import type { FileMap } from "@codesteps/lesson-kit";
import type { Env } from "~/lib/env";
import type {
  CourseDetail,
  CourseOverview,
  ExerciseState,
  MypageData,
  SubmitResult,
  VerdictPayload,
} from "./types";

export type * from "./types";

// STUB(F が実装)
export function getCoursesOverview(_env: Env, _userId: string | null): Promise<CourseOverview[]> {
  throw new Error("STUB: F が実装(getCoursesOverview)");
}

// STUB(F が実装)
export function getCourseDetail(
  _env: Env,
  _userId: string | null,
  _courseSlug: string,
): Promise<CourseDetail | null> {
  throw new Error("STUB: F が実装(getCourseDetail)");
}

// STUB(F が実装): 導出規則は §7.3(unlocked = min(floor(failed/2), hintCount))
export function getExerciseState(_env: Env, _userId: string, _lessonSlug: string): Promise<ExerciseState> {
  throw new Error("STUB: F が実装(getExerciseState)");
}

// STUB(F が実装): レート制限 → db.batch → バッジ評価(§9.2)
export function submitVerdict(
  _env: Env,
  _userId: string,
  _input: { lessonSlug: string; verdict: VerdictPayload; code: FileMap },
): Promise<SubmitResult> {
  throw new Error("STUB: F が実装(submitVerdict)");
}

// STUB(F が実装)
export function markSolutionViewed(_env: Env, _userId: string, _lessonSlug: string): Promise<void> {
  throw new Error("STUB: F が実装(markSolutionViewed)");
}

// STUB(F が実装)
export function getMypage(_env: Env, _userId: string): Promise<MypageData> {
  throw new Error("STUB: F が実装(getMypage)");
}

// STUB(F が実装): §7.5 の retention(90日、最新合格除外)。workers/app.ts の scheduled から呼ぶ。
export function runRetention(_env: Env, _now?: Date): Promise<{ cleared: number }> {
  throw new Error("STUB: F が実装(runRetention)");
}
