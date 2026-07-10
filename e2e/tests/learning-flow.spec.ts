import { readdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
// 教材が SSOT(DesignDoc §1.3)— solution を教材定義から直接読む(手書き複製しない)
import lesson01 from "../../content/courses/html-basics/lessons/01-first-page/lesson";
import { devLogin } from "./helpers";
import { UI_TEXT } from "./selectors";

const COURSE_SLUG = "html-basics";
const LESSON_SLUG = "html-01-first-page";

test.describe("学習フロー一気通貫(SPEC K §3-2)", () => {
  test("dev-login → コース → スライド → 演習合格 → クリア画面 → バッジ", async ({ page }) => {
    test.setTimeout(120_000);

    // 1. 開発ログイン(302 + Set-Cookie)
    await devLogin(page);

    // 2. コース一覧 → HTML入門(カードのリンク名は「はじめる/つづける」のため testid で特定)
    await page.goto("/courses");
    await page.getByTestId(`course-card-${COURSE_SLUG}`).getByRole("link").first().click();
    await page.waitForURL(`**/courses/${COURSE_SLUG}`);

    // 3. レッスン一覧 → レッスン1(F 実装: クリックで slides/1 へ)
    await page
      .getByRole("link", { name: new RegExp(lesson01.title) })
      .first()
      .click();
    await page.waitForURL(new RegExp(`/courses/${COURSE_SLUG}/${LESSON_SLUG}/slides/1$`));

    // 4. →キーでスライドを最後まで送る(§10.5 キーボード操作)。
    // スライド本文はクライアント側 loadSlide で描画される = 見出しの出現がハイドレーション完了の証拠。
    // その後は 1 枚ごとに URL 遷移を確実に待つ(並列実行でサーバーが遅くても押し流されない)
    const slideCount = readdirSync(
      join(import.meta.dirname, `../../content/courses/${COURSE_SLUG}/lessons/01-first-page/slides`),
    ).filter((f) => f.endsWith(".mdx")).length;
    const slideRegion = page.getByRole("region", { name: /スライド/ });
    await expect(slideRegion.getByRole("heading").first()).toBeVisible({ timeout: 30_000 });
    for (let k = 2; k <= slideCount; k++) {
      await page.keyboard.press("ArrowRight");
      await page.waitForURL(new RegExp(`/slides/${k}$`), { timeout: 20_000 });
      await expect(slideRegion.getByRole("heading").first()).toBeVisible({ timeout: 20_000 });
    }

    // 5. 最終スライドの導線から演習へ
    const exerciseLink = page.getByRole("link", { name: UI_TEXT.exerciseLink }).first();
    await exerciseLink.click();
    await page.waitForURL(new RegExp(`/courses/${COURSE_SLUG}/${LESSON_SLUG}/exercise$`));

    // 6. CodeMirror に solution を入力(全選択 → insertText。SPEC K の fallback 方式)
    const solutionCode = lesson01.solution["index.html"];
    expect(solutionCode, "html-01 の solution に index.html が存在する前提").toBeTruthy();
    const editor = page.locator(".cm-content").first();
    await editor.waitFor({ state: "visible", timeout: 30_000 });
    await editor.click();
    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.press("Delete");
    await page.keyboard.insertText(solutionCode as string);

    // 7. 「できた!」で提出(クライアント判定 → POST。§9.1)
    await page.getByRole("button", { name: UI_TEXT.submitButton }).click();

    // 8. クリア画面(ストリーク演出。SPEC E §4)
    await expect(page.getByText(UI_TEXT.clearHeading).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(UI_TEXT.streakText).first()).toBeVisible();

    // 9. マイページで first_pass バッジ(「はじめの一歩」)を確認
    await page.goto("/me");
    await expect(page).toHaveURL(/\/me$/);
    await expect(page.getByText(UI_TEXT.firstPassBadgeTitle).first()).toBeVisible();
  });
});
