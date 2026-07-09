import { describe, expect, it } from "vitest";
import { deriveHintState } from "./hints";

describe("deriveHintState(§7.3: unlocked = min(floor(failed/2), hintCount))", () => {
  it("失敗 0〜1 回は開放なし", () => {
    expect(deriveHintState(0, 3)).toEqual({ unlockedHintCount: 0, solutionAvailable: false });
    expect(deriveHintState(1, 3)).toEqual({ unlockedHintCount: 0, solutionAvailable: false });
  });

  it("失敗 2 回ごとに 1 つ開放", () => {
    expect(deriveHintState(2, 3).unlockedHintCount).toBe(1);
    expect(deriveHintState(3, 3).unlockedHintCount).toBe(1);
    expect(deriveHintState(4, 3).unlockedHintCount).toBe(2);
  });

  it("ヒント総数で頭打ち", () => {
    expect(deriveHintState(100, 3).unlockedHintCount).toBe(3);
  });

  it("答えは failed >= 2 × hintCount で開放", () => {
    expect(deriveHintState(5, 3).solutionAvailable).toBe(false);
    expect(deriveHintState(6, 3).solutionAvailable).toBe(true);
    expect(deriveHintState(7, 3).solutionAvailable).toBe(true);
  });

  it("負の failedCount は 0 扱い", () => {
    expect(deriveHintState(-1, 3)).toEqual({ unlockedHintCount: 0, solutionAvailable: false });
  });
});
