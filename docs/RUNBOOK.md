# RUNBOOK — CodeSteps 運用手順書

対象: インフラ(Terraform)/ CI・CD(GitHub Actions)/ E2E(Playwright)の運用。
仕様の背景は `docs/DesignDoc.md` §11、契約は `docs/specs/CONTRACTS.md` を参照。

---

## 1. ローカル開発セットアップ

```sh
pnpm install
cp app/.dev.vars.example app/.dev.vars   # 開発用モック値(DEV_LOGIN=1 を含む)
pnpm -F @codesteps/app db:migrate:local  # ローカル D1 にマイグレーション適用
pnpm dev                                 # codegen → react-router dev(http://localhost:5173)
```

- `python` は使わない(このリポジトリに不要)。Node >= 22 / pnpm 10(corepack)。
- ローカル D1/KV の実体は `app/.wrangler/state/` に保存される。DB を作り直したい場合は
  dev サーバー停止後にこのディレクトリを削除 → `db:migrate:local` を再実行。

## 2. E2E(Playwright)

### 2.1 ローカル実行

```sh
pnpm -F @codesteps/e2e exec playwright install chromium  # 初回のみ(ブラウザ取得)
pnpm e2e            # webServer(pnpm --filter @codesteps/app dev)を自動起動して実行
pnpm e2e --list     # テスト列挙のみ(サーバー起動なし)
```

- 注意: `pnpm e2e -- --list` は pnpm が `--` を文字どおり渡すため動かない。`pnpm e2e --list` と書く。
- ポートは既定 5173。使用中なら `E2E_PORT=5188 pnpm e2e` のように上書きする
  (webServer コマンドに `--port` が転送される)。指定ポートは空けておくこと。
- `global-setup.ts` が `wrangler d1 migrations apply DB --local` を実行する。
  `app/drizzle/` にマイグレーションが生成済みであること(C 担当)。
- ローカル D1 は実行間で永続するため、learning-flow は再実行可能なアサーション
  (クリア画面・ストリーク表示・バッジ表示)に限定している。完全クリーンな状態で
  流したい場合は §1 の手順で `app/.wrangler/state/` を消してから実行する。

### 2.2 テスト一覧

| ファイル | 内容 | 依拠する契約 |
|---|---|---|
| `content-validation.spec.ts` | `/dev/validate` が `PASS n/n`(教材自己整合性 = DesignDoc §4.4 ステージ2) | `data-testid="validate-summary"`(CONTRACTS §8・確定) |
| `auth.spec.ts` | 未ログイン `/me` → `/` redirect、`POST /api/dev-login` → 302 + Set-Cookie → `/me` 200 | CONTRACTS §4.3 |
| `learning-flow.spec.ts` | dev-login → コース → スライド(←→キー)→ 演習で solution 入力 → 提出 → クリア画面 → バッジ | 下表の UI 期待 |

### 2.3 E2E が期待する UI(統合フェーズで突き合わせる)

セレクタは `e2e/tests/selectors.ts` に一元管理している。**確定契約は validate-summary のみ**。
以下は E / D / F の実装に対する「E2E 側の期待」であり、実装と異なる場合は selectors.ts を直すか、
実装側に合わせてもらう(どちらに寄せるかは統合フェーズで判断):

| 期待 | 担当 | 内容 |
|---|---|---|
| 提出ボタン | E | アクセシブルネームに「できた」を含む button(CONTRACTS §7 の文言「できた!」) |
| クリア画面 | E | 合格時に「クリア」を含むテキストが可視化される |
| ストリーク表示 | E | クリア画面内に「連続」または「ストリーク」を含むテキスト |
| エディタ | E | CodeMirror(`.cm-content`)。全選択 → `keyboard.insertText` で入力できること |
| スライド操作 | D | ←→キーで `slides/{n}` の URL が遷移し、最終スライドに「演習」を含むリンクがある |
| レッスン一覧 | F | コース詳細にレッスンタイトルのリンク(クリックで `slides/1` へ) |
| バッジ表示 | F | `/me` に first_pass バッジ「はじめの一歩」が表示される |

