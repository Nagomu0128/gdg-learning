// 判定パイプライン公開 API(CONTRACTS §3.2)。STUB(B が実装)。
import type { ConsoleEntry, FileMap, SyntaxDiag, Verdict } from "@codesteps/lesson-kit";
import type { LoadedLesson } from "~/generated/lessons.client";

export const PREVIEW_CONSOLE_KIND = "preview:console"; // { kind, nonce, entry: ConsoleEntry }
export const JUDGE_RESULT_KIND = "judge:result"; // { kind, nonce, verdict: Verdict }

// STUB(B が実装): runner 種別で dom iframe / Web Worker に分岐して判定する。
export function judge(_lesson: LoadedLesson, _files: FileMap): Promise<Verdict> {
  throw new Error("STUB: B が実装(~/features/judge judge)");
}

// STUB(B が実装): CSP + <base> + consoleフック + ループ保護済み JS を 1 枚の srcdoc に合成する。
export function composePreview(_input: { files: FileMap; lessonSlug: string; origin: string }): {
  html: string;
  nonce: string;
  jsSyntaxError: SyntaxDiag | null;
} {
  throw new Error("STUB: B が実装(~/features/judge composePreview)");
}

// STUB(B が実装): worker 系レッスンのプレビュー/見本用コンソール捕捉(2000ms cap)。
export function runWorkerConsole(_files: FileMap): Promise<{
  console: ConsoleEntry[];
  timedOut: boolean;
  syntaxError: SyntaxDiag | null;
}> {
  throw new Error("STUB: B が実装(~/features/judge runWorkerConsole)");
}
