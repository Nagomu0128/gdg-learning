import { expect, test } from "@playwright/test";
import { devLogin } from "./helpers";

test.describe("認証ガード(CONTRACTS §4.3 / §6)", () => {
  test("未ログインで /me を開くと / へリダイレクトされる", async ({ page }) => {
    await page.goto("/me");
    // requireUser は redirect("/") を throw する契約
    await expect(page).toHaveURL("/");
  });

  test("POST /api/dev-login は 302 + Set-Cookie を返し、以降 /me が 200 になる", async ({ page }) => {
    const res = await page.request.post("/api/dev-login", { maxRedirects: 0 });
    expect(res.status()).toBe(302);
    expect(res.headers().location, "リダイレクト先は /courses(CONTRACTS §4.3)").toContain("/courses");
    const hasSetCookie = res.headersArray().some((h) => h.name.toLowerCase() === "set-cookie");
    expect(hasSetCookie, "セッション Cookie が発行される契約").toBe(true);

    const meRes = await page.goto("/me");
    expect(meRes?.status()).toBe(200);
    await expect(page).toHaveURL(/\/me$/);
  });

  test("dev-login ヘルパー経由でマイページに到達できる", async ({ page }) => {
    await devLogin(page);
    await page.goto("/me");
    await expect(page).toHaveURL(/\/me$/);
  });
});
