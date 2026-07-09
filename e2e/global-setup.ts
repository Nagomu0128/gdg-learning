import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "app");

/**
 * E2E 前セットアップ(SPEC K §3): ローカル D1 にマイグレーションを適用する。
 * §11.3「E2E は wrangler dev × ローカル D1」の前提。app/drizzle/ は C が生成(未生成なら失敗する)。
 */
export default function globalSetup(): void {
  const result = spawnSync("pnpm", ["exec", "wrangler", "d1", "migrations", "apply", "DB", "--local"], {
    cwd: appDir,
    stdio: "inherit",
    // Windows では pnpm が .cmd のため shell 経由で起動する
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    throw new Error(
      "ローカル D1 マイグレーションの適用に失敗しました。app/drizzle/ が生成済みか(C 担当)、wrangler が動くかを確認してください",
    );
  }
}
