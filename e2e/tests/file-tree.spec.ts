import { expect, test } from "@playwright/test";
import { devLogin } from "./helpers";
import { fileTabTestId, fileTreeItemTestId, TESTID } from "./selectors";

// ファイルツリーは「hidden 除外後 3 ファイル以上」の演習でのみ md+ に表示される(CURRICULUM-2)。
// cap-01-profile-card は index.html + style.css + script.js の3ファイルすべて編集可。
const COURSE_SLUG = "capstone-projects";
const LESSON_SLUG = "cap-01-profile-card";
const EXERCISE_PATH = `/courses/${COURSE_SLUG}/${LESSON_SLUG}/exercise`;
const FILE_NAMES = ["index.html", "style.css", "script.js"] as const;

// 対照レッスン: html-01 は index.html の1ファイルのみ(learning-flow.spec.ts と同じ slug)
const TABS_ONLY_EXERCISE_PATH = "/courses/html-basics/html-01-first-page/exercise";

test.describe("演習画面のファイルツリー(CURRICULUM-2 プラットフォーム変更 1)", () => {
  test("md+: 3ファイル演習でツリーが表示され、クリックで選択が移る", async ({ page }) => {
    test.setTimeout(120_000);
    await devLogin(page);
    await page.goto(EXERCISE_PATH);

    // 演習画面は遅延ロード(CodeMirror を SSR に載せない)。dev サーバーの初回コンパイルが
    // 重なると 30 秒を超えるため、初回表示は 60 秒待つ(learning-flow と同じ方針)
    const tree = page.getByTestId(TESTID.fileTree);
    await expect(tree).toBeVisible({ timeout: 60_000 });
    for (const name of FILE_NAMES) {
      await expect(tree.getByTestId(fileTreeItemTestId(name))).toBeVisible();
    }

    // 初期選択は先頭ファイル。style.css クリックで aria-selected が移る(エディタ切替の確認)
    const htmlItem = tree.getByTestId(fileTreeItemTestId("index.html"));
    const cssItem = tree.getByTestId(fileTreeItemTestId("style.css"));
    await expect(htmlItem).toHaveAttribute("aria-selected", "true");
    await cssItem.click();
    await expect(cssItem).toHaveAttribute("aria-selected", "true");
    await expect(htmlItem).toHaveAttribute("aria-selected", "false");
  });

  test("md 未満: ツリーは非表示になり従来のファイルタブに切り替わる", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 640, height: 900 }); // md(768px)未満
    await devLogin(page);
    await page.goto(EXERCISE_PATH);

    // モバイルの既定ペインは「コード」— ファイルタブの出現が読み込み完了の証拠
    await expect(page.getByTestId(fileTabTestId("style.css"))).toBeVisible({ timeout: 60_000 });
    // ツリーは CSS(hidden md:block)で隠れる(DOM には残る)
    await expect(page.getByTestId(TESTID.fileTree)).toBeHidden();
  });

  test("2ファイル以下の演習では md+ でもツリーを出さない", async ({ page }) => {
    test.setTimeout(120_000);
    await devLogin(page);
    await page.goto(TABS_ONLY_EXERCISE_PATH);

    // 読み込み完了はエディタの出現で確認(learning-flow.spec.ts と同じ待ち方)
    await expect(page.locator(".cm-content").first()).toBeVisible({ timeout: 60_000 });
    // ファイル数 < 3 ではツリー自体をレンダリングしない
    await expect(page.getByTestId(TESTID.fileTree)).toHaveCount(0);
  });
});
