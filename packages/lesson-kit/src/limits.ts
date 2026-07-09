// 実行プロトコルの制限値(DesignDoc §5.5)。値の変更は DesignDoc 改訂が先。

export const JUDGE_TIMEOUT_MS = 5000;
export const WORKER_TIMEOUT_MS = 2000;
export const LOOP_MAX_ITERATIONS = 100000;

export const TIMEOUT_MESSAGE_JP = "時間内に判定が終わりませんでした。無限ループになっていませんか?";
