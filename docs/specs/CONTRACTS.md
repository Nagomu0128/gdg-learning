# CONTRACTS.md — 実装エージェント共通契約書

> **必読順序**: ①`docs/DesignDoc.md`(仕様のSSOT) → ②本書 → ③自分の担当仕様書(`docs/specs/*.md`)。
> 本書は DesignDoc をコードレベルの契約(インターフェース・ファイル所有権・規約)に落としたもの。**矛盾があれば DesignDoc が勝つ**が、本書の公開インターフェース(シグネチャ・プロトコル)は統合の生命線なので**勝手に変更しない**こと。変更が必要なら自分のファイル内でアダプトし、レポートの `contract_gaps` に記載する。

## 0. プロジェクト共通

- **サービス仮称**: CodeSteps(コードステップ)。DesignDoc ではサービス名未定のため、UI 表示用のプレースホルダ。定数 `app/app/lib/site.ts` の `SITE_NAME` を参照(ハードコード禁止)。
- **リポジトリルート**: `C:\Users\kazuy\Projects\gdg-learning-wt-mvp`(git worktree)。**この配下だけを触る。**
- パッケージ名: `@codesteps/app` / `@codesteps/lesson-kit` / `@codesteps/content` / `@codesteps/e2e`
- Node >= 22, pnpm 10, TypeScript strict(`tsconfig.base.json` 継承)。ESM のみ。
- UI 文言はすべて日本語。識別子は英語。コメントは必要最小限(制約の明示のみ)。
- リント/フォーマット: Biome(ルートの `biome.json`)。作業終了前に `pnpm exec biome check --write <自分のファイル/ディレクトリ>` を実行。

### 0.1 エージェント絶対ルール

1. **git 操作禁止**(commit / push / branch / config すべて)。コミットはオーケストレーターが行う。
2. **所有権外のファイルを編集しない**(§9 の所有権マトリクス参照)。読むのは自由。共有ファイル(vite.config.ts / package.json 等)は凍結 — 変更が必要ならレポートで要求。
3. 依存追加が必要になったら: 原則レポートの `deps_needed` に書く。どうしても検証に必要な場合のみ `pnpm add -F <自分のパッケージ> <dep>` を実行してよい(lockfile 競合でエラーが出たら 10 秒待ってリトライ)。
4. テストの削除・skip・アサーション緩和で green にすることは禁止。
5. 完了条件: 担当パッケージの `pnpm -F <pkg> typecheck` が通る + 自分のテストが通る + Biome clean。他人の未実装部分が原因の失敗はレポートに記載して許容。
6. Windows 環境。シェルは PowerShell 5.1(`&&` 不可)/ Bash(Git Bash)。**スクリプト・コードは必ずクロスプラットフォーム**(node:path、`pathToFileURL`、glob は POSIX 区切りに正規化)。対話コマンド・長時間フォアグラウンドサーバー起動は禁止(起動確認が必要なら background + 即 kill)。
7. `python` は壊れている。使うなら `py`。(通常不要)

## 1. モノレポ構成と依存方向

```
app/                    # @codesteps/app — RR7 framework mode on CF Workers
  app/                  #   RRのappディレクトリ(routes/ features/ components/ lib/ generated/)
  workers/app.ts        #   Worker エントリ(fetch + scheduled)
  scripts/codegen/      #   教材codegen(index.ts がエントリ)
  drizzle/              #   drizzle-kit マイグレーション出力
content/                # @codesteps/content — 教材(lesson-kit のみに依存)
packages/lesson-kit/    # @codesteps/lesson-kit — 契約パッケージ(純粋・zodはビルド時のみ)
e2e/                    # @codesteps/e2e — Playwright
infra/terraform/        # modules + envs/{dev,prod}
.github/workflows/      # ci.yml / deploy.yml / infra.yml
docs/specs/             # 本書 + エージェント仕様書
```

依存方向: `content → lesson-kit ← app`(§3.3)。content と app は互いに import しない。app 内のパスエイリアス: `~/*` → `app/app/*`。

## 2. lesson-kit 公開 API(オーケストレーター確定済み・シグネチャ変更禁止)

