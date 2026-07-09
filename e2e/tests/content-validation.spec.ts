import { expect, test } from "@playwright/test";
import { TESTID } from "./selectors";

test.describe("教材 自己整合性検証(DesignDoc §4.4 ステージ2)", () => {
  test("全レッスンの solution が全 checks に合格する(/dev/validate が PASS)", async ({ page }) => {
    // 32 レッスンを順に judge するため長め(SPEC K: timeout 120s)
    test.setTimeout(180_000);
    await page.goto("/dev/validate");
    const summary = page.getByTestId(TESTID.validateSummary);
    await expect(summary).toBeVisible({ timeout: 30_000 });
    // 契約(CONTRACTS §8): `PASS n/n` で始まる。FAIL の場合は失敗 slug が列挙される
    await expect(summary).toHaveText(/^PASS/, { timeout: 120_000 });
  });
});
