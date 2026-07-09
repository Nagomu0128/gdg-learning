// 学習イベント計測(DesignDoc §10.3)。ANALYTICS は optional バインディングのため
// 常に optional-chain で呼ぶ(CONTRACTS §4.2 — ローカル未定義でも壊れない)。
import type { Env } from "~/lib/env";

export function track(env: Env, event: string, data?: Record<string, unknown>): void {
  try {
    const lessonSlug = typeof data?.lessonSlug === "string" ? data.lessonSlug : "";
    env.ANALYTICS?.writeDataPoint({
      blobs: [event, lessonSlug],
      doubles: [1],
      indexes: [event],
    });
  } catch {
    // 計測失敗で学習フローを止めない
  }
}
