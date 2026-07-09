// Web Worker ランナー(§6.4)。純粋 JS レッスンの判定と、プレビュー / 見本用のコンソール捕捉。

import type { ConsoleEntry, FileMap, SyntaxDiag, Verdict } from "@codesteps/lesson-kit";
import { instrumentLoops, TIMEOUT_MESSAGE_JP, WORKER_TIMEOUT_MS } from "@codesteps/lesson-kit";
import { buildConsoleHook } from "./composer";
import { isConsoleEntry, isVerdict, messageRecord } from "./guards";
import { JUDGE_RESULT_KIND, PREVIEW_CONSOLE_KIND, WORKER_CONSOLE_DONE_KIND } from "./protocol";

export type WorkerSource = { source: string; syntaxError: SyntaxDiag | null };

/**
 * Worker で実行する 1 本のスクリプトを組み立てる(CONTRACTS §3.3)。
 * 構成: ①コンソールフック ②ループ保護済ユーザー JS ③判定バンドル ④startWorker。
 * ユーザー JS は try/catch で包む: 最上位で throw(ループ保護超過など)しても
 * 判定バンドル以降が実行される。function 宣言は sloppy mode の Annex B 昇格で
 * globalThis に残るため fn check(globalThis[name] 参照)と両立する。
 */
export function buildWorkerSource(opts: {
  files: FileMap;
  /** null ならコンソール捕捉のみ(runWorkerConsole 用)。末尾に完了通知を送る */
  judgeBundle: string | null;
  nonce: string;
  relayConsole: boolean;
}): WorkerSource {
  const parts: string[] = [];
  for (const name of Object.keys(opts.files)) {
    if (!name.toLowerCase().endsWith(".js")) continue;
    const result = instrumentLoops(opts.files[name] ?? "");
    if (!result.ok) return { source: "", syntaxError: result.error };
    parts.push(result.code);
  }
  const hook = buildConsoleHook({ nonce: opts.nonce, relay: opts.relayConsole, scope: "worker" });
  const userJs = parts.join("\n;\n");
  const tail =
    opts.judgeBundle !== null
      ? `${opts.judgeBundle}\n;globalThis.__JUDGE__.startWorker({ nonce: ${JSON.stringify(opts.nonce)}, files: ${JSON.stringify(opts.files)} });\n`
      : `self.postMessage({ kind: ${JSON.stringify(WORKER_CONSOLE_DONE_KIND)}, nonce: ${JSON.stringify(opts.nonce)} });\n`;
  const source = `${hook}\ntry {\n${userJs}\n} catch (e) { globalThis.__CAPTURE_ERROR__(e); }\n${tail}`;
  return { source, syntaxError: null };
}

function startWorker(source: string): { worker: Worker; dispose: () => void } {
  const url = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
  const worker = new Worker(url);
  return {
    worker,
    dispose: (): void => {
      worker.terminate();
      URL.revokeObjectURL(url);
    },
  };
}

/** 判定(worker 系)。2000ms で terminate(§6.4)— Worker は別スレッドのため確実に停止できる */
export function runWorkerJudge(source: string, nonce: string): Promise<Verdict> {
  return new Promise((resolve) => {
    const { worker, dispose } = startWorker(source);
    const captured: ConsoleEntry[] = [];
    let settled = false;
    const finish = (verdict: Verdict): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      dispose();
      resolve(verdict);
    };
    const timer = setTimeout(() => {
      finish({
        passed: false,
        display: { checkId: "__timeout__", message: TIMEOUT_MESSAGE_JP },
        details: [],
        console: captured,
        timedOut: true,
      });
    }, WORKER_TIMEOUT_MS);
    worker.onmessage = (e: MessageEvent): void => {
      const data = messageRecord(e.data);
      if (data === null || data.nonce !== nonce) return;
      if (data.kind === PREVIEW_CONSOLE_KIND && isConsoleEntry(data.entry)) {
        captured.push(data.entry);
        return;
      }
      if (data.kind === JUDGE_RESULT_KIND && isVerdict(data.verdict)) {
        finish(data.verdict);
      }
    };
  });
}

/** worker 系レッスンのプレビュー / 見本用: JS を実行しコンソールを捕捉する(CONTRACTS §3.2) */
export function runWorkerConsole(
  files: FileMap,
): Promise<{ console: ConsoleEntry[]; timedOut: boolean; syntaxError: SyntaxDiag | null }> {
  const nonce = crypto.randomUUID();
  const built = buildWorkerSource({ files, judgeBundle: null, nonce, relayConsole: true });
  if (built.syntaxError !== null) {
    return Promise.resolve({ console: [], timedOut: false, syntaxError: built.syntaxError });
  }
  return new Promise((resolve) => {
    const { worker, dispose } = startWorker(built.source);
    const entries: ConsoleEntry[] = [];
    let settled = false;
    const finish = (timedOut: boolean): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      dispose();
      resolve({ console: entries, timedOut, syntaxError: null });
    };
    const timer = setTimeout(() => finish(true), WORKER_TIMEOUT_MS);
    worker.onmessage = (e: MessageEvent): void => {
      const data = messageRecord(e.data);
      if (data === null || data.nonce !== nonce) return;
      if (data.kind === PREVIEW_CONSOLE_KIND && isConsoleEntry(data.entry)) {
        entries.push(data.entry);
        return;
      }
      if (data.kind === WORKER_CONSOLE_DONE_KIND) {
        finish(false);
      }
    };
  });
}