`packages/lesson-kit/src/` 配下。`index.ts` が全再エクスポート。`sideEffects: false`(判定バンドルに tree-shake されて入るため、**zod は schemas.ts 以外から import しない**)。

```ts
// types.ts(確定)
export type FileMap = Record<string, string>;
export type ConsoleEntry = { level: "log" | "info" | "warn" | "error"; text: string };
export type Verdict = {
  passed: boolean;
  display: { checkId: string; message: string } | null;
  details: { checkId: string; passed: boolean }[];
  console: ConsoleEntry[];
  timedOut: boolean;
};
export type CustomCheckContext = {
  document: Document;
  window: Window & typeof globalThis;
  fire: (selector: string, event: string) => void;   // bubbles:true で dispatch。click は MouseEvent
  wait: (ms: number) => Promise<void>;
  console: ConsoleEntry[];
};
// Check 型: element / text / attribute / style / source / console / fn / custom(§5.2 のフィールドどおり)
// LessonDef / CourseDef / LessonFile(§4.1 のフィールドどおり)
export type RunnerKind = "dom" | "worker";
export function resolveRunner(def: Pick<LessonDef, "runner" | "checks">): RunnerKind;
// 規則: runner 明示があればそれ。なければ element/text/attribute/style/custom が1つでもあれば "dom"、それ以外は "worker"

// define.ts(確定): 実行時は恒等関数(zod parse はビルド時に codegen が行う — §4.1「ビルド時に全教材をparse」)
export function defineLesson(def: LessonDef): LessonDef;
export function defineCourse(def: CourseDef): CourseDef;

// schemas.ts(zod。ビルド時/テスト時専用): lessonSchema, courseSchema
//   - slug: /^[a-z0-9]+(-[a-z0-9]+)*$/、checks 非空、check id 一意、hints は 1 個以上
//   - solution のキー ⊆ files のキー、editable(既定true)な全ファイルが solution に存在
//   - source check の file が files に存在
//   - style check の property は longhand 限定(SHORTHAND_BLOCKLIST で拒否)
//   - custom check は message 必須
// SHORTHAND_BLOCKLIST(最低限): margin,padding,border,border-top,border-right,border-bottom,border-left,
//   border-width,border-style,border-color,border-radius,background,font,flex,flex-flow,gap,inset,outline,
//   overflow,place-items,place-content,text-decoration,list-style,transition,animation,columns,grid,
//   grid-area,grid-column,grid-row

// messages.ts: 既定メッセージ生成(§5.2 のトーン。日本語・初学者向け・「〜しましょう」調)
export function defaultMessageFor(check: Check): string;

// normalize.ts: 比較セマンティクス(§5.3)
export function normalizeText(s: string, opts?: { exact?: boolean }): string; // 既定: trim + 連続空白1つ化(改行含む)
export function textMatches(actual: string, check: TextCheck): boolean;       // equals/contains/pattern + exact/ignoreCase
export function deepEqualWithNaN(a: unknown, b: unknown): boolean;            // NaN===NaN は真
export function consoleLinesMatch(actual: string[], expected: string[], ordered: boolean): boolean;
// consoleLinesMatch: 各期待行が normalizeText 後の完全一致で存在。ordered=true は部分列(subsequence)判定

// zenkaku.ts(§5.4)
export type ZenkakuHit = { index: number; line: number; column: number; char: string; suggestion: string };
export function findZenkakuChars(source: string): ZenkakuHit[];               // 対象: ＜＞（）＂＇＝；：｛｝、全角スペース(U+3000)、＋－＊／％！？＆｜．，
export function findZenkakuSpaces(source: string): { from: number; to: number }[]; // エディタ常時可視化用
export type ZenkakuDiagnosis = { line: number; message: string };            // 例:「2行目に全角の「＜」が入っています。半角の「<」に直しましょう」
export function diagnoseJsParseError(source: string, errorPos: { line: number; column: number }): ZenkakuDiagnosis | null;
export function diagnoseMarkupZenkaku(source: string): ZenkakuDiagnosis | null; // タグ/宣言構文を模した全角列(＜ｈ１＞等)の検出。check失敗時のみ呼ぶ
export function generalSyntaxErrorMessage(line: number): string;              // 「N行目に文法エラーがあります」

// loop-protect.ts(§6.6。acorn 使用。app のメインスレッドでのみ実行 — バンドルには入らない)
export type SyntaxDiag = { line: number; message: string }; // message は zenkaku 診断 or 一般診断を適用済み
export type InstrumentResult = { ok: true; code: string } | { ok: false; error: SyntaxDiag };
export function instrumentLoops(source: string, opts?: { maxIterations?: number }): InstrumentResult;
// for/while/do-while/for-of/for-in の本体に脱出カウンタ注入(既定10万回)。超過時 throw new Error(LOOP_PROTECT_ERROR_MESSAGE)
export const LOOP_PROTECT_ERROR_MESSAGE = "__LOOP_LIMIT_EXCEEDED__";
export const LOOP_LIMIT_MESSAGE_JP = "無限ループになっていませんか? ループの回数が上限を超えました";

// limits.ts(§5.5 確定値)
export const JUDGE_TIMEOUT_MS = 5000;
export const WORKER_TIMEOUT_MS = 2000;
export const LOOP_MAX_ITERATIONS = 100000;
export const TIMEOUT_MESSAGE_JP = "時間内に判定が終わりませんでした。無限ループになっていませんか?";
```

