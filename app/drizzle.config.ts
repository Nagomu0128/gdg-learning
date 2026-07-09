// drizzle-kit 設定(マイグレーション生成専用 — 適用は wrangler d1 migrations apply)。所有者: C。
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./app/db/schema.ts",
  out: "./drizzle",
});
