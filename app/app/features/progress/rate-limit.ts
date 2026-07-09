// 提出レート制限のスライディングウィンドウ判定(DesignDoc §10.4 / SPEC F §1-1)。純粋関数。
// KV には epoch ms 配列(JSON)を保持し、60 秒窓で 30 件以上なら制限。

export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX = 30;

export type RateLimitResult = {
  limited: boolean;
  /** limited=false のとき KV へ書き戻す配列(窓内 + 今回)。limited=true は書き戻し不要 */
  next: number[];
};

/** KV から読んだ値(型不明)と現在時刻から制限判定する。壊れた値は空扱い(フェイルオープン) */
export function evaluateRateLimit(stored: unknown, nowMs: number): RateLimitResult {
  const list = Array.isArray(stored)
    ? stored.filter((t): t is number => typeof t === "number" && Number.isFinite(t))
    : [];
  const inWindow = list.filter((t) => t > nowMs - RATE_LIMIT_WINDOW_MS && t <= nowMs);
  if (inWindow.length >= RATE_LIMIT_MAX) {
    return { limited: true, next: inWindow };
  }
  return { limited: false, next: [...inWindow, nowMs] };
}