## 3. 判定パイプライン契約(app/app/features/judge/)

### 3.1 生成モジュール(codegen 出力)の形

```ts
// app/app/generated/lessons/{slug}.ts(レッスンごと・遅延チャンク)
export const meta: { slug: string; title: string; estMinutes: number; runner: "dom" | "worker";
                     courseSlug: string; order: number; slideCount: number; hintCount: number };
export const files: Record<string, { initial: string; editable: boolean; hidden: boolean }>;
export const hints: string[];
export const solution: Record<string, string>;
export const judgeBundle: string; // esbuild IIFE(checks + ランタイム)。§3.3 のグローバル契約を満たす

// app/app/generated/lessons.client.ts(レジストリ)
export type LoadedLesson = { meta: ...; files: ...; hints: string[]; solution: Record<string,string>; judgeBundle: string };
export function loadLesson(slug: string): Promise<LoadedLesson>; // import.meta.glob ベース。未知slugはthrow

// app/app/generated/content-meta.json(サーバー側でも import する静的メタ)
{ "contentVersion": "<git短SHA|dev>",
  "courses": [{ "slug": "...", "title": "...", "description": "...",
    "level": "basic" | "intermediate" | "advanced" | "capstone",  // course.ts 未指定は "basic"(ADR #19)
    "lessons": [{ "slug","title","estMinutes","runner","order","slideCount","hintCount" }] }] }

// app/app/generated/slides.client.ts(D が生成形を確定)
export function loadSlide(lessonSlug: string, n: number): Promise<{ default: React.ComponentType }>; // n は 1 始まり
```

- 生成物はコミットしない(`.gitignore` 済み)。**scaffold のスタブ codegen は空レジストリを出力**し、コンテンツ未生成でも typecheck/build が通る状態を維持する。
- `contentVersion` は codegen 実行時に `git rev-parse --short HEAD`(失敗時 "dev")。content-meta.json に埋め、提出記録時にサーバーが読む(§7.2)。

### 3.2 judge() クライアント API(B が実装、E が使用)

