# CodeSteps

HTML / CSS / JavaScript をゼロからステップアップで学べる Web 学習サービス。
「解説スライド → アプリ内エディタで演習 → 提出して即時判定 → クリア」のループが核。

仕様の SSOT は [docs/DesignDoc.md](docs/DesignDoc.md)。実装契約は [docs/specs/CONTRACTS.md](docs/specs/CONTRACTS.md)。

## クイックスタート

```sh
pnpm install
cp app/.dev.vars.example app/.dev.vars
pnpm -F @codesteps/app db:migrate:local   # ローカル D1 にマイグレーション適用
pnpm dev                                  # http://localhost:5173
```

## モノレポ地図

```
app/                  # @codesteps/app — React Router v7 (framework mode) on Cloudflare Workers
  app/routes/         #   flatRoutes(URL as State)
  app/features/       #   judge / auth / editor / exercise / slides / progress / gamification
  app/generated/      #   教材 codegen の出力(コミットしない)
  scripts/codegen/    #   教材 codegen(index.ts がエントリ)
  workers/app.ts      #   Worker エントリ(fetch + scheduled)
  drizzle/            #   drizzle-kit マイグレーション
content/              # @codesteps/content — 教材(course.ts + lessons/)。lesson-kit のみに依存
packages/lesson-kit/  # @codesteps/lesson-kit — 契約パッケージ(defineLesson / check型 / 判定純粋部)
e2e/                  # @codesteps/e2e — Playwright E2E
infra/terraform/      # D1 / KV / DNS の IaC(modules + envs/{dev,prod})
.github/workflows/    # ci.yml / deploy.yml / infra.yml
docs/                 # DesignDoc / specs
```

依存方向: `content → lesson-kit ← app`(教材とアプリは契約パッケージにのみ依存する)。

## コマンド

| コマンド | 内容 |
|---|---|
| `pnpm dev` | app: codegen → react-router dev(vite + workerd、ローカル D1/KV) |
| `pnpm build` | app: codegen → react-router build |
| `pnpm typecheck` | 全パッケージ tsc --noEmit(app は wrangler types / react-router typegen 先行) |
| `pnpm test` | 全パッケージ vitest run |
| `pnpm lint` / `pnpm lint:fix` | Biome チェック / 自動修正 |
| `pnpm codegen` | 教材 codegen 単独実行 |
| `pnpm validate:content` | 教材の構造検証(検証ステージ1) |
| `pnpm -F @codesteps/app db:migrate:local` | ローカル D1 にマイグレーション適用 |
| `pnpm e2e` | Playwright E2E(webServer 自動起動) |

## 環境変数

`app/.dev.vars`(ローカル)/ wrangler secret(本番)。キー一覧は `app/.dev.vars.example` を参照。
