// 判定パイプライン公開 API(CONTRACTS §3.2)。シグネチャ変更禁止。
import type { ConsoleEntry, FileMap, SyntaxDiag, Verdict } from "@codesteps/lesson-kit";
import type { LoadedLesson } from "~/generated/lessons.client";
import { composeDocument } from "./composer";
import { runDomJudge } from "./dom-runner";
import { buildWorkerSource, runWorkerConsole as runWorkerConsoleImpl, runWorkerJudge } from "./worker-runner";

export { JUDGE_RESULT_KIND, PREVIEW_CONSOLE_KIND } from "./protocol";

/** instrumentLoops が ok:false のとき、サンドボックスを起動せず即返す不合格(CONTRACTS §3.2) */
function syntaxErrorVerdict(error: SyntaxDiag): Verdict {
  return {
    passed: false,
    display: { checkId: "__syntax__", message: error.message },
    details: [],
    console: [],
    timedOut: false,
  };
}

/**
 * 判定エンジン(§5.1)。runner 種別は lesson.meta.runner で分岐し、
 * 呼び出し側はレッスン種別を意識しない(戦略パターン)。
 */
export async function judge(lesson: LoadedLesson, files: FileMap): Promise<Verdict> {
  const nonce = crypto.randomUUID();
  if (lesson.meta.runner === "worker") {
    const built = buildWorkerSource({
      files,
      judgeBundle: lesson.judgeBundle,
      nonce,
      relayConsole: true,
    });
    if (built.syntaxError !== null) return syntaxErrorVerdict(built.syntaxError);
    return runWorkerJudge(built.source, nonce);
  }
  const composed = composeDocument({
    files,
    lessonSlug: lesson.meta.slug,
    origin: window.location.origin,
    nonce,
    mode: "judge",
    judgeBundle: lesson.judgeBundle,
  });
  if (composed.jsSyntaxError !== null) return syntaxErrorVerdict(composed.jsSyntaxError);
  return runDomJudge(composed.html, nonce);
}

/**
 * ライブプレビュー用の srcdoc 合成(§6.1、§6.2)。
 * jsSyntaxError 時は JS を注入しない(HTML / CSS は描画される)。
 */
export function composePreview(input: { files: FileMap; lessonSlug: string; origin: string }): {
  html: string;
  nonce: string;
  jsSyntaxError: SyntaxDiag | null;
} {
  const nonce = crypto.randomUUID();
  const { html, jsSyntaxError } = composeDocument({
    files: input.files,
    lessonSlug: input.lessonSlug,
    origin: input.origin,
    nonce,
    mode: "preview",
  });
  return { html, nonce, jsSyntaxError };
}

/** worker 系レッスンのプレビュー / 見本用コンソール捕捉(2000ms cap) */
export function runWorkerConsole(files: FileMap): Promise<{
  console: ConsoleEntry[];
  timedOut: boolean;
  syntaxError: SyntaxDiag | null;
}> {
  return runWorkerConsoleImpl(files);
}