```ts
// ~/features/judge(index.ts で公開)
export function judge(lesson: LoadedLesson, files: FileMap): Promise<Verdict>;
// - runner 種別は lesson.meta.runner で分岐(呼び出し側は意識しない — §5.1 戦略パターン)
// - JS の instrumentLoops が ok:false → iframe/worker を起動せず即
//   { passed:false, display:{checkId:"__syntax__", message: error.message(行番号込)}, details:[], console:[], timedOut:false }
// - タイムアウト(5000ms / worker 2000ms)→ TIMEOUT_MESSAGE_JP で timedOut:true
// - 判定 iframe: 毎回新規生成、非表示(position:absolute; left:-9999px)、width:800px height:600px 固定、終了後 remove

export function composePreview(input: {
  files: FileMap;            // hidden 含む実行対象の全ファイル(呼び出し側で initial/編集値をマージ済み)
  lessonSlug: string;
  origin: string;            // window.location.origin(CSP img-src と <base> に使用)
}): { html: string; nonce: string; jsSyntaxError: SyntaxDiag | null };
// - jsSyntaxError 時: JS は注入しない(HTML/CSSは描画される)。呼び出し側がコンソール欄にエラー表示
// - プレビューにもループ保護を必ず適用(§6.2)

export function runWorkerConsole(files: FileMap): Promise<{ console: ConsoleEntry[]; timedOut: boolean; syntaxError: SyntaxDiag | null }>;
// worker 系レッスンのプレビュー/見本用: JS を Worker で実行しコンソールを捕捉(2000ms cap)

export const PREVIEW_CONSOLE_KIND = "preview:console"; // { kind, nonce, entry: ConsoleEntry }
export const JUDGE_RESULT_KIND = "judge:result";       // { kind, nonce, verdict: Verdict }
```

**postMessage 受理条件(親側・3条件すべて・§5.5)**: `e.source === frame.contentWindow` / `e.origin === "null"` / `msg.nonce === 発行nonce`。プレビューのコンソール中継も同じ条件。

### 3.3 判定バンドルのグローバル契約(B: runtime と codegen の両方が従う)

- バンドルは IIFE。実行すると `globalThis.__JUDGE__ = { start(cfg), startWorker(cfg) }` を定義する。
- `cfg = { nonce: string, files: FileMap }`(files は source check 用)。
- **DOM 系**: srcdoc の合成順序 = ①CSP meta ②`<base href="{origin}/lesson-assets/{slug}/">` ③コンソールフック(`globalThis.__CONSOLE__: ConsoleEntry[]` に捕捉、window.onerror も error として捕捉) ④判定バンドル ⑤`__JUDGE__.start({nonce, files})`(ランタイムが load を待ってから評価) ⑥ユーザー HTML/CSS(インライン化済) ⑦ループ保護済ユーザー JS。**④⑤は `<head>` = ユーザー本文より前に注入**(2026-07-10 変更 [フェイルセーフ]: 本文より後ろだと壊れた終了タグ `</a,` 等に `<script>` 開始タグごと食われ、判定未実行のタイムアウトに化ける)。start は全 check を上から評価(§5.1: 失敗後も全件継続、各 check は try/catch)し、`parent.postMessage({ kind:"judge:result", nonce, verdict }, "*")` を **1回だけ**送る。
- **Worker 系**: blob = ①コンソールフック ②ループ保護済ユーザー JS ③判定バンドル ④`__JUDGE__.startWorker({nonce, files})`。`self.postMessage({ kind:"judge:result", nonce, verdict })`。fn check は `globalThis[name]` を参照(**教材規約: fn 対象は function 宣言**)。
- verdict.display = 最初に失敗した check(authored順)。message = `check.message ?? defaultMessageFor(check)`。element/attribute/style の失敗時は該当ソース(HTML は .html ファイル、style は .css)へ `diagnoseMarkupZenkaku` をかけ、ヒットしたら差し替え(§5.4)。
- `<script>` へ埋め込む文字列は `</script` → `<\/script` エスケープ。JSON 注入は `JSON.stringify(x).replace(/</g, "\\u003c")`。
- CSP(§6.5): `default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: {origin}`

### 3.4 check 評価セマンティクス(runtime 実装規範)

| type | 合格条件 |
|---|---|
| element | `querySelectorAll(selector).length` が `count` 指定時は一致、未指定時は >= 1 |
| text | 最初の一致要素の `textContent` を `textMatches` で判定。要素なしは不合格 |
| attribute | 最初の一致要素。`exists:true` → 属性が非null。`equals` → trim 後一致。要素なしは不合格 |
| style | `getComputedStyle(el).getPropertyValue(prop)` と、期待値をプローブ要素(document.body 直下に append した div に `style.setProperty(prop, equals)`)で解決した computed 値の一致(§5.3 canonicalization) |
| source | `new RegExp(pattern, flags).test(files[file])` |
| console | `__CONSOLE__` の level "log"/"info" の text 配列に対し `consoleLinesMatch` |
| fn | `globalThis[name]` が関数であり、`await fn(...args)` の戻り値が `deepEqualWithNaN(result, returns)` |
| custom | `await run(ctx)` が truthy。throw は不合格 |

