# SPEC J — 合格判定ロジックの堅牢化(第2弾)

先に読む: DesignDoc §5(判定エンジン)・§4.4(教材CI検証) → CONTRACTS §2, §3.4, §8。
第1弾(CSSOM :hover 対応・構造ゲート等)の続き。本書は「弱い check が誤って合格を出す /
異常系で不親切に落ちる」問題への体系的対策の記録: 監査した項目・実装した対策・見送りと理由・著者向けの新オプション説明。

## 1. initial-must-fail 検証(教材 CI ステージ2の拡張)

**不変条件**: 各レッスンは「solution で全 check 合格」に加えて「**initial(手つかずの初期コード)では不合格**」でなければならない。initial のまま合格するレッスンは check に穴がある(何も書かずにクリアできる)。

- `app/app/routes/dev.validate.tsx` が全レッスンを 2 回 judge する(solution 合格 + initial 不合格)。片側だけ走らせたいときは `?variant=solution` / `?variant=initial`
- 判定は並行度 2(`JUDGE_CONCURRENCY`)。判定 iframe / Worker は nonce と source 照合で分離されており並行安全。判定数が 2 倍になっても壁時間は従来と同程度
- `e2e/tests/content-validation.spec.ts` が `PASS n/n` を assert(タイムアウトは 12 分 — CI 30 分枠内)
- 違反が見つかったら **check 側を強化して直す**(count 指定・ignoreComments・挙動 check の追加など)。テストの緩和・skip は禁止

## 2. per-check タイムアウト(`CHECK_TIMEOUT_MS = 1500`)

**問題**: 解決しない Promise を返す fn / custom check が 1 つあると、判定全体タイムアウト(dom 5000ms / worker 2000ms)まで巻き込まれ、`Verdict.details` が空になる(`timedOut: true` の外殻フォールバック)。後続 check の結果が記録されず、表示も一般タイムアウト文言になる。

**対策**: `runChecks`(runtime.ts)が 1 check ごとに `CHECK_TIMEOUT_MS`(lesson-kit `limits.ts`)で打ち切る。

- タイムアウトした check は**不合格**として記録し、後続 check の評価を続行(details の完全性)
- 表示メッセージは通常の失敗と同じ(`check.message ?? defaultMessageFor(check)`)— 学習者には「その check が未達成」という同じ意味
- 打ち切り後に遅れて reject しても未処理拒否にならない(reject ハンドラを先に張る)
- 外殻タイムアウト(5000/2000ms)は [フェイルセーフ] としてそのまま残る。複数の check が同時にハングする病的ケース(教材は信頼境界の内側なので実質著者バグ)では外殻が先に落ちることがある — これは仕様
- **副作用の非対称性(著者向け注記)**: per-check タイムアウトは `evaluateCheck` の Promise を放置するだけで、worker の `terminate()` のような強制停止はしない。したがって打ち切り後も custom check の副作用(`ctx.fire` 後の DOM 変化・`ctx.wait` 明けの処理)はバックグラウンドで継続しうる。判定 iframe は毎回使い捨てなので残留しないが、custom check の `ctx.wait` 合計は **1000ms 以内**に収めること(CONTRACTS §3.4 に同注記)

### 2.1 `CHECK_TIMEOUT_MS`(1500ms)と `WORKER_TIMEOUT_MS`(2000ms)の関係 — 検討と結論

per-check 1500ms は worker 外殻 2000ms の 75% を占める。worker 系で 1 つの check が 1500ms 弱ハングすると、外殻 2000ms との差 500ms しか後続 check に残らず、2 個目以降が per-check ではなく外殻タイムアウトで落ちて details が欠ける懸念がある。

