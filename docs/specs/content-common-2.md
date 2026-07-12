# SPEC content-common-2 — TS / React / ライブラリ / Git 教材の書き方(著者向け実践ガイド)

> 先に読む: `content-common.md`(共通ルール — 全部そのまま適用)→ 本書 → 担当コースの CURRICULUM 行。
> 実行基盤の設計背景は `L-runtime.md`。パイロット実装(そのまま雛形にしてよい):
> `content/courses/{ts-basics,react-basics,libs-basics,git}/lessons/01-*/lesson.ts`

## 0. 共通の大原則

1. **判定は決定的に**。`Date.now()` / `new Date()`(引数なし)/ `Math.random()` / ロケール依存 API に依存する check・solution は禁止。日付は必ず固定文字列(`dayjs("2026-01-01")`)、乱数が要る題材はシード値方式か採用しない。
2. **source check は元の TS/TSX ソースに当たる**。サンドボックスで実行されるのは変換後 JS だが、`cfg.files` / source check / エディタは常に著者が書いた原文。`: string` や `<h1>` を正規表現でそのまま検査できる。
3. **学習者が触るファイルの拡張子で挙動が決まる**: `.ts/.tsx/.jsx` は自動で sucrase 変換(型は消えるだけ・型チェックなし)。`.sh/.txt/.md` はプレーンテキスト(実行されない)。
4. ESM の `import` / `export` はサンドボックス(classic script)では動かない。モジュール構文を書かせるレッスンは作らない(source check で書き方だけ確認するのは可)。

## 1. TypeScript レッスン(ts-basics)

**worker レッスン**(DOM 不要の題材)が基本形。`runner: "worker"` + `.ts` ファイル 1 枚。

```ts
files: {
  "script.ts": { initial: `let libraryName = "TypeScript";\n...` },
},
checks: [
  // ① 型注釈の「書き方」は source check(元ソースの正規表現)
  { type: "source", id: "annotate", file: "script.ts",
    pattern: "libraryName\\s*:\\s*string", message: "libraryName に : string を付けましょう" },
  // ② 「挙動」は fn / console check(変換後 JS が実行された結果)
  { type: "fn", id: "works", name: "describe", args: ["TypeScript", 5], returns: "TypeScript v5" },
  { type: "console", id: "print", lines: ["TypeScript v5"] },
],
```

- 型の「正しさ」を機械では検査しない(tsc は走らない)。**書かせたい型の形を source check の正規表現で拘束**し、挙動を fn/console で確認する二段構えにする。
- 正規表現は空白ゆらぎを許す(`\\s*`)。`interface` / `type` エイリアスも同様に source check で。
- fn check の対象は **function 宣言**(教材規約 — CONTRACTS §3.3)。アロー関数を fn check にしない。
- DOM を使う TS 題材(イベントに型を付ける等)は `runner: "dom"` + `<script src="main.ts">` で書ける(パイプラインは同じ)。

## 2. React レッスン(react-basics)

`runner: "dom"`。**index.html は editable: false** にして script タグ 2 本 + 自分のコードの構成を見せる:

```html
<div id="root"></div>
<script src="/vendor/react.production.min.js"></script>
<script src="/vendor/react-dom.production.min.js"></script>
<script src="app.jsx"></script>
```

- **順序が生命線**: react → react-dom → 自分の `.jsx`。vendor は必ず絶対パス `/vendor/…`(`<base>` が lesson-assets を指すため相対は不可)。
- JSX は classic runtime に変換される(`React.createElement`)。UMD グローバル `React` / `ReactDOM` が前提なので、**import 文は書かない・書かせない**。
- 描画の決まり文句は `const root = ReactDOM.createRoot(document.getElementById("root")); root.render(<App />);`。
- **判定タイミング**: React 18 の初期 render は非同期だが、ランタイムが load 後にダブル rAF + 微小待ちで settle してから check を評価する(L-runtime §3.3)。**初期表示の element/text check はそのまま書いてよい**。
- クリックで state が変わる題材は custom check + `fire` / `wait`:

```ts
{
  type: "custom", id: "counter-increments",
  message: "ボタンを押すたびにカウントが 1 増えるようにしましょう",
  run: async (ctx) => {
    ctx.fire("#increment", "click");
    await ctx.wait(50); // React の再 render を待つ(50ms で十分)
    return ctx.document.querySelector("#count")?.textContent?.trim() === "1";
  },
},
```

- setState 後の DOM 反映は同期ではない。**fire → wait(50) → 検査**を型として使う。
- `return null;` を初期値にすると初期状態がエラーなしで空になる(react-01 参照)。

## 3. ライブラリレッスン(libs-basics)

vendor 提供ライブラリとグローバル名:

