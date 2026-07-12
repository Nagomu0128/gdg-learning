// 判定パイプライン公開 API(CONTRACTS §3.2)。シグネチャ変更禁止。
import {
  type ConsoleEntry,
  type FileMap,
  lintCss,
  lintHtml,
  type MarkupDiag,
  type SyntaxDiag,
  type Verdict,
} from "@codesteps/lesson-kit";
import type { LoadedLesson } from "~/generated/lessons.client";
import { composeDocument } from "./composer";
import { runDomJudge } from "./dom-runner";
import { ensureTranspiler } from "./transpile";
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
 * HTML / CSS の構造ゲート(ADR #18)。
 * ブラウザは壊れたマークアップを自動修復するため(例: `</h1` は EOF で捨てられる)、
 * DOM 検査の check だけでは不完全な提出が合格してしまう。JS の acorn ゲートと対称に、
 * 構造エラーを check 評価の前段でブロックする。リンターは偽陽性ゼロ側(§5.4)に倒してある。
 */
function findMarkupError(files: FileMap): Verdict | null {
  const targets = Object.keys(files).filter((f) => f.endsWith(".html") || f.endsWith(".css"));
  for (const name of targets) {
    const source = files[name] ?? "";
    const diags: MarkupDiag[] = name.endsWith(".html") ? lintHtml(source) : lintCss(source);
    const first = diags[0];
    if (first) {
      // 表示は最初の失敗 1 件(§5.1)。複数ファイル構成のときだけファイル名を前置する
      const message = targets.length > 1 ? `${name}: ${first.message}` : first.message;
      return {
        passed: false,
        display: { checkId: "__markup__", message },
        details: [],
        console: [],
        timedOut: false,
      };
    }
  }
  return null;
}

/**
 * 判定エンジン(§5.1)。runner 種別は lesson.meta.runner で分岐し、
 * 呼び出し側はレッスン種別を意識しない(戦略パターン)。
 */
export async function judge(lesson: LoadedLesson, files: FileMap): Promise<Verdict> {
  const nonce = crypto.randomUUID();
  const markupError = findMarkupError(files);
  if (markupError) return markupError;
  // TS/TSX/JSX を含むレッスンのみ sucrase チャンクをロードする(L-runtime)
  const transpile = (await ensureTranspiler(files)) ?? undefined;
  if (lesson.meta.runner === "worker") {
    const built = buildWorkerSource({
      files,
      judgeBundle: lesson.judgeBundle,
      nonce,
      relayConsole: true,
      transpile,
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
    transpile,
  });
  if (composed.jsSyntaxError !== null) return syntaxErrorVerdict(composed.jsSyntaxError);
  return runDomJudge(composed.html, nonce);
}

/**
 * ライブプレビュー用の srcdoc 合成(§6.1、§6.2)。
 * jsSyntaxError 時は JS を注入しない(HTML / CSS は描画される)。
 * TS/TSX/JSX レッスンで sucrase を遅延ロードするため async(L-runtime。
 * `.ts/.tsx/.jsx` を含まないレッスンではチャンクを読み込まず即 resolve する)。
 */
export async function composePreview(input: { files: FileMap; lessonSlug: string; origin: string }): Promise<{
  html: string;
  nonce: string;
  jsSyntaxError: SyntaxDiag | null;
}> {
  const nonce = crypto.randomUUID();
  const transpile = (await ensureTranspiler(input.files)) ?? undefined;
  const { html, jsSyntaxError } = composeDocument({
    files: input.files,
    lessonSlug: input.lessonSlug,
    origin: input.origin,
    nonce,
    mode: "preview",
    transpile,
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
