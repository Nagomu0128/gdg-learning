import { expect, type Page } from "@playwright/test";

/**
 * 開発用ログイン(CONTRACTS §4.3): POST /api/dev-login → 302 + Set-Cookie。
 * page.request はブラウザコンテキストと Cookie jar を共有するため、
 * この呼び出し以降 page はログイン済みとして振る舞う。
 */
export async function devLogin(page: Page): Promise<void> {
  const res = await page.request.post("/api/dev-login", { maxRedirects: 0 });
  expect(res.status(), "dev-login は 302 を返す契約(CONTRACTS §4.3。DEV_LOGIN=1 が必要)").toBe(302);
}
