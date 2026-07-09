import { describe, expect, it } from "vitest";
import { JUDGE_TIMEOUT_MS, LOOP_MAX_ITERATIONS, TIMEOUT_MESSAGE_JP, WORKER_TIMEOUT_MS } from "./limits";

describe("limits(§5.5 の確定値 — 変更は DesignDoc 改訂が先)", () => {
  it("判定全体タイムアウトは 5000ms", () => {
    expect(JUDGE_TIMEOUT_MS).toBe(5000);
  });

  it("Worker タイムアウトは 2000ms", () => {
    expect(WORKER_TIMEOUT_MS).toBe(2000);
  });

  it("ループ保護カウンタは 10 万回", () => {
    expect(LOOP_MAX_ITERATIONS).toBe(100000);
  });

  it("タイムアウト文言は無限ループに言及する", () => {
    expect(TIMEOUT_MESSAGE_JP).toContain("無限ループ");
  });
});