## 4. DB / 認証契約

### 4.1 スキーマ(C 所有: `app/app/db/schema.ts`)

§7.2 の DDL を **一字一句の意味で忠実に** drizzle 化(テーブル名・カラム名・PK・INDEX・CHECK 同等)。タイムスタンプは `integer({ mode: "timestamp_ms" })`。加えて Better Auth 標準テーブル(user / session / account / verification)。マイグレーションは `app/drizzle/` に drizzle-kit で生成しコミットする。

```ts
// app/app/db/index.ts
export function getDb(env: Env): DrizzleD1Database<typeof schema>;
```

### 4.2 Env(worker バインディング契約)

```ts
// wrangler.jsonc(C 所有)が SSOT。バインディング名は固定:
// DB: D1Database / RATE_LIMIT_KV: KVNamespace / ANALYTICS?: AnalyticsEngineDataset / ASSETS: Fetcher
// vars/secrets: BETTER_AUTH_SECRET, BETTER_AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, DEV_LOGIN
// ANALYTICS は常に optional-chain で呼ぶ(ローカルで未定義でも壊れない)
// cron: 1本 ["0 18 * * *"](JST 3:00)→ retention(§7.5)
```

RR7 の loader/action からは `context.cloudflare.env` で参照(型は `Env`)。

### 4.3 認証(C 所有: `~/features/auth/`)

```ts
export function getAuth(env: Env): BetterAuth;                      // メモ化。socialProviders.google + cookieCache 5分(§8)
export function requireUser(request: Request, env: Env): Promise<AuthUser>;  // 未ログインは redirect("/") を throw
export function getOptionalUser(request: Request, env: Env): Promise<AuthUser | null>;
export type AuthUser = { id: string; name: string; email: string; image: string | null };
```

- ルート `routes/api.auth.$.tsx` で `auth.handler(request)` に委譲(§8.1)。
- **開発用ログイン(モック)**: `routes/api.dev-login.tsx` の action。`env.DEV_LOGIN === "1"` のときだけ有効(それ以外 404)。固定ユーザー(email `dev@example.com`, name `開発ユーザー`)を作成/取得しセッションを確立して `/courses` へ 302。E2E(§11.3 セッション注入)もこれを使う。実装方式は C に委任(BA の emailAndPassword を dev のみ有効化 or セッション行直挿入)。**必ず curl 相当で cookie が付くことを確認すること。**
- クライアント: `~/features/auth/auth-client.ts`(better-auth/react)+ `<LoginButton>` コンポーネント(Google ボタン + DEV_LOGIN 時のみ「開発ログイン」ボタン)。root loader が `{ user, devLoginEnabled }` を返す。

## 5. 進捗・ゲーミフィケーションサービス契約(F 所有: `~/features/progress/`)

