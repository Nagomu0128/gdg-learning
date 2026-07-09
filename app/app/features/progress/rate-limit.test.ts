import { describe, expect, it } from "vitest";
import { evaluateRateLimit, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "./rate-limit";

const NOW = 1_800_000_000_000;

describe("evaluateRateLimit(30回/分のスライディングウィンドウ §10.4)", () => {
  it("空(初回)は許可し、now を記録する", () => {
    const r = evaluateRateLimit(null, NOW);
    expect(r.limited).toBe(false);
    expect(r.next).toEqual([NOW]);
  });

  it("窓内 29 件は許可(30 件目の提出)", () => {
    const stored = Array.from({ length: RATE_LIMIT_MAX - 1 }, (_, i) => NOW - 1000 * (i + 1));
    const r = evaluateRateLimit(stored, NOW);
    expect(r.limited).toBe(false);
    expect(r.next).toHaveLength(RATE_LIMIT_MAX);
  });

  it("窓内 30 件で制限(31 件目の提出)", () => {
    const stored = Array.from({ length: RATE_LIMIT_MAX }, (_, i) => NOW - 1000 * (i + 1));
    const r = evaluateRateLimit(stored, NOW);
    expect(r.limited).toBe(true);
  });

  it("窓外(60 秒より前)のタイムスタンプは捨てられる", () => {
    const old = Array.from({ length: RATE_LIMIT_MAX }, (_, i) => NOW - RATE_LIMIT_WINDOW_MS - 1000 * (i + 1));
    const r = evaluateRateLimit(old, NOW);
    expect(r.limited).toBe(false);
    expect(r.next).toEqual([NOW]);
  });

  it("ちょうど窓の境界(now - 60000)は窓外扱い", () => {
    const stored = Array.from({ length: RATE_LIMIT_MAX }, () => NOW - RATE_LIMIT_WINDOW_MS);
    const r = evaluateRateLimit(stored, NOW);
    expect(r.limited).toBe(false);
  });

  it("壊れた値(非配列・非数値混入)はフェイルオープン", () => {
    expect(evaluateRateLimit("garbage", NOW).limited).toBe(false);
    expect(evaluateRateLimit({ a: 1 }, NOW).limited).toBe(false);
    const mixed = [NOW - 1000, "x", null, Number.NaN];
    const r = evaluateRateLimit(mixed, NOW);
    expect(r.limited).toBe(false);
    expect(r.next).toEqual([NOW - 1000, NOW]);
  });
});
