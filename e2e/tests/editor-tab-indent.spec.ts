import { expect, test } from "@playwright/test";
import { devLogin } from "./helpers";

// エディタの Tab インデントとキーボード脱出経路(ADR #20 / DesignDoc §10.5)。
// 演習 loader は requireUser のみでスライド閲覧をゲートしないため、演習 URL へ直接遷移する。
const COURSE_SLUG = "html-basics";
const LESSON_SLUG = "html-01-first-page";
const EXERCISE_PATH = `/courses/${COURSE_SLUG}/${LESSON_SLUG}/exercise`;

test.describe("エディタの Tab インデント(ADR #20)", () => {
  test("Tab でインデント・フォーカス保持、Shift-Tab で解除、Escape→Tab でエディタ外へ", async ({ page }) => {
    test.setTimeout(120_000);

    await devLogin(page);
    await page.goto(EXERCISE_PATH);

    // 演習画面は遅延ロード(CodeMirror を SSR に載せない)。dev サーバーの初回コンパイルが
    // 重なると 30 秒を超えるため 60 秒待つ(file-tree / learning-flow と同じ方針)
    const editor = page.locator(".cm-content").first();
    await expect(editor).toBeVisible({ timeout: 60_000 });
    await editor.click();
    await expect(editor).toBeFocused();

    // ドキュメントを空にしてから Tab → 文字入力(indentUnit = 半角スペース2)
    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.press("Delete");
    await page.keyboard.press("Tab");
    await page.keyboard.type("ok");

    // (1) Tab が行頭に indentUnit(半角スペース2)を挿入し、キャレットは追従する。
    // toHaveText は空白を正規化して先頭スペースの欠落を検出できないため、生の textContent で比較する
    const firstLine = editor.locator(".cm-line").first();
    await expect.poll(async () => (await firstLine.textContent()) ?? "").toBe("  ok");
    // (2) Tab はエディタ内で処理され、フォーカスは移動しない(脱出経路は (4) で保証)
    await expect(editor).toBeFocused();

    // (3) Shift-Tab はインデント解除(カーソルが行頭になくても行単位で効く)
    await page.keyboard.press("Shift+Tab");
    await expect.poll(async () => (await firstLine.textContent()) ?? "").toBe("ok");

    // (4) Escape 直後の Tab はフォーカス移動になる(@codemirror/view 組み込みの tabFocusMode)
    await page.keyboard.press("Escape");
    await page.keyboard.press("Tab");
    await expect(editor).not.toBeFocused();
  });
});