```ts
// すべて server-only(*.server.ts)。env は Env、userId は AuthUser["id"]
export function getCoursesOverview(env: Env, userId: string | null): Promise<CourseOverview[]>;
// CourseOverview = { slug, title, description, level, lessonCount, passedCount, firstLessonSlug }
//   level は CourseLevel("basic"|"intermediate"|"advanced"|"capstone"。ADR #19 / CURRICULUM-2)

export function getCourseDetail(env: Env, userId: string | null, courseSlug: string): Promise<CourseDetail | null>;
// CourseDetail = { slug, title, description, lessons: { slug, title, estMinutes, order, slideCount,
//                  status: "not_started" | "in_progress" | "passed" }[] , passedCount, lessonCount }

export function getExerciseState(env: Env, userId: string, lessonSlug: string): Promise<ExerciseState>;
// ExerciseState = { status, failedCount, unlockedHintCount, solutionAvailable, solutionViewed }
// 導出規則(§7.3): unlocked = min(floor(failed/2), hintCount), solutionAvailable = failed >= 2*hintCount

export type VerdictPayload = { passed: boolean; timedOut: boolean; details: { checkId: string; passed: boolean }[] };
export function submitVerdict(env: Env, userId: string, input: { lessonSlug: string; verdict: VerdictPayload; code: FileMap }): Promise<SubmitResult>;
// SubmitResult = { passed: boolean; streak: { current: number; longest: number; extended: boolean } | null;
//                  newBadges: { id: string; title: string; description: string; icon: string }[];
//                  unlockedHintCount: number; solutionAvailable: boolean }
// - レート制限(§10.4): KV スライディングウィンドウ 30回/分/ユーザー。超過は Response(429, json {error}) を throw
// - 合格時: §9.2 の db.batch(submissions INSERT + lesson_progress UPSERT + daily_activity INSERT OR IGNORE + user_stats UPSERT)
//   → バッジ評価(batch 外, INSERT OR IGNORE)。不合格時: submissions INSERT + failed_count+1 の batch
// - submissions.id は ulidx、content_version は content-meta.json から、code は JSON.stringify(FileMap)
// - ストリーク(§9.2): JST 日付文字列で today/yesterday 比較。日付境界のみ JST(+9h して YYYY-MM-DD 化)、記録は UTC epoch ms
// - Analytics(§10.3): env.ANALYTICS?.writeDataPoint を submit/pass で発火

export function markSolutionViewed(env: Env, userId: string, lessonSlug: string): Promise<void>;
export function getMypage(env: Env, userId: string): Promise<MypageData>;
// MypageData = { stats: { totalPassed, currentStreak, longestStreak }, badges: { earned: BadgeView[], locked: BadgeView[] },
//   courses: CourseOverview[], solutions: { lessonSlug, lessonTitle, code: FileMap }[],  // 最新合格提出のみ
//   resume: { courseSlug, lessonSlug, target: "slides" | "exercise" } | null }
export function runRetention(env: Env, now?: Date): Promise<{ cleared: number }>; // §7.5(90日、最新合格除外)。workers/app.ts の scheduled から呼ぶ

// ~/features/gamification/achievements.ts(クライアント安全 — DB 依存なし)
export function buildAchievements(courses: readonly { slug; title; level? }[]):
  { id: string; title: string; description: string; icon: string;
    condition: (ctx: AchievementCtx) => boolean }[];
// AchievementCtx = { stats: { currentStreak, longestStreak, totalPassed }, passedCountByCourse: Record<string, number>,
//                    courseLessonCounts: Record<string, number>, lessonSlug: string }
// 実体は ~/features/gamification/achievements.server.ts の ACHIEVEMENTS(content-meta のコース一覧を注入して構築)。
// 固定6種(first_pass / passed_10/50/100 / streak_7/30)+ course_complete_{slug} をコース数分動的生成(ADR #19)。
// 既存3種 course_complete_{html-basics,css-basics,js-basics} の id・文言・icon は凍結(DB 保存済みのため不変)
```

日付ユーティリティ: `~/features/progress/jst.ts` に `jstDateString(epochMs): "YYYY-MM-DD"` / `jstYesterday(dateStr)` を置き、vitest でテスト。

## 6. ルート契約(§2.2 — flatRoutes ファイル名固定)

| ファイル | loader が返す | action |
|---|---|---|
| `_index.tsx` (F) | `{ user, courses: CourseOverview[] }` | — |
| `courses._index.tsx` (F) | `{ user, courses: CourseOverview[] }` | — |
| `courses.$course.tsx` (F) | `{ user, course: CourseDetail }`(404 対応) | — |
| `courses.$course.$lesson.slides.$n.tsx` (D) | `{ courseSlug, courseTitle, lessonSlug, lessonTitle, n, slideCount, prevLessonSlug?, isLastSlide }` | — |
| `courses.$course.$lesson.exercise.tsx` (E) | `{ user, courseSlug, lessonSlug, exercise: ExerciseState }`(requireUser) | §6.1 |
| `me.tsx` (F) | `MypageData + { user }`(requireUser) | — |
| `api.auth.$.tsx` (C) | BA handler | BA handler |
| `api.dev-login.tsx` (C) | 404 | dev ログイン |
| `dev.validate.tsx` (B) | DEV_LOGIN=1 時のみ。§8 の自己整合性検証ページ | — |

