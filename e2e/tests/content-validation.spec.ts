import { expect, test } from "@playwright/test";
import { TESTID } from "./selectors";

test.describe("教材 自己整合性検証(DesignDoc §4.4 ステージ2)", () => {
  test("全レッスンの solution が全 checks に合格する(/dev/validate が PASS)", async ({ page }) => {
    // 101 レッスン(基礎 32 + 中級/上級/応用 69 — CURRICULUM-2)を順に judge するため長め
    // (32 レッスン時代の 180s を比例拡大。goto 等のオーバーヘッド分を内側の合計より余分に取る)
    test.setTimeout(480_000);
    await page.goto("/dev/validate");
    const summary = page.getByTestId(TESTID.validateSummary);
    // summary は全レッスンの判定完了後にのみ描画される — 判定全体ぶんの timeout を与える
    await expect(summary).toBeVisible({ timeout: 420_000 });
    // 契約(CONTRACTS §8): `PASS n/n` で始まる。FAIL の場合は失敗 slug が列挙される
    await expect(summary).toHaveText(/^PASS/, { timeout: 30_000 });
  });
});