- **現状の実測**: 現行教材の custom/fn check の待ち(`ctx.wait`)は最大 500ms(多くは 0〜200ms)。DOM 描画待ちの `whenDocumentSettled` は worker 系では発生しない。よって worker 系で per-check が 1500ms 近くまで伸びる check は**現状ゼロ**で、この懸念は顕在化しない
- **見送った代替案**: (a) worker 用に別の保守的な per-check 値(例 750ms)を設ける、(b) `CHECK_TIMEOUT_MS` を外殻の比率(例 60%)から導出する。いずれも「まだ起きていない問題」への複雑性追加であり、`ctx.wait ≤ 1000ms` の著者規約(上記)を守れば per-check 1500ms は worker 外殻 2000ms 内に必ず 1 個は収まる
- **結論: 現状維持(単一の `CHECK_TIMEOUT_MS = 1500`)**。ただし将来 worker 系で長い待ちを要する custom check を導入する場合は、上記 (a)/(b) を再検討する。トリガは「worker 系レッスンで per-check タイムアウトが常態化」。それまでは `ctx.wait ≤ 1000ms` 規約 + 外殻フェイルセーフで十分

## 3. 監査結果と実装

### 3.1 text check — 全角の空白正規化・全角英数字の診断(実装)

- **空白正規化の一貫性**: `normalizeText` の `\s+` は全角スペース(U+3000)・NBSP を含む(JS 正規表現の仕様)。両辺(actual / expected)とも同じ正規化を通る — **監査の結果、既存実装は一貫しており変更不要**。テストで固定(`normalize.test.ts`)
- **全角英数字・記号の診断**: `diagnoseTextZenkaku(actual, check)` を追加(zenkaku.ts)。text check 失敗時に「actual を半角化(`toHalfWidth`)すると合格する」場合のみ、最初の全角文字を指して「「３」が全角で入力されています。半角の「3」に直しましょう」を返す。半角化しても合格しない失敗(内容自体の間違い・期待値が全角を要求)には発火しない = **偽陽性ゼロ**(§5.4 の症状駆動と同じ原則)。runtime の失敗メッセージ差し替えチェーンに組み込み(markup 全角 → CSS タイポ → text 全角 → check.message → 既定)

### 3.2 console check — trim 一貫性・重複行の部分列マッチ(監査のみ・変更不要)

- 行比較は actual / expected の両方が `normalizeText`(trim + 空白畳み。全角スペース含む)を通る — 一貫している
- 非 ordered は多重集合判定(pool から splice で消費)— 同一行が複数回期待されるケースの消費は正しい
- ordered は貪欲な部分列判定 — 部分列の存在判定において貪欲法は常に正しい(消費バグなし)
- **結論: バグなし**。重複行(`a,b,a`)・全角スペース混在のテストを追加して挙動を固定

### 3.3 fn check — deepEqualWithNaN の -0 / 循環参照 / 深い入れ子(実装)

- **-0**: `Object.is(0, -0)` は false のため、`Math.round(-0.4)`(= -0)を返した学習者が期待値 `0` で不合格になっていた。数値比較を `a === b || (NaN 同士)` に変更し **+0/-0 を等値化**(JS の `===` と同じ直感。初学者教材で -0 の判別が必要になることはない)。後方互換(等しくなる組が増えるだけ)
- **循環参照**: 学習者の関数が循環構造を返すと再帰がスタックオーバーフロー(RangeError)していた(catch されるので check 失敗にはなるが、エンジンとして脆い)。比較中ペアの Map/Set で**循環ガード**を実装 — 再入したペアは「等しい」と仮定して打ち切る(矛盾は循環の外側で必ず false になる)。両側が同型の循環なら true
- **深い入れ子**: 再帰深度は「両辺がともにオブジェクトである深さ」= min(depth(a), depth(b)) で抑えられる。期待値(`returns`)は著者が書くリテラルで浅いため、学習者が 100 万段の入れ子を返しても早期に false — **構造的に安全**(テストで 20 万段を検証)。追加のスタック対策は不要と判断

### 3.4 element / attribute / style check — 不正 selector の失敗メッセージ(監査のみ・変更不要)