### 6.1 演習 action(E がルートに実装し、F のサービスを呼ぶ)

FormData: `intent: "submit" | "view-solution"`。submit 時は `verdict`(VerdictPayload の JSON 文字列)+ `code`(FileMap の JSON 文字列)。サーバー側で zod 検証(不正は 400)。戻り値: submit → `SubmitResult` の json、view-solution → `{ ok: true }`。認可は `requireUser`。**verdict の再検証はしない**(ADR #5)。

- スライド・演習ルートの `$lesson` は lesson slug(例 `html-03-links`)、`$course` は course slug。lesson が course に属さない/存在しない場合 404。
- 未ログインで演習を開いた場合: requireUser が `/` へ redirect(LP にログイン導線)。スライドは未ログインでも閲覧可(進捗保存なし)。

## 7. 演習画面 UI 契約(E 所有)

§2.3 を忠実に。3ペイン(左: 手順/ヒント、中央: CodeMirror + ファイルタブ、右: プレビュー)+ 下部バー。

- プレビュータブ: 「あなたの結果」「見本」「コンソール」。dom 系見本 = `composePreview(solution)` のライブ iframe(sandbox="allow-scripts" のみ)。worker 系: あなたの結果/見本ともコンソール出力表示(`runWorkerConsole`)
- HTML/CSS 変更は 300ms デバウンスで srcdoc 差し替え。JS は「実行」ボタン or Ctrl/Cmd+Enter でのみ再実行(§2.3)
- エディタ: 自動補完オフ、シンタックスハイライトあり、`editable:false` は鍵アイコン + readOnly、hidden はタブ非表示
- 全角 lint: `findZenkakuSpaces`(背景ハイライト常時)+ `findZenkakuChars`(警告波線)を CM6 拡張化(`~/features/editor/zenkaku-extension.ts`)
- 下書き: localStorage `draft:{lessonSlug}` に 1s デバウンス保存 `{ files: FileMap, savedAt }`。復元はマウント時。リセットで initial に戻し draft 削除(confirm あり)
- 提出: `judge()` → fetcher.submit(action)。判定メッセージ欄は右下固定・`aria-live="polite"`。不合格 = display 1件のみ、合格 = クリア画面オーバーレイ(streak / newBadges 演出 → 「次のレッスンへ」/「コース一覧へ」)
- 「答えを見る」: solutionAvailable 時のみ活性。押下で view-solution POST + solution をエディタ横 or モーダルで読み取り専用表示(コピー可)
- md 未満: 「手順 / コード / プレビュー」タブ切替(§2.6)
- 新規タブで開く: 合成 HTML を Blob URL で window.open

## 8. 教材 codegen / 検証契約(B 所有、slides 部分のみ D)

- エントリ `app/scripts/codegen/index.ts`(tsx 実行)。`--validate-only` で検証のみ。
- 発見: `content/courses/*/course.ts` を import → `lessons` 配列(slug 順序)→ 各 slug に対応する `lessons/{NN}-*/lesson.ts`(ディレクトリ接頭辞 NN は order。slug との対応は lesson.ts 内の slug が SSOT)
- 検証ステージ1(§4.4): zod parse(lessonSchema/courseSchema)+ slug 重複 + course.lessons と実ディレクトリの 1:1 + スライド 1 枚以上
- 出力: §3.1 の生成モジュール群 + `content/**/assets/*` を `app/public/lesson-assets/{lessonSlug}/` へコピー
- 判定バンドル: esbuild(bundle, iife, minify, target es2020)。エントリは stdin で `lesson.ts` と runtime を import(§3.3 契約)
- 自己整合性検証ステージ2(§4.4): ルート `dev.validate.tsx` が全レッスンを順に `judge(lesson, {...files.initial, ...solution})` し、結果を `data-testid="validate-summary"`(`PASS n/n` or `FAIL ...`)で表示。Playwright(K)がこれを開いて assert

## 9. ファイル所有権マトリクス

| 所有者 | パス |
|---|---|
| orchestrator | ルート設定, docs/**, packages/lesson-kit/src/{types,define,schemas,index}.ts, content/*/course.ts |
| scaffold | app 雛形一式, 各スタブ, biome.json, README.md |
| A | packages/lesson-kit/src/{messages,normalize,zenkaku,loop-protect,limits}.ts + tests/** |
| B | app/app/features/judge/**, app/scripts/codegen/{lessons.ts,judge-bundle.ts,validate.ts}, app/app/routes/dev.validate.tsx |
| C | app/app/features/auth/**, app/app/db/**, app/drizzle/**, wrangler.jsonc, workers/app.ts, app/app/root.tsx, app/app/app.css, app/app/components/ui/**, app/app/lib/site.ts, routes/api.auth.$.tsx, routes/api.dev-login.tsx, .dev.vars.example |
| D | app/app/features/slides/**, routes/courses.$course.$lesson.slides.$n.tsx, app/scripts/codegen/slides.ts, app/mdx.config.ts |
| E | app/app/features/editor/**, app/app/features/exercise/**, routes/courses.$course.$lesson.exercise.tsx |
| F | app/app/features/progress/**, app/app/features/gamification/**, app/app/features/analytics.server.ts, routes/{_index,courses._index,courses.$course,me}.tsx |
| K | e2e/**, .github/workflows/**, infra/terraform/**, docs/RUNBOOK.md |
| G1/G2 | content/courses/html-basics/lessons/{01..05}/** / {06..10}/** |
| H1/H2 | content/courses/css-basics/lessons/{01..05}/** / {06..10}/** |
| I1/I2 | content/courses/js-basics/lessons/{01..06}/** / {07..12}/** |

**凍結(要求はレポートで)**: ルート package.json / pnpm-workspace.yaml / tsconfig.base.json / app/package.json / vite.config.ts / react-router.config.ts / app/tsconfig*.json。

## 10. UI / スタイル規約

- Tailwind CSS v4(`@import "tailwindcss"` in app.css、@tailwindcss/vite)。カスタム CSS 最小限。
- トーン: 背景 slate-50 / 文字 slate-900 / プライマリ indigo-600 / 成功 emerald-600 / 失敗 rose-600。角丸 rounded-xl、カード shadow-sm + border。コントラスト AA(§10.5)。
- 共通 UI は `~/components/ui/`(C が Button/Card/ProgressBar/Badge を用意)。フォントはシステムスタック(外部フォント読み込み禁止)。
- キーボード: スライド ←→、演習 Ctrl/Cmd+Enter 実行。全操作はキーボード到達可能。エディタ内は Tab=インデント / Escape 直後の Tab=フォーカス脱出(脱出手段の周知ヒント必須 — §10.5 / ADR #20)。
- ユーザーコード表示(マイページ解答等)は**必ずテキストとしてエスケープ描画**(React の {} 描画は安全。dangerouslySetInnerHTML 禁止)(§10.2)。

## 11. コマンド一覧(scaffold が整備)

```
pnpm dev                 # app: codegen → react-router dev(vite + workerd, ローカルD1/KV)
pnpm build               # app: codegen → react-router build
pnpm typecheck           # 全パッケージ tsc --noEmit(app は react-router typegen 先行)
pnpm test                # 全パッケージ vitest run
pnpm lint / lint:fix     # Biome
pnpm codegen             # 教材 codegen 単独実行
pnpm validate:content    # 検証ステージ1
pnpm -F @codesteps/app db:migrate:local   # ローカル D1 にマイグレーション適用
pnpm e2e                 # Playwright(webServer 自動起動)
```

## 12. レポート様式(全エージェント必須)

構造化出力(スキーマは起動プロンプトに付与)で返す: `status`(done/partial/blocked), `summary`, `filesCreated[]`, `verification`(typecheck/tests/lint の結果), `deps_needed[]`, `contract_gaps[]`, `notes`。**最終テキストに人間向けの挨拶は不要。データのみ。**
