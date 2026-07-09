// 演習画面の共有型(SPEC E)。route の action と UI(fetcher)が同じ応答形を参照する。
import type { ConsoleEntry, SyntaxDiag } from "@codesteps/lesson-kit";
import type { SubmitResult } from "~/features/progress/types";

/**
 * 演習 action の応答(CONTRACTS §6.1)。
 * - submit → SubmitResult
 * - view-solution → { ok: true }
 * - 4xx/5xx(レート制限 429 含む)→ { error }
 */
export type ExerciseActionData = SubmitResult | { ok: true } | { error: string };

export type PreviewTab = "result" | "sample" | "console";

/** composePreview の安全ラップ結果。error は判定エンジン未接続などの失敗時のみ非 null */
export type PreviewState = {
  html: string;
  nonce: string;
  jsSyntaxError: SyntaxDiag | null;
  error: string | null;
};

/** runWorkerConsole の安全ラップ結果 */
export type WorkerView = {
  console: ConsoleEntry[];
  timedOut: boolean;
  syntaxError: SyntaxDiag | null;
  error: string | null;
};