- 不正な selector(`div[` 等)は `querySelectorAll` が throw → `evaluateWithTimeout` の reject ハンドラで不合格 → メッセージは `check.message ?? defaultMessageFor(check)`。学習者にブラウザの生エラーは出ない — **既定化は機能している**
- 不正 selector は「常に失敗する check」なので、**solution も不合格になり教材 CI ステージ2が必ず検出する**(著者バグはリリース前に落ちる)。node(ステージ1)には selector パーサが無いため静的検証は追加しない

### 3.5 source check — `ignoreComments` オプション(実装)

**問題**: initial のコメントに書いた誘導(「ここに console.log(\"hello\") と書こう」等)へ pattern が誤マッチし、書いていないのに合格する。実教材で 1 件実在(js-11-dom の `use-textcontent` — コメント内の `.textContent` にマッチ)。

**対策**: `SourceCheck` に `ignoreComments?: boolean`(既定 false — 完全後方互換)を追加。true のとき runtime は `stripCommentsForFile(check.file, content)` 後のソースへ pattern を適用する。

- コメント除去は lesson-kit の新設 `strip-comments.ts`(acorn 不使用の軽量ステートマシン — 判定バンドル制約)。JS(`//`・`/* */`、文字列・テンプレートリテラル・補間・**正規表現リテラル**を考慮)/ CSS(`/* */`、文字列考慮)/ HTML(`<!-- -->`、**属性値・raw-text 境界考慮**)
- 置換は「改行保持 + 1 空白」— コメント除去で前後トークンが結合して生まれる偽マッチを防ぎ、行番号も保存
- **正規表現リテラルの追跡(2026-07 強化 / must-fix・再発防止)**: `str.split(/\//)`・`/^\/api\//`・`/[/]/`、文字クラス内に `//` や `/*` を含む `/[a//z]/`・`/[/*]/`、および `class Foo extends /[a//z]/ {}` を `//`・`/*` コメント開始と誤認し、その行の残り(`markDone()`・`z]/ {}` 等の正当なコード)を丸ごと削っていた不具合を修正。学習者が提出する任意コードに対し `ignoreComments:true` の source check が実行されるため、正しいコードが不合格になる実害があった。
  - **判定規則(安全側の非対称性が肝)**: 直前の意味トークンが**明確な値**(識別子非予約語/数値/文字列/テンプレート/正規表現/`]`)なら `/` は除算。それ以外(演算子・`(`・`,`・`=`・式に先行しうる予約語の直後、および**曖昧な `}`・`)`**)は正規表現の開始とみなして走査(`scanJsRegex`。文字クラス `[...]` と `\` エスケープを尊重)し、失敗(改行/未終端/EOF)したら除算にフォールバックする。
  - **なぜ曖昧なら正規表現側か**: 「正規表現を除算と誤判定」は危険(外側ループが正規表現本体に入り、本体の `//`/`/*` を誤検出してコード削除)。「除算を正規表現と誤判定」は安全(`scanJsRegex` が本体を逐語保持し、改行で null を返して除算に自己修正)。よって迷ったら正規表現側に倒す = 「迷ったら削らない」。ただし本物の `//`・`/* */` の検出は除算/正規表現判定より先に効かせるため、明確な値の直後のコメント(`1 / 2; /* c */ x`)は従来どおり除去される
  - **キーワード集合の網羅監査(閉じたクラス — モグラ叩き終了)**: コード削除は「実 regex を除算と誤判定」でのみ起きるが、それは prevWasValue===true(値の後)のときだけで、**JS では値の直後に正規表現が合法に続くことはない**(必ず除算)。識別子形で式に先行しうるのは予約語だけなので、式に先行しうる予約語を網羅すれば value→division 分岐は原理的にコード削除ゼロ。ECMAScript 予約語と突き合わせて確定した集合 = `return / throw / typeof / void / delete / await / yield / new / in / instanceof / of / case / default / do / else / extends`(`if/while/for/switch/with/catch/function/class/const/let/var` 等は直後が必ず `(`・識別子・`{` で regex 位置に `/` が来ないため不要。`this/super/true/false/null` は値なので除算側)。以後キーワードを後追いで足す必要はない
- **HTML の属性値・raw-text 境界(2026-07 強化)**: `<meta content="Use <!-- for legacy">` のように属性値内の `<!--` を誤ってコメント開始と認識し、後続要素までファイル末尾方向へ削っていた不具合を修正。引用符・タグ境界を認識し、`<script>` / `<style>` の中身は raw-text として逐語保持する(`<style><!-- css --></style>` の CSS を削らない)
- 既知の制限(いずれも「コメントを消し残す」安全側の失敗で、コードは決して削らない): (1) **意図的な割り切り** — `{}/re/` や `if(x)/re/` のコード削除を防ぐため曖昧位置直後は安全側として regex に倒す。その副作用で、曖昧位置(`}`・`)`・キーワード・**後置 `++`/`--` 等の演算子的文脈**)直後に**本物の除算**があり同一行に `//`・`/* */` が続く場合(`f() / 2; /* c */ x`・`x++ / 2; // c`)、正規表現とみなした走査がそのコメントを取り込み消し残すことがある(後置 `++`/`--` は `+`/`-` が演算子として直前値の判定を下ろすため `}`/`)` と同じ挙動。`ignoreComments` は元来 best-effort で、コメントが多少残っても pattern 一致には通常無害 — 安全側への劣化)。改行を挟めば `scanJsRegex` が null を返し除算に戻ってコメントは除去される。明確な値の直後は曖昧でないためこの限りでない。(2) インライン `<script>` / `<style>` 内の JS/CSS コメントは除去対象外(HTML コメントのみ)。いずれも誤除去で solution が落ちることはなく、仮に穴が生じてもステージ2が検出する

### 3.6 loop-protect — 再帰爆発対策(評価のみ・実装見送り)

**評価**: ループを含まない無限再帰(`function f(){ f(); } f();` や相互再帰)は instrumentLoops のカウンタ対象外。ただし:

1. **同期の無限再帰はスタックオーバーフロー(RangeError)で数十 ms 以内に自己終了**する — タイムアウトまで暴走しない。エラーはコンソールフック(onerror)が捕捉し、check は通常の不合格に落ちる
2. タイムアウトまで到達しうるのは「再帰 + 巨大アロケーション」等の病的ケースだが、外殻タイムアウト(5000/2000ms)+ 毎回使い捨ての判定 iframe / Worker terminate で回収される
3. 対策として acorn 変換で全関数本体に呼び出しカウンタを注入する案は、(a) アロー関数の式本体のブロック化・getter/setter・generator 等で変換の複雑度と破壊リスクが高い、(b) 正当なホットな関数(再帰の見本レッスン・大量ループからのヘルパ呼び出し)への**偽陽性リスク**がある、(c) 得られる利益は「既に外殻で守られているケースの早期検出」のみ

**結論: リスク > 利益で見送り**。同期再帰はエンジン特性(スタック上限)が実質のガードであり、外殻タイムアウトが最終防衛線 [フェイルセーフ]。

### 3.7 codegen ステージ1 教材リント(実装)

`app/scripts/codegen/validate.ts` の `lintLessonChecks`。**警告のみ**(keep-check 等の正当なケースがあるためビルドは止めない — 決定的な穴の検出はステージ2の initial-must-fail が担う)。`pnpm validate:content` で表示。

| リント | 検出するもの |
|---|---|
| source-only レッスン | fn/console/element/text 等の挙動検証が 1 つもない(source check のみ) |
| pattern が initial のコメント内にだけマッチ | 手つかずで合格する check。`ignoreComments: true` を提案 |
| pattern が initial 本体にマッチ | keep-check(「消すな」系)なら意図どおり、そうでなければ穴 |
| count 未指定 element check のタグが initial に既存 | `<li>` 等が initial にあると「1 個以上」は常に合格。count 指定を提案 |

## 4. 著者向け: 新オプション・新定数

### `ignoreComments: true`(source check)

```ts
// initial: 「// ここに console.log("こんにちは") と書こう」というコメント誘導がある場合
{
  type: "source", id: "use-log", file: "script.js",
  pattern: "console\\.log", ignoreComments: true,   // コメント内のマッチを無視
  message: "console.log で出力しましょう",
}
```

- 使いどころ: initial のコメントに**コードそのものを含む誘導**を書くとき。コメントに書く誘導が自然文だけなら不要
- keep-check(「<!doctype html> を消すな」等、initial に最初からあるコードの維持を検証する check)には付けない — initial にマッチするのが意図どおり
- solution がコメント付きでも、除去は「コメントだけ」なのでコード本体のマッチはそのまま成立する

### `CHECK_TIMEOUT_MS`(lesson-kit limits.ts)

1 check の評価上限 1500ms。custom check の `ctx.wait(ms)` の合計がこれを超えないように書くこと(超えると其の check は不合格扱い)。長い待ちが必要な演出は教材側で分割する。

## 5. 検証結果(2026-07 実施)

- **initial-must-fail 全量**: 101/101 レッスンが「solution 合格 + initial 不合格」を満たす(既存教材に丸ごと穴の空いたレッスンは無かった)
- **検出力の実証(カナリア)**: html-01-first-page の checks を doctype keep-check(initial に既にマッチ)だけへ一時的に弱体化 → `FAIL 1/101`「initial のままで合格してしまいます(check に穴があります)」を正しく検出。solution 側の破壊(パターン誤り)も `solution が不合格: <display.message>` で検出
- **ステージ1リント**: 実教材に対し警告 26 件 → 修正後 24 件。内訳: コメント内のみマッチ 1 件(js-11-dom — 修正済)、source-only レッスン 1 件(html-adv-05-meta — 修正済)、残り 24 件は keep-check / 足場コード検証として**全件監査のうえ意図的と確認**(js-02 の const 足場、js-05 の for 骨格、js-int-07 のお手本 createElement など — いずれも実課題は console / fn / element check が別途検証している)
- **判定バンドル**: 平均 18.9KB / 最大 26.1KB(cap-05-todo-app)。50KB 警告閾値に対し十分な余裕(最大でも約 52%)。strip-comments の正規表現リテラル追跡・HTML 属性値/raw-text 対応の強化と text-diagnosis の指摘文字選定の追加込み(強化前は 17.0/24.2KB)。zod/acorn は従来どおり判定バンドルに含まれない(judge-bundle.ts の metafile 検証が担保)

## 6. 変更ファイル一覧

- `packages/lesson-kit/src/limits.ts` — `CHECK_TIMEOUT_MS` 追加
- `packages/lesson-kit/src/normalize.ts` — deepEqualWithNaN の +0/-0 等値化・循環ガード
- `packages/lesson-kit/src/text-diagnosis.ts` — 新設: `toHalfWidth` / `diagnoseTextZenkaku`(zenkaku.ts は tsconfig.node から型検査されるため types.ts に依存できない — 分離)
- `packages/lesson-kit/src/strip-comments.ts` — 新設(コメント除去。`@codesteps/lesson-kit/strip-comments` で deep import 可)
- `packages/lesson-kit/src/types.ts` / `schemas.ts` — SourceCheck に `ignoreComments?: boolean`(後方互換)
- `app/app/features/judge/runtime/runtime.ts` — per-check タイムアウト・ignoreComments 適用・text 全角診断の差し替え
- `app/scripts/codegen/validate.ts` — ステージ1 教材リント(warnings。ビルド非停止)
- `app/app/routes/dev.validate.tsx` — initial-must-fail 検証 + 並行度 2
- `e2e/tests/content-validation.spec.ts` — 検証内容の拡張とタイムアウト調整
- `content/courses/js-basics/lessons/11-dom/lesson.ts` / `content/courses/html-advanced/lessons/05-meta/lesson.ts` — 弱い check の強化(slug・題材は不変)
