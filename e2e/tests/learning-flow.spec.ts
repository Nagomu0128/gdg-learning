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

    // 2. コース一覧 → HTML入門
    await page.goto("/courses");
    await page.getByRole("link", { name: UI_TEXT.htmlCourseTitle }).first().click();
    await page.waitForURL(`**/courses/${COURSE_SLUG}`);

    // 3. レッスン一覧 → レッスン1(F 実装: クリックで slides/1 へ)
    await page
      .getByRole("link", { name: new RegExp(lesson01.title) })
      .first()
      .click();
    await page.waitForURL(new RegExp(`/courses/${COURSE_SLUG}/${LESSON_SLUG}/slides/1$`));

    // 4. →キーでスライドを最後まで送る(§10.5 キーボード操作)
    for (let i = 0; i < 20; i++) {
      const beforeUrl = page.url();
      await page.keyboard.press("ArrowRight");
      await page.waitForURL((url) => url.toString() !== beforeUrl, { timeout: 3_000 }).catch(() => undefined);
      if (page.url() === beforeUrl) break; // 最終スライドに到達(URL が進まなくなった)
    }

    // 5. 最終スライドの導線から演習へ
    await page.getByRole("link", { name: UI_TEXT.exerciseLink }).first().click();
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
