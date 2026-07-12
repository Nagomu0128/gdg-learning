// レッスン実行基盤(L-runtime)の E2E: TS トランスパイル / vendor React / git-sim 再生。
// 教材が SSOT — solution は教材定義から直接読む(learning-flow.spec.ts と同じ流儀)。
import { expect, type Page, test } from "@playwright/test";
import gitLesson from "../../content/courses/git/lessons/01-init/lesson";
import gitTeamFlowLesson from "../../content/courses/git/lessons/14-team-flow/lesson";
import libLesson from "../../content/courses/libs-basics/lessons/01-script-tag/lesson";
import reactLesson from "../../content/courses/react-basics/lessons/01-first-component/lesson";
import tsLesson from "../../content/courses/ts-basics/lessons/01-hello-types/lesson";
import { devLogin } from "./helpers";
import { fileTabTestId, UI_TEXT } from "./selectors";

/** CodeMirror へ solution を貼る(SPEC K の fallback 方式: 全選択 → insertText) */
async function fillEditor(page: Page, code: string): Promise<void> {
  const editor = page.locator(".cm-content").first();
  await editor.waitFor({ state: "visible", timeout: 30_000 });
  await editor.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.press("Delete");
  await page.keyboard.insertText(code);
}

async function submitAndExpectClear(page: Page): Promise<void> {
  await page.getByRole("button", { name: UI_TEXT.submitButton }).click();
  await expect(page.getByText(UI_TEXT.clearHeading).first()).toBeVisible({ timeout: 30_000 });
}

test.describe("レッスン実行基盤(L-runtime)", () => {
  test("react-01: プレビューに React の出力が表示され、判定に合格する", async ({ page }) => {
    test.setTimeout(120_000);
    await devLogin(page);
    await page.goto("/courses/react-basics/react-01-first-component/exercise");

    // index.html(読み取り専用)が先頭タブ。app.jsx タブへ切り替えて solution を入力
    await page.getByTestId(fileTabTestId("app.jsx")).click();
    const solution = reactLesson.solution["app.jsx"];
    expect(solution, "react-01 の solution に app.jsx が存在する前提").toBeTruthy();
    await fillEditor(page, solution as string);

    // .jsx は明示実行(▶ 実行)で再レンダリング(§2.3 の JS 系と同じ扱い)
    await page.getByTestId("run-button").click();

    // プレビュー iframe 内に React が描画した <h1> が出る(vendor UMD + JSX 変換の一気通貫)
    const frame = page.frameLocator('iframe[title="あなたの結果"]');
    await expect(frame.locator("#root h1")).toHaveText("こんにちは、React!", { timeout: 30_000 });

    await submitAndExpectClear(page);
  });

  test("git-01: プレビューにターミナル再生(コマンドと出力)が表示され、判定に合格する", async ({ page }) => {
    test.setTimeout(120_000);
    await devLogin(page);
    await page.goto("/courses/git/git-01-init/exercise");

    const solution = gitLesson.solution["commands.sh"];
    expect(solution, "git-01 の solution に commands.sh が存在する前提").toBeTruthy();
    await fillEditor(page, solution as string);

    // .sh の編集は 300ms デバウンスでプレビューに自動追従する
    const frame = page.frameLocator('iframe[title="あなたの結果"]');
    await expect(frame.getByText("$ git init")).toBeVisible({ timeout: 30_000 });
    await expect(frame.getByText("最初のコミット").first()).toBeVisible();
    // コミット結果の出力([main <hash>] 形式)と履歴グラフも再生される
    await expect(frame.getByText(/\[main [0-9a-f]{7}\]/)).toBeVisible();
    await expect(frame.getByText(/履歴.*git log --graph/)).toBeVisible();

    await submitAndExpectClear(page);
  });

  test("git-14: 総合レッスンのフロー一巡(分岐→コミット→マージ→push)が再生され、判定に合格する", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await devLogin(page);
    await page.goto("/courses/git/git-14-team-flow/exercise");

    const solution = gitTeamFlowLesson.solution["commands.sh"];
    expect(solution, "git-14 の solution に commands.sh が存在する前提").toBeTruthy();
    await fillEditor(page, solution as string);

    // .sh の編集は 300ms デバウンスでプレビューに自動追従する
    const frame = page.frameLocator('iframe[title="あなたの結果"]');
    await expect(frame.getByText("$ git switch -c feature")).toBeVisible({ timeout: 30_000 });
    // 各段階の出力: feature でのコミット / 早送りマージ / リモートへの push
    await expect(frame.getByText(/\[feature [0-9a-f]{7}\]/)).toBeVisible();
    await expect(frame.getByText(/Fast-forward/)).toBeVisible();
    await expect(frame.getByText(/To origin/)).toBeVisible();

    await submitAndExpectClear(page);
  });

  test("lib-01: dayjs を vendor script(絶対パス)で読み込み、日付整形の判定に合格する", async ({ page }) => {
    test.setTimeout(120_000);
    await devLogin(page);
    await page.goto("/courses/libs-basics/lib-01-script-tag/exercise");

    // 他3レッスンと違う失敗パターン: script タグを index.html に「手書き挿入」し、
    // かつ main.js より前(絶対パス /vendor/dayjs.min.js)に置く必要がある。
    // editable な2ファイル(index.html / main.js)の両方を solution にする。
    const html = libLesson.solution["index.html"];
    const mainJs = libLesson.solution["main.js"];
    expect(html, "lib-01 の solution に index.html が存在する前提").toBeTruthy();
    expect(mainJs, "lib-01 の solution に main.js が存在する前提").toBeTruthy();

    await page.getByTestId(fileTabTestId("index.html")).click();
    await fillEditor(page, html as string);
    await page.getByTestId(fileTabTestId("main.js")).click();
    await fillEditor(page, mainJs as string);

    // JS 編集はプレビュー自動追従しないため、明示実行(▶ 実行)で現在のファイルを再合成する
    await page.getByTestId("run-button").click();

    // vendor の dayjs が読み込まれ、#date に整形結果が描画される(絶対パス vendor の一気通貫)
    const frame = page.frameLocator('iframe[title="あなたの結果"]');
    await expect(frame.locator("#date")).toHaveText("2026年01月01日", { timeout: 30_000 });

    await submitAndExpectClear(page);
  });

  test("ts-01: TS レッスン(worker)の判定に合格する", async ({ page }) => {
    test.setTimeout(120_000);
    await devLogin(page);
    await page.goto("/courses/ts-basics/ts-01-hello-types/exercise");

    const solution = tsLesson.solution["script.ts"];
    expect(solution, "ts-01 の solution に script.ts が存在する前提").toBeTruthy();
    await fillEditor(page, solution as string);

    await submitAndExpectClear(page);
  });
});
