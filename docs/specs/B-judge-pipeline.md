# SPEC B — 判定パイプライン(composer / ランナー / judge / codegen)

**本プロジェクトの技術的中核。** 先に読む: DesignDoc §4.2, §5, §6 全部 → CONTRACTS §2, §3, §8。

## 所有権

- `app/app/features/judge/**`(構成は自由。公開 API は `index.ts` — CONTRACTS §3.2 固定)
- `app/scripts/codegen/{lessons.ts,judge-bundle.ts,validate.ts}`(index.ts は既存の呼び出し骨格を維持。slides.ts は D の所有 — 触らない)
- `app/app/routes/dev.validate.tsx`
- 自分のユニットテスト(`app/app/features/judge/**/*.test.ts`, `app/scripts/codegen/**/*.test.ts`)

## 実装

### 1. composer(§6.1)

`composeDocument(input)` を内部共通にし、公開は `composePreview` / 判定用は judge 内部から使用:

- files から `index.html` 系(最初の .html)を土台に、`<link rel="stylesheet" href="X">` を files 内 X の `<style>` へ、`<script src="Y">` を files 内 Y のインラインへ置換(存在しない参照はそのまま残す)。HTML ファイルがない worker 系は対象外
- 注入(順序は CONTRACTS §3.3): CSP meta(§6.5、`img-src data: {origin}`)→ `<base href="{origin}/lesson-assets/{slug}/">` → コンソールフック → (JS は instrumentLoops 済みで)→ 判定時のみ判定バンドル + bootstrap
- コンソールフック: console.log/info/warn/error を `__CONSOLE__` に push(引数は文字列化: primitives はそのまま、オブジェクトは JSON.stringify 試行 → ダメなら String())+ `window.onerror` / `unhandledrejection` を error として捕捉。**プレビュー時**は `parent.postMessage({kind:"preview:console", nonce, entry}, "*")` でも中継
- `</script` エスケープ・JSON の `<` エスケープ(CONTRACTS §3.3)
- head が無い/骨格が無いユーザー HTML でも壊れないこと(文字列先頭に注入 → ブラウザの寛容パースに任せる)

### 2. 判定ランタイム(サンドボックス内で動く。`features/judge/runtime/` 推奨)

- esbuild でバンドルされる前提の**自己完結コード**(import は lesson-kit の純粋関数と checks のみ。zod・acorn 禁止 — lesson-kit は sideEffects:false なので import 経路に注意)
- `createJudgeRuntime(def: LessonDef)` が `globalThis.__JUDGE__ = { start, startWorker }` を定義(CONTRACTS §3.3)
- check 評価は CONTRACTS §3.4 の表に忠実。各 check try/catch で全件評価 → details 全件・display 最初の失敗(§5.1)
- element/attribute/style 失敗時の全角差し替え(§5.4): 対象ソース(element/attribute → 最初の .html ファイル、style → 全 .css ファイル + .html)へ `diagnoseMarkupZenkaku`
- style check の canonicalization(§5.3): プローブ div を body に append → `probe.style.setProperty(prop, equals)` → computed 比較 → remove
- custom ctx の `fire`: `el.dispatchEvent(type === "click" ? new MouseEvent("click", {bubbles:true, cancelable:true}) : new Event(type, {bubbles:true}))`
- 結果送信は 1 回だけ(送信済みフラグ)。DOM: `parent.postMessage(..., "*")` / Worker: `self.postMessage(...)`

### 3. judge() 親側(§5.1, §5.5, §6.3, §6.4)

- dom: 非表示 iframe(`sandbox="allow-scripts"` **のみ** — allow-same-origin 絶対禁止)を**毎回新規生成**、800×600 固定、srcdoc 注入。5000ms タイムアウト。受理 3 条件(source / origin "null" / nonce)。verdict 受信 or タイムアウトで **必ず remove**
- worker: `URL.createObjectURL(new Blob([...]))` → Worker 起動、2000ms で terminate(§6.4)。blob 構成は CONTRACTS §3.3。objectURL は revoke
- nonce: `crypto.randomUUID()`
- instrumentLoops が ok:false → サンドボックス起動せず即 syntax 不合格(CONTRACTS §3.2)
- タイムアウト verdict: `{ passed:false, display:{checkId:"__timeout__", message:TIMEOUT_MESSAGE_JP}, details:[], console:[捕捉分あれば], timedOut:true }`
- ループ保護超過(`__LOOP_LIMIT_EXCEEDED__` が console.error や onerror に乗る)は display message を LOOP_LIMIT_MESSAGE_JP に(runtime 側で検出して verdict に反映するのが確実)

### 4. codegen(§4.2, §4.4 ステージ1 / CONTRACTS §3.1, §8)

- `lessons.ts`: content 発見(`content/courses/*/course.ts` を動的 import — tsx 実行なので TS を直接 import できる。Windows パスは `pathToFileURL`)→ 検証(courseSchema/lessonSchema parse、slug 重複、course.lessons ↔ `lessons/{NN}-*/lesson.ts` の 1:1、スライド `slides/*.mdx` 1 枚以上)→ 生成:
  - `generated/lessons/{slug}.ts`(meta/files/hints/solution/judgeBundle。文字列は JSON.stringify で埋め込み)
  - `generated/lessons.client.ts`(import.meta.glob で遅延レジストリ。LoadedLesson 型定義もここ — スタブの型を踏襲)
  - `generated/content-meta.json`(contentVersion = `git rev-parse --short HEAD` || "dev")
  - assets コピー: `content/**/lessons/*/assets/*` → `app/public/lesson-assets/{lessonSlug}/`
- `judge-bundle.ts`: esbuild build({ stdin, bundle, format:"iife", minify:true, target:"es2020", write:false })。stdin contents = `import def from "<lesson.ts abs>"; import { createJudgeRuntime } from "<runtime abs>"; createJudgeRuntime(def);`(パスは POSIX 化)。バンドルサイズを計測し 1 本 50KB 超なら警告ログ(§4.2 は数KB想定)
- `validate.ts`: `--validate-only` 用(検証のみ・出力なし)。エラーは「ファイル名 + slug + zod issue」を人間可読で列挙して exit 1
- **重要**: codegen は content が 0 レッスンでも空レジストリを出力して正常終了(scaffold スタブと同じ挙動を維持)

### 5. dev.validate.tsx(§4.4 ステージ2の実行面)

`env.DEV_LOGIN === "1"` 以外は 404。クライアントで全レッスンを順に `loadLesson` → `judge(lesson, {...initialの全ファイル, ...solution})` → 結果テーブル表示。完了時に `<div data-testid="validate-summary">PASS 32/32</div>`(失敗があれば `FAIL n/32` + 失敗 slug と display.message の列挙)。K の Playwright がこれを assert する。

### 6. テスト(vitest / node 環境で可能な範囲)

composer の合成(link/script インライン化・注入順序・エスケープ)、codegen の検証エラー系(フィクスチャ教材を `scripts/codegen/__fixtures__/` に置く)、判定は E2E(K)に委ねる。

## 完了条件

`pnpm -F @codesteps/app typecheck` が自分のファイル起因で fail しない / 自分のテスト green / `pnpm codegen`(content 空)green / Biome green。
