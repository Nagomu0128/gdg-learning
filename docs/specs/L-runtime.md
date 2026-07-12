# SPEC L — レッスン実行基盤の拡張(TS/JSX トランスパイル + vendor + git-sim)

> TypeScript / React / ライブラリ / Git 教材(計 78 レッスン計画)が依存するプラットフォーム拡張の設計記録。
> 決定の要約は DesignDoc §13 ADR #21 / #22。教材著者向けの実践ガイドは `content-common-2.md`。

## 1. 全体像(判定 / プレビューの経路)

```
                    ┌─ エディタ・source check・cfg.files ──── 常に「元の TS/TSX ソース」
files (FileMap) ────┤
                    └─ 実行系(プレビュー iframe / 判定 iframe / Worker)
                         │
                         ▼
      [1] sucrase 変換 (.ts/.tsx/.jsx のみ。dynamic import で code-split)
                         │   構文エラー → SyntaxDiag(行番号つき日本語)→ JS 非注入で終了
                         ▼
      [2] instrumentLoops(acorn。ループ保護 — TS を読めないため必ず [1] の後)
                         │   構文エラー → 同上
                         ▼
      [3] インライン化(composer が srcdoc へ / worker-runner が blob へ)
                         │
   ┌─────────────────────┼──────────────────────┐
   ▼ preview             ▼ judge                 ▼ worker
 CSP / <base> /        CSP / <base> / hook /   hook / ユーザーJS(try/catch)/
 hook / __FILES__ /    判定バンドル /           判定バンドル / startWorker
 ユーザーHTML+CSS+JS   __JUDGE__.start({files})
```

- **元ソースの不変条件**: cfg.files / source check / エディタ / 下書き / 提出 code はすべて元の TS/TSX ソース。変換後コードはサンドボックス実行にのみ使い、どこにも保存しない。
- HTML 内インライン `<script>` の TS は対象外(教材は外部ファイル参照方式)。インライン JS は従来どおりループ保護のみ。

## 2. トランスパイル(sucrase)

### 2.1 同期 / 非同期の設計

- `composeDocument`(内部)と `buildWorkerSource` は**同期のまま**。オプション引数 `transpile?: Transpiler` を受け取り、`.ts/.tsx/.jsx` があるのに未指定なら throw(実装ミスの早期検出)。
- 公開 API 側で吸収する:
  - `judge()` — もともと async。内部で `ensureTranspiler(files)` を await。
  - `composePreview()` — **async 化**(CONTRACTS §3.2 を改訂)。呼び出し側は `exercise-screen.tsx` のみで、デバウンス effect / 実行ボタン / 見本生成を Promise 追随に変更(effect はキャンセルフラグで stale 解決を破棄)。
  - `runWorkerConsole()` — もともと Promise 返し。内部で await。
- `ensureTranspiler(files)` は `needsTranspile(files)`(キーの拡張子判定)が偽なら **dynamic import せず**即 resolve。→ 既存レッスン(HTML/CSS/JS)では sucrase チャンク(~150KB)を一切読み込まない。ロードは初回のみ(モジュールスコープでメモ化)。

### 2.2 変換オプションと診断

| 拡張子 | transforms | 備考 |
|---|---|---|
| `.ts` | `["typescript"]` | 型注釈の除去のみ |
| `.tsx` | `["typescript", "jsx"]` | classic runtime |
| `.jsx` | `["jsx"]` | classic runtime |

- `jsxRuntime: "classic"`(`React.createElement` / `React.Fragment`)。vendor の React UMD グローバル前提。automatic runtime は import 注入が必要になるため不採用。
- `disableESTransforms: true` — 構文の downlevel をしない。**sucrase は行番号を保存する**ため、後段 acorn・全角診断の行番号が元ソースとずれない。
- 構文エラーは `diagnoseJsParseError(source, loc)`(全角診断)→ フォールバック `generalSyntaxErrorMessage(line)` で既存 `SyntaxDiag` に変換し、「構文エラー時は JS を注入しない」既存挙動に合流する。
- 型チェックはしない(sucrase は型を「消す」だけ)。型の正しさは source check / fn check で担保する設計(content-common-2 §1)。

