import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

/**
 * E2E 設定(SPEC K §3)。
 * - webServer: `pnpm --filter @codesteps/app dev`(codegen → react-router dev)をリポジトリルートで起動
 * - 事前セットアップ(ローカル D1 マイグレーション適用)は global-setup.ts
 * - ポートは既定 5173。E2E_PORT で上書き可(並行作業時のポート衝突回避用)
 */
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.E2E_PORT ?? 5173);
const baseURL = `http://localhost:${port}`;

// pnpm は run スクリプト名以降の引数をスクリプト末尾(= react-router dev)へ転送する
const devCommand = process.env.E2E_PORT
  ? `pnpm --filter @codesteps/app run dev --port ${port}`
  : "pnpm --filter @codesteps/app run dev";

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./global-setup.ts",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  // 同一ローカル D1 に対する提出系フローが混線しないよう直列実行
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL,
    viewport: { width: 1440, height: 900 },
    locale: "ja-JP",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: devCommand,
    port,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    cwd: repoRoot,
    stdout: "pipe",
    stderr: "pipe",
  },
});
