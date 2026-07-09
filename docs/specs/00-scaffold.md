# SPEC 00 — scaffold: モノレポ土台構築

あなたはモノレポの土台を作る。**あなたの成果物の上に 13 の並列エージェントが即座に乗る**ため、「全パッケージの typecheck / build / lint が green」「全契約モジュールのスタブが存在」が完了条件。機能実装はしない(スタブは最小限で正直に `// STUB` と書く)。

先に読む: docs/DesignDoc.md(§3 だけで可)→ docs/specs/CONTRACTS.md(全部)。

## 既存(オーケストレーター作成済み・変更禁止)

ルート設定一式 / packages/lesson-kit(src 完成済み。**依存のバージョン調整のみ可**) / content(course.ts ×3、lessons はまだ無い) / docs。

## やること

### 1. app パッケージ(RR7 framework mode + Cloudflare Workers)

`npm create cloudflare@latest`(react-router テンプレート、非対話フラグ: `--framework=react-router --no-deploy --git=false -y` 等。一時ディレクトリに生成して `app/` に取り込むのが安全)を試し、うまくいかなければ知識で手組みする。要件:

- package.json name `@codesteps/app`。scripts(CONTRACTS §11): dev = `tsx scripts/codegen/index.ts && react-router dev`、build = `tsx scripts/codegen/index.ts && react-router build`、typecheck = `react-router typegen && tsc --noEmit`(codegen スタブを typegen 前に実行して generated を用意)、test = `vitest run`、codegen、validate:content = `tsx scripts/codegen/index.ts --validate-only`、db:generate = `drizzle-kit generate`、db:migrate:local = `wrangler d1 migrations apply DB --local`
- vite.config.ts: @cloudflare/vite-plugin + reactRouter + tailwindcss v4 + MDX。**MDX オプションは `app/mdx.config.ts` から import**(D が編集する分離点):
  ```ts
  import mdx from "@mdx-js/rollup";
  import { mdxOptions } from "./mdx.config";
  // plugins: [cloudflare(...), mdx(mdxOptions), tailwindcss(), reactRouter()]  // mdx は reactRouter より前
  ```
  `mdx.config.ts` 初期値は `export const mdxOptions = {}`(型は any で可)。
- routes: `@react-router/fs-routes` の flatRoutes(app/app/routes.ts)。
- tsconfig: `~/*` → `./app/*` エイリアス。tsconfig.base.json を extends。
- wrangler.jsonc(**C が後で完成させる。最小で正しく**): name "codesteps", main "./workers/app.ts", compatibility_date 最新, compatibility_flags ["nodejs_compat"], assets(テンプレ準拠, binding ASSETS), d1_databases [{binding:"DB", database_name:"codesteps-dev", database_id:"00000000-0000-0000-0000-000000000000", migrations_dir:"drizzle"}], kv_namespaces [{binding:"RATE_LIMIT_KV", id:"0000000000000000000000000000000000"}], triggers { crons: ["0 18 * * *"] }, observability enabled。
- workers/app.ts: fetch(RR handler)+ scheduled スタブ(`console.log("cron: retention stub")`)。
- `wrangler types` で worker-configuration.d.ts を生成(gitignore 済み)し、typecheck が通ることを確認。Env 型が d.ts から出ない構成なら app/app/lib/env.ts で `export type Env = { DB: D1Database; RATE_LIMIT_KV: KVNamespace; ANALYTICS?: AnalyticsEngineDataset; ASSETS: Fetcher; BETTER_AUTH_SECRET: string; BETTER_AUTH_URL?: string; GOOGLE_CLIENT_ID: string; GOOGLE_CLIENT_SECRET: string; DEV_LOGIN?: string }` を定義し全所で使う(その場合 CONTRACTS の Env はこれ)。
- RR の `AppLoadContext` に `cloudflare: { env: Env, ctx }` が乗るのはテンプレ準拠で維持。

### 2. 依存(app/package.json に全部入れる — 後続エージェントは追加不要が理想)

deps: react, react-dom, react-router, isbot, better-auth, drizzle-orm, ulidx, zod(^4), clsx, @codesteps/lesson-kit(workspace:*), @codemirror/state, @codemirror/view, @codemirror/commands, @codemirror/language, @codemirror/lint, @codemirror/search, @codemirror/lang-html, @codemirror/lang-css, @codemirror/lang-javascript, @mdx-js/react
devDeps: @react-router/dev, @react-router/fs-routes, @cloudflare/vite-plugin, wrangler, vite, typescript, vite-tsconfig-paths(必要なら), tailwindcss, @tailwindcss/vite, vitest, @types/react, @types/react-dom, @types/node, drizzle-kit, tsx, esbuild, @mdx-js/rollup, @types/mdx, @shikijs/rehype, shiki, @better-auth/cli
最新の安定版を `pnpm add` で解決させる(バージョン手書きしない)。