| script src | グローバル | 用途例 |
|---|---|---|
| /vendor/dayjs.min.js | `dayjs` | 日付整形・加算・差分 |
| /vendor/lodash.min.js | `_` | 配列/オブジェクトのユーティリティ |
| /vendor/zod.js | `z` | スキーマ検証(`z.string()` 等) |
| /vendor/react(-dom).production.min.js | `React` / `ReactDOM` | §2 |
| /vendor/git-sim.js | `GitSim` | §5(プレビュー再生専用) |

- **dayjs は固定日付必須**: `dayjs()`(現在時刻)を使った瞬間、判定も見本も日によって壊れる。`dayjs("2026-01-01")` のように必ず固定する。`.format()` の出力を text / console check で検査する。
- lodash: `_.chunk` / `_.uniq` など戻り値が決定的なものだけ題材にする(`_.sample` / `_.shuffle` は禁止)。
- zod: `z.string().safeParse(...)` の `success` を画面や console に出させて check する構成が書きやすい。バリデーション結果は入力固定なら決定的。
- script タグの順序ミス(ライブラリより先に自分のコード)は定番のつまずきなので、レッスン側で `<!-- ここに〜 -->` コメントで位置を誘導し、ヒントでも順序に触れる(lib-01 参照)。

## 4. テキスト演習(.txt / .md)

コードを書かずに「読んで書く」演習(コミットメッセージ・README・設定値など)は **worker レッスン + source check** で成立する:

```ts
files: { "commit-message.txt": { initial: "# 1行目に要約を書こう\n" } },
runner: "worker",           // DOM 系 check が無ければ省略でも worker になる
checks: [
  { type: "source", id: "subject", file: "commit-message.txt",
    pattern: "^(feat|fix|docs):\\s?.+", flags: "m",
    message: "1行目は feat: / fix: / docs: で始めましょう" },
],
```

- `.txt/.md/.sh` は実行対象ではないので、Worker は「何も実行せず」判定バンドルだけが走る。console/fn check は使えない(source check のみで設計する)。
- エディタはプレーンテキスト表示(ハイライトなし)。

## 5. Git レッスン(git)— 雛形と判定 API

### 5.1 ファイル構成(git-01 が雛形。今後の全レッスンでこの4点セット)

```
lessons/NN-topic/
  lesson.ts
  slides/01..04.mdx
```

```ts
files: {
  "commands.sh": { initial: "# コメントで手順を誘導\n" },          // 学習者が書く
  "setup.sh":    { initial: "…", editable: false, hidden: true },  // 初期状態のシード
  "index.html":  { initial: "…", editable: false, hidden: true },  // git-01 からコピー(変更不要)
  "preview.js":  { initial: "…", editable: false, hidden: true },  // git-01 からコピー(変更不要)
},
runner: "dom",
```

- index.html / preview.js は **git-01 のものをそのままコピー**する(ターミナル再生は `GitSim.renderPlayback(container, setup, commands)` 呼び出しだけ)。preview.js は `window.__FILES__ || {}` でガード済み(判定 iframe には __FILES__ が無い)。
- `commands.sh` の編集はプレビューに自動追従する(300ms デバウンス。.js 系ではないため)。

### 5.2 setup.sh の書き方(初期状態のシード)

setup も通常コマンドだけで書く(特別な構文はない)。出力は transcript に含まれない。

```sh
# 例: main に2コミット + リモート先行1コミットの状態を作る
git init
echo "v1" > app.txt
git add .
git commit -m "first"
echo "v2" > app.txt
git add .
git commit -m "second"
git push -u origin main
git reset --hard HEAD~1   # ← ローカルだけ巻き戻す = リモートが先行した状態
```

- **リモート先行**は「push → reset --hard」のイディオムで作る。
- **conflict シナリオ**は「共通の祖先を作る → ブランチで同一ファイルを変更 → main でも同一ファイルを変更」まで setup で済ませ、学習者に merge / rebase させる:

```sh
# setup.sh(conflict 教材)
git init
echo "はじめまして" > greeting.txt
git add .
git commit -m "base"
git switch -c feature
echo "こんばんは" > greeting.txt
git add .
git commit -m "feature側の変更"
git switch main
echo "こんにちは" > greeting.txt
git add .
git commit -m "main側の変更"
```

学習者の解決フロー(そのまま教える): `git merge feature`(conflict 発生)→ `echo "解決後の内容" > greeting.txt` → `git add greeting.txt` → `git commit -m "解決"`。rebase は `git rebase main` → 編集 → `git add` → `git rebase --continue`。