推奨(任意): E は提出ボタンに `data-testid="submit-button"`、クリア画面に `data-testid="clear-screen"`、
F は獲得済みバッジに `data-testid="badge-earned-{id}"` を付けると、E2E を文言非依存にできる
(付与されたら selectors.ts を testid ベースへ切り替える)。

## 3. Terraform(インフラ)

### 3.1 構成

```
infra/terraform/
├─ modules/
│   ├─ d1/    # cloudflare_d1_database
│   ├─ kv/    # cloudflare_workers_kv_namespace
│   └─ dns/   # 骨格のみ(ドメイン確定後に実装)
└─ envs/
    ├─ dev/   # codesteps-dev / codesteps-rate-limit-dev
    └─ prod/  # codesteps-prod / codesteps-rate-limit-prod
```

管理主体(DesignDoc §11.1「1リソース1オーナー」): D1 / KV / DNS = Terraform、
Worker スクリプト・バインディング = wrangler.jsonc、DB スキーマ = drizzle-kit。
**Worker を Terraform で管理しない**こと(二重管理は drift 源)。

### 3.2 適用手順(env ごと)

```sh
cd infra/terraform/envs/dev            # または envs/prod
cp terraform.example.tfvars terraform.tfvars   # account_id を記入(gitignore 済み)
export CLOUDFLARE_API_TOKEN=<token>    # 権限: Account / D1:Edit + Workers KV Storage:Edit
terraform init
terraform plan
terraform apply
```

### 3.3 apply 後: wrangler.jsonc への ID 転記(手動)

```sh
terraform output
```

| output | 転記先(app/wrangler.jsonc) |
|---|---|
| `d1_database_id` | `d1_databases[].database_id` |
| `kv_namespace_id` | `kv_namespaces[].id` |

prod 用の ID は `env.production` ブロックに記載する(§5.3 参照)。

### 3.4 tfstate の取り扱い(DesignDoc §11.5)

- 既定は **local backend**。tfstate にはリソース情報が平文で残るため、コミット禁止
  (.gitignore 済み)+ 保管先のアクセス制御必須。
- チーム / CI 運用に移行する際は `envs/*/main.tf` のコメントに従い
  **R2(S3 互換)または Terraform Cloud** へ移行する(`terraform init -migrate-state`)。
- **リモートバックエンド移行前に infra.yml の apply を有効化しない**こと
  (CI のジョブ終了で state が消え、次回 apply が重複作成になる)。

## 4. GitHub Actions

### 4.1 ワークフロー一覧