### 3. スタブ群(CONTRACTS のシグネチャどおり。中身は throw か最小動作 + `// STUB(<owner> が実装)`)

- `app/app/lib/site.ts`: `export const SITE_NAME = "CodeSteps"; export const SITE_TAGLINE = "..."` 
- `~/features/judge/index.ts`: judge / composePreview / runWorkerConsole / 定数(throw new Error("STUB: B"))
- `~/features/auth/auth.server.ts`: getAuth / requireUser / getOptionalUser(requireUser は redirect("/") を throw する程度の正直な仮実装。getOptionalUser は null)+ `auth-client.ts`(空の better-auth/react クライアント生成は C に任せ、`export const authClient = null as never // STUB(C)` で可)
- `~/features/progress/index.server.ts`: CONTRACTS §5 の全関数(throw STUB)。型(CourseOverview 等)は `~/features/progress/types.ts` に**本物を定義**(型は契約なので完成させる)
- `~/features/gamification/achievements.ts`: ACHIEVEMENTS 空配列 + 型定義
- `~/features/analytics.server.ts`: track() no-op
- `app/app/db/schema.ts`: `export {}`(STUB: C)+ `app/app/db/index.ts` getDb(throw STUB)
- ルート(§2.2 の全ファイル): 各所有者名を書いた TODO 表示の最小ページ(loader なしで可)。`api.auth.$.tsx` / `api.dev-login.tsx` は 404 を返すだけ
- `app/scripts/codegen/index.ts`: **空レジストリを出力する動くスタブ**。`--validate-only` フラグ対応(スタブは何もせず exit 0)。出力:
  - `app/app/generated/content-meta.json` → `{ "contentVersion": "dev", "courses": [] }`
  - `app/app/generated/lessons.client.ts` → LoadedLesson 型(CONTRACTS §3.1)を **本物として定義** + `loadLesson` は throw
  - `app/app/generated/slides.client.ts` → `loadSlide` throw
  - `app/app/generated/.gitkeep` 相当(generated ディレクトリ自体は git 管理済み前提を確認)
  - `scripts/codegen/{lessons.ts,slides.ts}` に分割(index が両方 await。B/D がそれぞれ差し替え)
- `app/app/root.tsx`: Tailwind 読み込み + 最小シェル(ヘッダーに SITE_NAME、Outlet)。app.css は `@import "tailwindcss";`
- vitest.config.ts(app): environment node、include `app/**/*.test.ts` と `scripts/**/*.test.ts`。ダミーテスト 1 本(`expect(true).toBe(true)` ではなく site.ts の定数存在確認程度)

### 4. その他

- ルート `biome.json`: recommended、organizeImports on、フォーマッタ(スペース2)。`app/app/generated/**` と `worker-configuration.d.ts` と `build/**` `.react-router/**` を ignore。
- `e2e/` パッケージ骨格: package.json(name @codesteps/e2e, scripts: test = `playwright test`, typecheck = `tsc --noEmit`)+ tsconfig + playwright.config.ts 最小(K が完成) + tests/.gitkeep。@playwright/test を devDep。
- README.md(ルート): クイックスタート(pnpm install → cp app/.dev.vars.example app/.dev.vars → pnpm -F @codesteps/app db:migrate:local → pnpm dev)、モノレポ地図、コマンド表。※ .dev.vars.example は C が作るので「C 完了後に有効」と注記不要、先にあなたがプレースホルダで作ってよい(所有権は C へ移る)。
- `app/.dev.vars.example` と `app/.dev.vars`(同内容): BETTER_AUTH_SECRET=dev-secret-change-me-0123456789 / BETTER_AUTH_URL=http://localhost:5173 / GOOGLE_CLIENT_ID=mock-client-id.apps.googleusercontent.com / GOOGLE_CLIENT_SECRET=mock-secret / DEV_LOGIN=1

## 完了条件(すべて実測)

1. `pnpm install` 成功(ルート)
2. `pnpm typecheck` 全パッケージ green
3. `pnpm build`(app)green
4. `pnpm lint` green
5. `pnpm -F @codesteps/app test` green(ダミー1本)
6. `pnpm -F @codesteps/app dev` を background で起動し、`curl http://localhost:5173/` が 200 を返すことを確認して**必ず kill**

## レポート

CONTRACTS §12 の様式。テンプレ由来で構成が CONTRACTS と食い違った点(あれば)を contract_gaps に必ず書く。
