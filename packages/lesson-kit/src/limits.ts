// 実行プロトコルの制限値(DesignDoc §5.5)。値の変更は DesignDoc 改訂が先。

export const JUDGE_TIMEOUT_MS = 5000;
export const WORKER_TIMEOUT_MS = 2000;
export const LOOP_MAX_ITERATIONS = 100000;

/**
 * 1 check あたりの評価上限(docs/specs/J-judge-hardening.md)。
 * 解決しない Promise を返す fn / custom check が判定全体タイムアウトまで
 * 巻き込まないための内側の砦。超過した check は不合格として後続の評価を続行し、
 * Verdict.details の完全性を守る。JUDGE_TIMEOUT_MS / WORKER_TIMEOUT_MS より小さいこと。
 */
export const CHECK_TIMEOUT_MS = 1500;

export const TIMEOUT_MESSAGE_JP = "時間内に判定が終わりませんでした。無限ループになっていませんか?";
