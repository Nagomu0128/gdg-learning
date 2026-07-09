# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

HTML / CSS / JavaScript をゼロから学べる一般公開の Web 学習サービス(Progate 参照モデル)。「解説スライド → アプリ内エディタで演習 → 提出して即時判定 → クリア」のループが核。スコープは MVP(§1.2)。

**仕様の SSOT は `docs/DesignDoc.md`**(Draft v1.3)。本ファイルは要約であり、詳細・根拠・却下案はすべて DesignDoc の該当節(§n)を参照すること。設計と実装が食い違う場合は DesignDoc に従い、設計自体を変える場合は DesignDoc の ADR(§13)に決定記録を追記してから実装する。

## 現状

実装前の段階。リポジトリには DesignDoc のみが存在し、コード・package.json・CI はまだない。実装は §12 のマイルストーン順(M0 基盤 → M1 学習コア → M2 進捗と実績 → M3 公開準備)に、各終点で「動く一気通貫」が存在する縦のスライスで進める。

## 技術スタック(確定済み・ADR #13 ほか)

- **フレームワーク**: React Router v7 framework mode(Remix v2 の直系後継。DesignDoc では「Remix」と表記)。Remix 3 は採用しない
- **ホスティング**: Cloudflare Workers(静的アセット同梱)。Pages は使わない
- **DB**: D1 (SQLite) + Drizzle ORM。対話的トランザクションはなく `db.batch([...])` が原子性の単位(§7.4)
- **認証**: Better Auth、プロバイダは Google のみ。`session.cookieCache`(TTL 5分)採用(§8)
- **エディタ**: CodeMirror 6(自動補完はオフ — ADR #11)
- **教材**: TS `defineLesson` + MDX スライド、zod で検証。DB や CMS には置かない
- **パッケージ管理**: pnpm workspaces(モノレポ)
- **IaC**: Terraform(D1 / KV / DNS)。ただし Worker スクリプトは wrangler がオーナーで Terraform 管理外(ADR #10)

## リポジトリ構成(計画。§3.3)

```
app/                  # Remix アプリ本体(routes / features / generated / drizzle)
content/courses/      # 教材(course.ts + lessons/{lesson.ts, slides/*.mdx})
packages/lesson-kit/  # 契約パッケージ: defineLesson / zod / check型 / メッセージ生成 / 全角検出
infra/terraform/      # modules + envs/{dev,prod}
.github/workflows/    # ci.yml / deploy.yml / infra.yml
```

**依存方向は `content → lesson-kit ← app` のみ**。教材とアプリは互いに直接依存しない。判定エンジンの純粋部分(ルール解釈・メッセージ生成・全角検出)は lesson-kit に置き vitest でテスト、DOM を触る実行部のみ app 側(functional core, imperative shell)。`app/app/generated/` は codegen 出力でありコミットしない。

## アーキテクチャの要点

最重要の決定は**ユーザーコードの実行をすべてブラウザ内で完結させる**こと(ADR #1)。サーバー(D1)の仕事は進捗と提出の記録のみ。

- **判定エンジン**(§5): `judge()` が全 check を評価し、表示は最初の失敗1件・記録は全件の `Verdict` を返す。ランナーは `dom`(判定専用 iframe)と `worker`(Web Worker)の2系統を戦略パターンで隠蔽
- **サンドボックス**(§6): 複数ファイルを srcdoc 1枚に合成(`<base>` 注入で相対パス解決)。プレビュー iframe と判定 iframe は別物で、判定 iframe は毎回新規生成・800×600 固定。acorn の AST 変換でループ保護をプレビュー・判定の両経路に注入
- **DB**(§7): 教材はテーブルを持たず `lesson_slug` 文字列で紐づける。`daily_activity` が生記録、`user_stats` が読み取り用の実体化。冪等性は PK / UNIQUE 制約で担保
- **提出フロー**(§9): 合否にかかわらず毎回 POST(ADR #4)。サーバーは verdict を再検証しない(ADR #5)
- **教材 CI 検証**(§4.4): ①zod による構造検証、②各レッスンの solution を判定エンジンに通し全 checks 合格を保証する自己整合性検証(Playwright)

## 実装時に破ってはならない不変条件

セキュリティ・実行系(§5.5, §6, §10.2):
- プレビュー / 判定 iframe は `sandbox="allow-scripts"` のみ。**`allow-same-origin` を絶対に付与しない**
- 判定結果の postMessage 受理は「source 一致 + origin `"null"` + nonce 一致」の3条件すべて
- ライブプレビューにもループ保護を必ず適用する(タイプ途中の `while(true)` 対策)
- タイムアウト(判定全体 5000ms / Worker 2000ms / ループカウンタ 10万回)を最外殻に置く
- ユーザーコードを画面表示する箇所は必ずテキストとしてエスケープ描画

データ・契約(§4, §7):
- レッスンの `slug` は公開後不変(URL・DB 外部キー相当を兼ねる安定識別子)
- 導出可能な値は保存しない。ヒント開放は `failed_count` からの導出(`unlocked = min(floor(failed_count / 2), hintCount)`)であり、開放状態を保存しない
- タイムスタンプは epoch ms の INTEGER。日付境界の判定のみ JST 固定(記録は UTC)
- `submissions.content_version`(ビルド時埋め込みの git 短 SHA)は後から遡れないため必ず記録する
- スキーマ変更は expand and contract(§11.4): 後方互換な拡張を先行リリースし、削除・リネームは次リリース

前提の再確認(§2.4):
- ヒント・答えの開放制御は「秘匿」ではなく「学習摩擦」。solution はクライアントに配信され DevTools で読める前提であり、これを秘匿だと誤解した機能を積まない(ADR #7)

## リソースのオーナー(§11.1 — 二重管理禁止)

| リソース | オーナー |
|---|---|
| D1 / KV / DNS | Terraform |
| Worker スクリプト・バインディング | wrangler(`wrangler.jsonc` が SSOT) |
| DB スキーマ | drizzle-kit マイグレーション |
| シークレット | wrangler secret + GitHub Actions secrets(コード・tfvars に書かない) |

## テスト・CI(計画。§11.3)

- lesson-kit の純粋ロジック: vitest
- E2E: Playwright × `wrangler dev`(ローカル D1)。認証は Google 実ログインではなくテスト用セッション注入(session 行 seed + Cookie 直接設定)
- PR で lint / 型チェック / 教材検証2段 / vitest / E2E → `wrangler versions upload` でプレビュー URL
- main マージで `wrangler d1 migrations apply` → `wrangler deploy` → スモークテスト
