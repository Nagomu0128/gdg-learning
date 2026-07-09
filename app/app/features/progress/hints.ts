// ヒント開放の導出規則(DesignDoc §7.3)。保存せず毎回導出する。純粋関数。

export type HintState = {
  unlockedHintCount: number;
  solutionAvailable: boolean;
};

export function deriveHintState(failedCount: number, hintCount: number): HintState {
  const failed = Math.max(0, failedCount);
  return {
    unlockedHintCount: Math.min(Math.floor(failed / 2), hintCount),
    solutionAvailable: failed >= 2 * hintCount,
  };
}
