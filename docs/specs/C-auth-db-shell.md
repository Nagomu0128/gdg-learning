# SPEC C — 認証(Better Auth)+ DB スキーマ + アプリシェル

先に読む: DesignDoc §7, §8, §10.2 → CONTRACTS §4, §6, §10。

## 所有権

`~/features/auth/**`, `app/app/db/**`, `app/drizzle/**`(マイグレーション), `wrangler.jsonc`, `workers/app.ts`, `app/app/root.tsx`, `app/app/app.css`, `~/components/ui/**`, `app/app/lib/site.ts`, `routes/api.auth.$.tsx`, `routes/api.dev-login.tsx`, `app/.dev.vars.example`(+ ローカル `.dev.vars`)。

## 実装

### 1. DB スキーマ(`app/app/db/schema.ts`)

- §7.2 の DDL を drizzle で忠実に: `lesson_progress` / `submissions` / `daily_activity` / `user_stats` / `user_achievements`(PK・複合PK・INDEX 2本・CHECK(status)・ON DELETE CASCADE・DEFAULT)。タイムスタンプは `integer("...", { mode: "timestamp_ms" })`
- Better Auth テーブル(user/session/account/verification): `pnpm dlx @better-auth/cli generate` を試し、ダメなら BA 公式ドキュメントのスキーマを手書き(drizzleAdapter の要求フィールドに正確に)
- `drizzle.config.ts`(dialect sqlite / driver d1-http はマイグレーション生成には不要 — `drizzle-kit generate` が動けばよい)→ `pnpm -F @codesteps/app db:generate` でマイグレーション SQL を `app/drizzle/` に生成し**コミット対象として残す**
- `db/index.ts`: `getDb(env)` = drizzle(env.DB, { schema })

### 2. Better Auth(§8)

- `getAuth(env)`: メモ化(WeakMap<Env> か module-level Map)。設定: `database: drizzleAdapter(db, { provider: "sqlite" })`, `secret: env.BETTER_AUTH_SECRET`, `baseURL: env.BETTER_AUTH_URL`(未設定時は request から), `socialProviders: { google: { clientId, clientSecret } }`, `session: { cookieCache: { enabled: true, maxAge: 300 } }`(§8.2 TTL 5分), `emailAndPassword: { enabled: env.DEV_LOGIN === "1" }`(開発ログイン用モック — 本番では無効)
- `requireUser` / `getOptionalUser`: `auth.api.getSession({ headers })`。未ログインは `redirect("/")` を throw
- `routes/api.auth.$.tsx`: loader/action とも `auth.handler(request)`
- `routes/api.dev-login.tsx`: action のみ。`env.DEV_LOGIN !== "1"` → 404。固定 dev ユーザー(email `dev@example.com` / password 固定文字列 / name `開発ユーザー`)を signUpEmail(既存なら signInEmail)し、**Set-Cookie を含むレスポンスをそのまま/ヘッダ移植で返して `/courses` へ 302**。E2E・手動確認の唯一のログイン経路になるため、**実際に `pnpm dev` を background 起動して curl で cookie が返ることを確認してから完了とする**(確認後 kill)
- `auth-client.ts`: better-auth/react の createAuthClient。`<LoginButton user={...} devLoginEnabled={...}>`: 未ログイン時「Googleでログイン」(authClient.signIn.social)+ devLoginEnabled 時のみ「開発ログイン」(POST /api/dev-login への plain form)。ログイン済みならユーザー名 + ドロップダウン(マイページ / ログアウト)

### 3. シェル(root.tsx / app.css / components/ui)

- root loader: `{ user: getOptionalUser(), devLoginEnabled: env.DEV_LOGIN === "1" }`。ヘッダー: SITE_NAME(リンク→/)、コース一覧、マイページ(ログイン時)、LoginButton。フッター: コピーライト + 利用規約/プライバシーポリシーへのプレースホルダリンク(`/terms` `/privacy` は MVP ではダミーページ不要、`#` で可)
- ErrorBoundary(404/500 の日本語ページ)
- app.css: `@import "tailwindcss";` + CONTRACTS §10 のトーンを反映した最小のカスタムプロパティ
- `~/components/ui/`: Button(variant: primary/secondary/ghost, disabled対応)、Card、ProgressBar(value/max, aria)、BadgeChip、Modal(フォーカストラップ簡易版, Esc で閉じる)。すべてキーボード操作可・コントラスト AA(§10.5)

### 4. wrangler.jsonc / workers/app.ts / セキュリティヘッダ(§10.2)

- wrangler.jsonc を完成(scaffold の骨格を検証・調整): バインディング名は CONTRACTS §4.2 固定。`analytics_engine_datasets` [{binding:"ANALYTICS", dataset:"learning_events"}] を追加(コード側は常に optional-chain)
- workers/app.ts: fetch = RR handler + **セキュリティヘッダ付与**: `Content-Security-Policy`(アプリ本体: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://lh3.googleusercontent.com; frame-src blob: data:; worker-src blob:; connect-src 'self'` — **サンドボックス iframe(srcdoc)と blob Worker が動くことを E の実装と合わせて確認**。srcdoc iframe は親 CSP の frame-src ではなく `about:srcdoc` 扱い: Chrome/Firefox で srcdoc は親の CSP を継承するため、`script-src` に 'unsafe-inline' が必要になる点に注意して実測で決める)、`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`
- scheduled: `runRetention(env)` を呼ぶ(F 実装。まだ STUB なら try/catch + ログで呼んでおく)

## 完了条件

typecheck / lint green、`db:generate` でマイグレーション生成済み、`db:migrate:local` 成功、dev-login の cookie 実測 OK(curl)、`pnpm -F @codesteps/app test` green。
