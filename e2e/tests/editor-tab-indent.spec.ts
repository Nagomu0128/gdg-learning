import { expect, test } from "@playwright/test";
import { devLogin } from "./helpers";
import { fileTabTestId } from "./selectors";

// エディタの Tab インデントとキーボード脱出経路(ADR #20 / DesignDoc §10.5)。
// 演習 loader は requireUser のみでスライド閲覧をゲートしないため、演習 URL へ直接遷移する。
const EXERCISE_PATH = "/courses/html-basics/html-01-first-page/exercise";
// readOnly 検証用: index.html が editable:false の演習(css-basics 10-card)
const READONLY_EXERCISE_PATH = "/courses/css-basics/css-10-card/exercise";

test.describe("エディタの Tab インデント(ADR #20)", () => {
  test("Tab でインデント・undo で復元・Shift-Tab で解除、Escape→Tab でエディタ外へ", async ({ page }) => {
    test.setTimeout(120_000);

    await devLogin(page);
    await page.goto(EXERCISE_PATH);

    // 演習画面は遅延ロード(CodeMirror を SSR に載せない)。dev サーバーの初回コンパイルが
    // 重なると 30 秒を超えるため 60 秒待つ(file-tree / learning-flow と同じ方針)
    const editor = page.locator(".cm-content").first();
    await expect(editor).toBeVisible({ timeout: 60_000 });

    // 脱出手段の周知(WCAG 2.1.2): エディタ直下の常時ヒント + aria-describedby の紐づけ
    const hint = page.getByTestId("editor-tab-hint");
    await expect(hint).toBeVisible();
    await expect(hint).toContainText("Esc");
    expect(await editor.getAttribute("aria-describedby")).toBe(await hint.getAttribute("id"));

    await editor.click();
    await expect(editor).toBeFocused();

    // ドキュメントを「ok」だけにする(カーソルは行末 = 行頭以外でも行インデントが効くことを見る)
    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.press("Delete");
    await page.keyboard.type("ok");

    // (1) Tab が行頭に indentUnit(半角スペース2)を挿入する。
    // toHaveText は空白を正規化して先頭スペースの欠落を検出できないため、生の textContent で比較する
    const firstLine = editor.locator(".cm-line").first();
    await page.keyboard.press("Tab");
    await expect.poll(async () => (await firstLine.textContent()) ?? "").toBe("  ok");
    // (2) Tab はエディタ内で処理され、フォーカスは移動しない(脱出経路は (5) で保証)
    await expect(editor).toBeFocused();

    // (3) インデントは undo 1 回で戻る(historyKeymap との共存)
    await page.keyboard.press("ControlOrMeta+z");
    await expect.poll(async () => (await firstLine.textContent()) ?? "").toBe("ok");

    // (4) Shift-Tab はインデント解除(カーソルが行頭になくても行単位で効く)
    await page.keyboard.press("Tab");
    await expect.poll(async () => (await firstLine.textContent()) ?? "").toBe("  ok");
    await page.keyboard.press("Shift+Tab");
    await expect.poll(async () => (await firstLine.textContent()) ?? "").toBe("ok");

    // (5) Escape 直後の Tab はフォーカス移動になる(@codemirror/view 組み込みの tabFocusMode)
    await page.keyboard.press("Escape");
    await page.keyboard.press("Tab");
    await expect(editor).not.toBeFocused();
  });

  test("readOnly ファイルでは Tab がドキュメントを変更しない(ヒントも出さない)", async ({ page }) => {
    test.setTimeout(120_000);

    await devLogin(page);
    await page.goto(READONLY_EXERCISE_PATH);

    const editor = page.locator(".cm-content").first();
    await expect(editor).toBeVisible({ timeout: 60_000 });

    // index.html(editable:false)のタブを選択 → readOnly エディタ
    await page.getByTestId(fileTabTestId("index.html")).click();
    await expect(editor).toHaveAttribute("contenteditable", "false");
    // Tab を奪わない readOnly エディタでは周知ヒントを表示しない
    await expect(page.getByTestId("editor-tab-hint")).toHaveCount(0);

    const before = await editor.textContent();
    await editor.click();
    await page.keyboard.press("Tab");
    // ドキュメントは不変で、フォーカスはエディタに残らない(ブラウザ標準のフォーカス移動)
    expect(await editor.textContent()).toBe(before);
    await expect(editor).not.toBeFocused();
  });
});
