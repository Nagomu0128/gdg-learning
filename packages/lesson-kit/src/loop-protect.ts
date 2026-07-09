// ループ保護(DesignDoc §6.6)— acorn で parse し for/while/do-while/for-of/for-in に脱出カウンタを注入。
// app のメインスレッドでのみ実行(判定バンドルには入らない)。
//
// ⚠ STUB: エージェント A が acorn ベースの本実装 + テストに置き換える。
// 現状はパススルー(構文エラー検出のみ)。

import { LOOP_MAX_ITERATIONS } from "./limits";
import { diagnoseJsParseError, generalSyntaxErrorMessage } from "./zenkaku";

export type SyntaxDiag = { line: number; message: string };

export type InstrumentResult = { ok: true; code: string } | { ok: false; error: SyntaxDiag };

/** カウンタ超過時に throw される専用エラーの message(ランナーはこれを見て LOOP_LIMIT_MESSAGE_JP に変換) */
export const LOOP_PROTECT_ERROR_MESSAGE = "__LOOP_LIMIT_EXCEEDED__";
export const LOOP_LIMIT_MESSAGE_JP = "無限ループになっていませんか? ループの回数が上限を超えました";

export function instrumentLoops(
  source: string,
  opts?: { maxIterations?: number },
): InstrumentResult {
  const _max = opts?.maxIterations ?? LOOP_MAX_ITERATIONS;
  // STUB 実装: 構文チェックのみ行い、コードは無変換で返す。
  // 本実装(A): acorn.parse → ループ本体へ `if (++__loopN > max) throw new Error(LOOP_PROTECT_ERROR_MESSAGE)` を注入。
  try {
    // eslint-disable-next-line no-new-func
    new Function(source);
  } catch (e) {
    const line = extractLine(e) ?? 1;
    const zenkaku = diagnoseJsParseError(source, { line, column: 0 });
    if (zenkaku) return { ok: false, error: zenkaku };
    return { ok: false, error: { line, message: generalSyntaxErrorMessage(line) } };
  }
  return { ok: true, code: source };
}

function extractLine(e: unknown): number | null {
  if (e instanceof Error) {
    const m = /<anonymous>:(\d+)/.exec(e.stack ?? "");
    if (m?.[1]) return Math.max(1, Number(m[1]) - 2);
  }
  return null;
}
