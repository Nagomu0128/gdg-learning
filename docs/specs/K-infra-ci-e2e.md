# SPEC K — インフラ(Terraform)+ CI/CD + E2E(Playwright)

先に読む: DesignDoc §4.4, §10.1, §11 全部 → CONTRACTS §4.2, §8, §11。

## 所有権

`infra/terraform/**`, `.github/workflows/**`, `e2e/**`, `docs/RUNBOOK.md`。

## 実装

### 1. Terraform(§11.1, §11.2, §11.5)— コードのみ。apply はしない

- `modules/d1/`(cloudflare_d1_database)、`modules/kv/`(cloudflare_workers_kv_namespace)。provider は cloudflare 最新メジャー(5系)。DNS は MVP ではドメイン未定のため module 骨格 + コメントのみ
- `envs/dev/` と `envs/prod/`: account_id は `var.cloudflare_account_id`(тfvars 例は `terraform.example.tfvars`)。命名: `codesteps-{env}`(D1)/ `codesteps-rate-limit-{env}`(KV)
- backend: コメントで R2(S3互換)/Terraform Cloud の設定例を示し、既定は local + 「tfstate に秘密が残るためアクセス制御必須(§11.5)」の警告コメント
- outputs: database_id / kv namespace id(wrangler.jsonc へ手動転記する運用を README コメントで)
- `terraform fmt` を通し、可能なら `terraform validate`(terraform CLI が無ければ skip して notes に記載)

### 2. GitHub Actions(§11.3)

- `ci.yml`(PR): pnpm setup(corepack)→ install → lint → typecheck → validate:content → test(vitest)→ build → **E2E**(Playwright: chromium install → `pnpm -F @codesteps/app db:migrate:local` 相当のセットアップ → pnpm e2e)→ Workerバンドルサイズレポート(build 出力サイズを Step Summary に)→ `wrangler versions upload` でプレビュー(**secrets 未設定なら skip する if 条件**: `if: ${{ secrets.CLOUDFLARE_API_TOKEN != '' }}` は使えないので `vars`/secrets 存在チェックの step-level continue-on-error か、job を `if: github.repository_owner == ...` で分離し、コメントで要求 secrets を明記)
- `deploy.yml`(main push): CI と同じ検証 → `wrangler d1 migrations apply DB --env production --remote` → `wrangler deploy` → スモークテスト(curl /)。**secrets(CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID)未設定でも red にならない**よう、デプロイ 3 step は個別 job + `environment: production` + 先頭で secrets 存在チェックして無ければ `exit 0`(echo で「手動セットアップ待ち」)
- `infra.yml`: paths `infra/**`。PR で `terraform plan`(secrets 無ければ fmt/validate のみ)、main で手動承認付き apply(environment: infra-prod の required reviewers をコメントで案内)
- Node 22 / pnpm cache / `wrangler types` 生成を typecheck 前に実行、など動く順序に注意。**まず act なしで YAML の構文と論理を自己レビュー**し、`pnpm dlx yaml-lint` 等は不要(Biome対象外)

### 3. E2E(Playwright)(§4.4 ステージ2 + §11.3)

- `e2e/playwright.config.ts`: webServer = `pnpm --filter @codesteps/app dev`(port 5173, reuseExistingServer, timeout 120s, cwd はリポジトリルート)。**事前に** globalSetup で `wrangler d1 migrations apply DB --local`(app ディレクトリで実行)。use: { baseURL, viewport 1440×900 }
- テスト:
  1. `content-validation.spec.ts`(§4.4 ステージ2): `/dev/validate` を開き `[data-testid=validate-summary]` が `PASS` で始まることを assert(timeout 長め 120s)
  2. `learning-flow.spec.ts`: POST /api/dev-login(request.post → cookie 保存 or page 上のフォーム)→ /courses → html-basics → html-01 の slides/1 → →キーで送り → 演習へ → エディタに solution を入力(CodeMirror: `page.locator(".cm-content")` へ click + keyboard、または window 経由の setter があれば data-testid 付きで E に依頼せず **fallback: locator.fill が効かない場合 keyboard.insertText**)→ できた! → クリア画面(streak 表示)→ me でバッジ first_pass 確認
  3. `auth.spec.ts`: 未ログインで /me → / へ redirect。dev-login → /me 200
- CodeMirror 入力が不安定なら、E の実装済み UI を読み、確実なセレクタ(data-testid)を **e2e 側の期待として RUNBOOK に記載**(E への contract_gaps として報告してもよい)
- ローカル実行手順・CI での実行を README でなく `docs/RUNBOOK.md` に(セットアップ、Terraform 適用手順、シークレット一覧、デプロイフロー、モック→本物への切替手順: Google OAuth 設定・D1/KV id 転記・secrets 登録)

## 完了条件

`pnpm -F @codesteps/e2e typecheck` green / playwright.config が `pnpm e2e --list` でテスト列挙できる / YAML 3 本が GitHub の構文で valid(actionlint があれば実行、なければ自己レビュー)/ terraform fmt 済み。E2E の実 PASS は統合フェーズで(他エージェント未完了のため)。