| ファイル | トリガ | 内容 |
|---|---|---|
| `ci.yml` | pull_request | lint → typecheck → 教材検証 → vitest → build(+ Worker サイズレポート)→ E2E → プレビューデプロイ(secrets ある場合のみ。プレビュー URL を PR にコメント) |
| `deploy.yml` | push main | CI と同じ検証 → D1 マイグレーション(prod)→ `wrangler deploy` → スモークテスト(`vars.PROD_URL`) |
| `infra.yml` | infra/** 変更 | PR: fmt / validate(+ secrets があれば plan)/ main: **手動承認付き** apply |

secrets 未設定でも赤にならない設計(プレビュー / デプロイ / plan / apply は skip され、
Step Summary に「手動セットアップ待ち」が出る)。

### 4.2 リポジトリ設定(初回のみ・手動)

1. **Secrets**(Settings → Secrets and variables → Actions):
   - `CLOUDFLARE_API_TOKEN` — 権限: Workers Scripts:Edit / D1:Edit / Workers KV Storage:Edit
   - `CLOUDFLARE_ACCOUNT_ID`
2. **Variables**: `PROD_URL`(例 `https://codesteps.<subdomain>.workers.dev`。スモークテスト先)
3. **Environments**:
   - `production` — deploy.yml が使用。必要なら Required reviewers で承認制に
   - `infra-prod` — infra.yml の apply が使用。**Required reviewers を必ず設定**
     (これが §11.3「手動承認つき apply」の実装)

### 4.3 実行時シークレット(Worker 側)

CI secrets とは別に、Worker の実行時シークレットは wrangler で登録する(§11.5):

```sh
cd app
wrangler secret put BETTER_AUTH_SECRET            # openssl rand -base64 32 等で生成
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
# prod 環境に対しては: wrangler secret put <NAME> --env production
```

## 5. デプロイフロー / モック→本物への切替

### 5.1 通常フロー

1. PR 作成 → `ci.yml` が全検証 + (secrets 設定後)プレビュー URL を PR にコメント
2. main にマージ → `deploy.yml` が検証 → マイグレーション → デプロイ → スモークテスト
3. `infra/**` を変更する PR → `infra.yml` が plan を Step Summary に出力 → マージで承認後 apply
4. スキーマ変更は expand and contract(§11.4): 追加を先行リリースし、削除・リネームは次リリース

### 5.2 Google OAuth(モック → 本物)

1. [Google Cloud Console](https://console.cloud.google.com/) → API とサービス → 認証情報 →
   OAuth クライアント ID(Web アプリケーション)を作成
2. 承認済みリダイレクト URI: `{BETTER_AUTH_URL}/api/auth/callback/google`
   (ローカル: `http://localhost:5173/api/auth/callback/google`、本番: `https://<PROD_URL>/api/auth/callback/google`)
3. ローカル: `app/.dev.vars` の `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` を実値に差し替え
4. 本番: §4.3 のとおり `wrangler secret put` で登録
5. 公開前に OAuth 同意画面の審査(利用規約・プライバシーポリシー URL が必要 — DesignDoc §12 M3)

### 5.3 本番リソースの結線チェックリスト

- [ ] `envs/prod` を apply し、`d1_database_id` / `kv_namespace_id` を控える
- [ ] `app/wrangler.jsonc` に `env.production` を追加し、prod の D1/KV id・
      `BETTER_AUTH_URL`(本番 URL)を設定(所有: C。プレースホルダ id のままデプロイしない)
- [ ] `wrangler secret put ... --env production` で実行時シークレット登録
- [ ] **本番の `DEV_LOGIN` は未設定(または "1" 以外)にする** — dev ログインは
      `DEV_LOGIN === "1"` のときのみ有効(CONTRACTS §4.3)
- [ ] GitHub secrets / vars / environments を §4.2 のとおり設定
- [ ] main へマージし、deploy.yml のスモークテストが green になることを確認

## 6. 定期ジョブ(retention)

- `wrangler.jsonc` の cron `0 18 * * *`(UTC 18:00 = JST 3:00)が `workers/app.ts` の
  `scheduled` → `runRetention`(§7.5: 90日超の submissions.code NULL 化、最新合格は除外)を呼ぶ。
- 動作確認: `wrangler dev` 起動中に `curl "http://localhost:5173/__scheduled?cron=0+18+*+*+*"`
  (`--test-scheduled` フラグが必要な場合あり)。

## 7. トラブルシュート

| 症状 | 対処 |
|---|---|
| E2E が「D1 マイグレーション適用失敗」 | `app/drizzle/` が空 → `pnpm -F @codesteps/app db:generate` 済みか確認(C 担当領域) |
| E2E の webServer タイムアウト | 5173 が他プロセスに占有されていないか。`E2E_PORT` で回避可 |
| dev-login が 404 | `app/.dev.vars` の `DEV_LOGIN=1` を確認(CI では .dev.vars.example をコピーして再現) |
| deploy.yml が `env.production` エラー | wrangler.jsonc に env.production 未定義(§5.3 のチェックリスト) |
| terraform plan で認証エラー | `CLOUDFLARE_API_TOKEN` の権限(D1:Edit / Workers KV Storage:Edit)と account_id を確認 |
