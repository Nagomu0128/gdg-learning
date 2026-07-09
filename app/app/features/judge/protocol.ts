// 判定・プレビューの postMessage プロトコル定数(CONTRACTS §3.2)。
// 判定バンドル(runtime)にも束ねられるため、このモジュールは依存を持たないこと。

/** プレビュー iframe / Worker からの console 中継: { kind, nonce, entry: ConsoleEntry } */
export const PREVIEW_CONSOLE_KIND = "preview:console";

/** 判定結果: { kind, nonce, verdict: Verdict } */
export const JUDGE_RESULT_KIND = "judge:result";

/** runWorkerConsole の完了通知(内部プロトコル): { kind, nonce } */
export const WORKER_CONSOLE_DONE_KIND = "preview:console-done";
