import { expect, test } from "@playwright/test";
import { TESTID } from "./selectors";

test.describe("教材 自己整合性検証(DesignDoc §4.4 ステージ2 + J-judge-hardening)", () => {
  test("全レッスンの solution が合格し、initial(手つかず)は不合格になる(/dev/validate が PASS)", async ({
    page,
  }) => {
    // 101 レッスン(基礎 32 + 中級/上級/応用 69 — CURRICULUM-2)× 2 判定(solution 合格 + initial 不合格)。
    // dev.validate 側は並行度 2 で判定するため、判定数 2 倍でも壁時間は solution のみ時代の
    // 480s と同程度に収まる想定。余裕を持って 1.5 倍を確保する(CI 30 分枠内)
    test.setTimeout(720_000);
    await page.goto("/dev/validate");
    const summary = page.getByTestId(TESTID.validateSummary);
    // summary は全レッスンの判定完了後にのみ描画される — 判定全体ぶんの timeout を与える
    await expect(summary).toBeVisible({ timeout: 660_000 });
    // 契約(CONTRACTS §8): `PASS n/n` で始まる。FAIL の場合は失敗 slug と理由が列挙される
    // (solution 不合格 / 「initial のままで合格してしまいます」= check の穴)
    await expect(summary).toHaveText(/^PASS/, { timeout: 30_000 });
  });
});
