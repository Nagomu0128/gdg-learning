import { describe, expect, it } from "vitest";
import {
  CHECK_TIMEOUT_MS,
  JUDGE_TIMEOUT_MS,
  LOOP_MAX_ITERATIONS,
  TIMEOUT_MESSAGE_JP,
  WORKER_TIMEOUT_MS,
} from "./limits";

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

  it("per-check タイムアウトは 1500ms(J-judge-hardening)", () => {
    expect(CHECK_TIMEOUT_MS).toBe(1500);
  });

  it("per-check タイムアウトは全体タイムアウトより小さい(内側の砦)", () => {
    // 1 check のハングが全体タイムアウトを食い潰さず、後続 check の評価予算が残ること
    expect(CHECK_TIMEOUT_MS).toBeLessThan(WORKER_TIMEOUT_MS);
    expect(CHECK_TIMEOUT_MS).toBeLessThan(JUDGE_TIMEOUT_MS);
  });
});