### 2.3 判定バンドルの禁止依存(codegen 検証)

`judge-bundle.ts` の `FORBIDDEN_INPUTS` に追加: `sucrase` / `react` / `react-dom` / `git-sim/render.ts`。混入はビルド時エラーで落ちる。

## 3. vendor スクリプト基盤

### 3.1 生成物(`app/scripts/build-vendor.ts` → `app/public/vendor/`)

| ファイル | 供給元 | サイズ目安 | グローバル |
|---|---|---|---|
| react.production.min.js | react@18.3.1 UMD(alias: react-umd) | 10.5KB | `React` |
| react-dom.production.min.js | react-dom@18.3.1 UMD(alias: react-dom-umd) | 128.7KB | `ReactDOM` |
| dayjs.min.js | dayjs@1.11.21 | 7.0KB | `dayjs` |
| lodash.min.js | lodash@4.17.21 | 71.3KB | `_` |
| zod.js | zod(app 依存)を esbuild IIFE 化 | 323.6KB | `z` |
| git-sim.js | lesson-kit git-sim + render を esbuild IIFE 化 | 31.5KB | `GitSim` |

- React 19 は UMD 配布がないため 18 系。app 本体の react@19 と共存させるため pnpm alias(`react-umd@npm:react@18.3.1`)で devDependencies に固定。
- `app/public/vendor/` は gitignore。**codegen 実行時に毎回再生成**(`scripts/codegen/index.ts` が `buildVendor()` を先行実行)するため、dev / typecheck / CI / build / E2E のどの経路でも存在が保証される(`--validate-only` では生成しない)。
- 教材からは `<script src="/vendor/react.production.min.js"></script>` のように**絶対パス**で参照する。`<base>` は lesson-assets を指すため相対パスでは解決できない。
- composer は「files に存在しない src 参照はそのまま残す」既存挙動のため、vendor 参照は素通りしてブラウザが取得する。**vendor スクリプトにループ保護がかからないのは意図どおり**(信頼済みコード・変換コスト回避)。

### 3.2 CSP 変更(§6.5 の改訂)

```
default-src 'none'; script-src 'unsafe-inline' {origin}; style-src 'unsafe-inline'; img-src data: {origin}
```

`script-src` に自オリジンを追加(vendor 取得のため)。外部オリジンへのスクリプト・fetch・XHR は引き続き遮断され、判定の決定性(§6.5 の主目的)は保たれる。自オリジン配信物はリポジトリ管理の生成物のみなので信頼境界も変わらない。

### 3.3 判定タイミング(React 18 の非同期 render 対策)

`runtime.ts` の `whenDocumentSettled()` を拡張: load(上限 1500ms)後に**ダブル requestAnimationFrame + 微小待ち(30ms)**を挟む。判定 iframe は画面外配置で rAF が throttle され得るため、150ms の上限タイマーとの race で必ず前進する。React 18 `createRoot().render()` の初期コミットはスケジューラ(MessageChannel)経由の非同期のため、この settle なしでは element check が初期 render 前に走り得る。

## 4. プレビューへの files 注入と CustomCheckContext.files

- **preview モード**の composer は console フックの直後に `globalThis.__FILES__ = <files の JSON>` を注入する(`escapeJsonForScript` で `<` エスケープ済みの不活性データ)。git レッスンの再生スクリプト(hidden の preview.js)が commands.sh 原文を読むための供給路。判定モードでは注入しない(判定時の files は `__JUDGE__.start({ files })` 経由)ので、preview.js は `window.__FILES__ || {}` でガードする。
- `CustomCheckContext` に `files: FileMap` を追加(lesson-kit types.ts / runtime buildCustomContext)。custom check が提出ファイル原文(hidden 含む)を参照できる。git 教材の判定コアはこれ + GitSim。

## 5. git-sim アーキテクチャ(packages/lesson-kit/src/git-sim/)

### 5.1 設計原則