> **3way マージのシナリオ設計**: 現状の shell コマンド集合(`git` / `echo` / `cat` / `ls` / `touch`。ファイル削除コマンドは無い)では、教材から作れる 3way コンフリクトは **両側で同一ファイルを「変更」した**種類のみ。conflict シナリオはこの「両側変更」で設計すること。(git-sim の `threeWayMerge` は片側削除・片側変更も実 git 同様コンフリクトにするが、削除を作る手段が無いため教材からは到達しない。将来 `rm` 相当を実装したら削除/変更コンフリクトも扱える。)

### 5.3 判定(custom check + GitSim)

```ts
import { GitSim } from "@codesteps/lesson-kit/git-sim";

{
  type: "custom", id: "merged-clean",
  message: "feature を main に取り込み、コンフリクトを解決しきりましょう",
  run: (ctx) => {
    const sim = GitSim.fromScripts(ctx.files["setup.sh"] ?? "", ctx.files["commands.sh"] ?? "");
    return sim.isMerged("feature", "main") && sim.isClean() && !sim.hasConflictMarkers("greeting.txt");
  },
},
```

- `ctx.files` は提出ファイル原文(hidden 含む)。**setup.sh を第1引数に渡し忘れない**こと。
- 述語は「状態」で書き、コマンドの書き方そのものは source check で軽く拘束する(`git\s+merge` 等。厳しくしすぎない — 別解を許容)。
- `!sim.hasErrors()` を含めると「タイポで赤エラーが出たまま」の提出を弾ける(初級レッスンでは推奨。上級では任意)。

### 5.4 GitSim 判定 API 一覧

| メソッド | 返り値 | 用途 |
|---|---|---|
| `GitSim.fromScripts(setup, user)` | GitSim | 唯一のエントリ |
| `transcript()` / `lastOutput()` / `hasErrors()` | 実行記録 | 出力・エラー検証 |
| `branches()` / `currentBranch()` / `branchExists(n)` | ブランチ状態 | branch/switch 課題 |
| `log(ref?)` / `commitCount(ref?)` / `headHash()` | 第1親チェーン | commit 数・メッセージ検証 |
| `fileContent(path)` / `workdirFiles()` / `stagedFiles()` | 作業状態 | add/echo 課題 |
| `isClean()` / `isMerging()` / `isRebasing()` | 進行状態 | 「やり切ったか」検証 |
| `isMerged(a, b)` / `isAncestor(a, b)` | boolean | merge/rebase 課題 |
| `isLinearHistory(ref?)` | boolean | rebase(マージコミット無し)検証 |
| `remoteBranchExists("origin/main")` / `remoteLog(ref)` | リモート実体 | push/pull 課題 |
| `hasConflictMarkers(path)` | boolean | conflict 解決の検証 |
| `logGraph()` | string | (主にプレビュー用) |

ref は `"HEAD"` / `"HEAD~N"` / ブランチ名 / `"origin/x"` / 7桁ハッシュ前方一致。

### 5.5 対応コマンド一覧(これ以外は「未対応」エラーになる)

- git: `init` / `status` / `add <path>…|.` / `commit -m "msg"`(MERGING 中は `-m` 省略可)/ `log [--oneline] [--graph]` / `branch [名前] [-d]` / `switch [-c] <br>` / `checkout [-b] <br>` / `merge <br>` / `merge --abort` / `rebase <br>` / `rebase --continue` / `rebase --abort` / `push [-u] [origin <br>]` / `pull [origin <br>]` / `fetch` / `diff [--staged]` / `reset --hard|--soft [HEAD~N]` / `revert HEAD` / `stash` / `stash pop`
- シェル: `echo "内容" > file` / `>>` 追記 / `cat file` / `ls` / `touch file`。行頭 `#` はコメント。1行1コマンド。
- 制約(教材設計で避ける): パスにスペース不可(クォートでファイル名は不可)、パイプ・`&&` なし、`git commit -am` なし、リモートは `origin` のみ、`git clone` なし。

### 5.6 サイズ予算(重要)

git レッスンの判定バンドルは git-sim 同梱で固定費 ~35KB。**lesson.ts(initial/solution/hints/checks)に使えるのは実質 ~10KB**(50KB 警告まで)。長大な setup や巨大なファイル内容を避け、`pnpm codegen` のログで自分のレッスンのバンドルサイズを確認すること。

## 6. 自己検証(全コース共通・追加分)

1. `pnpm validate:content` → green
2. `pnpm codegen` → 自レッスンのバンドルサイズが 50KB 警告を出していない
3. solution を頭の中で全 check に通す(content-common §品質基準)。React は「settle 後の DOM」、git は「GitSim.fromScripts(setup, solution の commands.sh)」を想像で実行する
4. 迷ったら `packages/lesson-kit/src/git-sim/git-sim.test.ts` に自分のシナリオを一時的に足して挙動を確かめる(コミットには含めない)