- **決定的**: `Date.now` / `Math.random` 禁止。時刻は論理クロック(seq)、コミットハッシュは `FNV-1a(親 + メッセージ + ツリー直列化 + seq)` の 7 桁 hex(衝突時は salt を増やして決定的に回避)。同一入力 → 同一 transcript・同一ハッシュ(vitest で検証)。
- **依存ゼロの純 TS**: 判定バンドルに同梱される(lesson.ts が import)ため。
- **実 git の置換モデル**(ADR #22): 本物の git ではなく「学習に必要な状態遷移を忠実に再現する」シミュレータ。出力は git に雰囲気を寄せた簡潔な日本語。

### 5.2 モジュール構成

| ファイル | 役割 | 判定バンドル |
|---|---|---|
| hash.ts | FNV-1a → 7桁hex | 入る |
| repo.ts | リポジトリモデル(コミットDAG・ブランチ・HEAD・ワーキング/ステージ・リモート・スナップショット) | 入る |
| engine.ts | 行指向スクリプトの実行(tokenize → git/シェル dispatch → transcript) | 入る |
| index.ts | 公開 API(`GitSim.fromScripts` + 判定用述語) | 入る |
| render.ts | `renderPlayback`(ターミナル風再生 + 簡易グラフ。textContent ベース) | **入れない**(vendor のみ。FORBIDDEN_INPUTS で強制) |

deep export: `@codesteps/lesson-kit/git-sim`(判定用)/ `…/git-sim/render`(vendor ビルド用)。メイン index からは re-export しない(tree-shake 事故防止)。

### 5.3 リポジトリモデルの要点

- オブジェクトストア(hash → Commit)は**ローカル・リモート共有**。リモート `origin` はブランチ名 → hash の Map(bare 相当)で、`remoteRefs`(origin/x の追跡参照)とは区別する(fetch の意味を保つ)。
- ステージはスナップショット方式(`index: Map<file, content>`)。`git add` は workdir → index のコピー。
- merge / rebase の conflict は「ワーキングファイルへの `<<<<<<< HEAD` マーカー書き込み + pending 状態(MERGING / REBASING)」。解決フローは実 git と同型(編集 → `git add` → `git commit` / `git rebase --continue`)。`--abort` は開始時スナップショットの復元。
- リモート先行状態のシードは特別な仕組みを使わず「push してから `git reset --hard HEAD~1`」で作る(setup スクリプトも通常コマンドのみで表現できる)。
- 未知コマンド・失敗はエラーとして transcript に記録し**続行**する(1 行のミスで以降が全部無言にならない)。

### 5.4 サイズ実測(minify 後)

git-01 判定バンドル合計 **45.3KB**(警告しきい値 50KB 未満)。内訳: engine 25.1KB / lesson.ts 4.6KB / runtime 4.2KB / repo 2.9KB / git-sim index 2.3KB / lesson-kit 共通(messages・zenkaku・normalize・markup-lint-css)約 6.7KB。文字列(日本語メッセージ)は約 8.9KB。**今後の git レッスンは lesson.ts に使える予算が実質 ~10KB** な点に注意(content-common-2 §5.6)。

## 6. 変更したファイル(オーナー: 本 SPEC)

- `app/app/features/judge/transpile.ts`(新規)+ composer / worker-runner / index / runtime(whenDocumentSettled・buildCustomContext)
- `app/app/features/editor/code-editor.tsx`(languageFor のみ)/ `app/app/features/exercise/exercise-screen.tsx`(composePreview async 追随)
- `app/scripts/build-vendor.ts`(新規)/ `app/scripts/codegen/index.ts` / `app/scripts/codegen/judge-bundle.ts`
- `packages/lesson-kit/src/git-sim/**`(新規)/ `packages/lesson-kit/src/types.ts`(CustomCheckContext.files)
- `content/courses/{ts-basics,react-basics,libs-basics,git}/**`(パイロット4レッスン)
- `app/vite.config.ts`(**凍結ファイルの例外** — CONTRACTS §9)。追加は `optimizeDeps.include` / `ssr.optimizeDeps.include` の **dev 専用設定のみ**で、動的 import 依存(sucrase 等)の遅延発見による dev サーバ不安定・検証ループ宙吊りを起動時の事前最適化で防ぐ。`vite build` / wrangler 成果物・判定バンドルには非対象。
