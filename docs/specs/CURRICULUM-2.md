# CURRICULUM-2.md — 中級・上級・応用編の確定カリキュラム(ADR #19)

基礎編(CURRICULUM.md の32レッスン)に続く拡張。**content-common.md と CURRICULUM.md の共通ルールはすべて適用**したうえで、本書のルールを追加する。slug は公開後不変。course.ts はオーケストレーター作成済み(変更禁止)。

## 追加ルール(全著者必読 — サンドボックス制約と決定性)

**使ってよいもの**: DOM 全般 / addEventListener / setTimeout・setInterval(custom check + `wait` で検証、待ち時間は合計 1000ms 以内)/ `<dialog>`(showModal 可)/ `<template>` / `<details>` / CSS アニメーション・transition・transform・Grid・カスタムプロパティ / メディアクエリ(**判定ビューポートは 800×600 固定** — `max-width: 900px` は常にマッチ、`max-width: 700px` は常に非マッチ。これを利用して決定的に検証できる)/ class 構文 / Promise・async/await(タイマーベース)。

**使ってはいけないもの(サンドボックスで動かない・判定が壊れる)**:
- `fetch` / XHR / WebSocket(CSP で遮断)、外部 URL の画像・フォント(アセットは `assets/*.svg` のみ)
- `localStorage` / `sessionStorage` / `document.cookie`(opaque origin で**例外を投げる**)
- ページ遷移・`location` 書き換え・`<a>` の実遷移(href の**属性値**判定のみ可)
- `alert` / `confirm` / `prompt`(sandbox で無視され、想定が狂う)
- **check が乱数・現在時刻に依存すること**: `Math.random()` を使う教材(おみくじ等)は可だが、check は「結果が候補集合のいずれかに変化した」のような**決定的な述語**にする。`new Date()` の値そのものを判定しない
- ES Modules 構文(`import`/`export`)— 合成スクリプトは classic 実行

**check 設計の追加規約**:
- 上級 JS の class 検証: fn check は「クラスを**使う** function 宣言」を対象にする(例: `function greetUser(name) { return new User(name).greet(); }`)。class を直接 fn check しない(new なし呼び出しで throw)
- 非同期 fn check: 戻り値の Promise は runtime が await する。解決までのタイマーは 500ms 以内
- `::before/::after` の検証は computed style check 不可 → `source` check(`content:` 宣言の存在)+ custom check(`getComputedStyle(el, "::before").content`)の併用可
- `transition-*` / `animation-*` は longhand(`transition-duration` 等)なら style check 可
- Grid: `grid-template-columns` は longhand として style check 可(期待値は `100px 200px` のような px 列挙、または `repeat()` を書かせて source check)。`grid-area/-column/-row` は shorthand 禁止リスト — `grid-column-start` 等を使う
- メディアクエリ検証: 「800×600 で適用される側」の値を style check で判定 + `@media` の存在を source check
- タイマー検証: custom check で `fire → wait(300〜600ms) → DOM 述語`。stopwatch 系は「開始→待つ→表示が初期値から変化」「停止→待つ→変化しない」のような**閾値に頼らない**述語にする

## レベル体系(course.ts 作成済み)

| level | コース | slug | order |
|---|---|---|---|
| intermediate | HTML中級 / CSS中級 / JavaScript中級 | html-intermediate / css-intermediate / js-intermediate | 4 / 5 / 6 |
| advanced | HTML上級 / CSS上級 / JavaScript上級 | html-advanced / css-advanced / js-advanced | 7 / 8 / 9 |
| capstone | 応用編: つくってみよう | capstone-projects | 10 |

---

## html-intermediate「HTML中級」(10)— dir 例: lessons/01-sections/

| # | slug | title | ねらい / checks 骨子 | 型 |
|---|---|---|---|---|
| 1 | html-int-01-sections | ページを区画する | section/article/aside。element 各1 + `article h2` | 写経 |
| 2 | html-int-02-outline | 見出しで文書を設計する | h1 は1つ(count 1)、`section h2` count 2、h3 | 穴埋め |
| 3 | html-int-03-links-plus | リンク応用 | ページ内リンク: attribute `a` href equals "#about" + attribute 対象 id。target="_blank" と rel="noopener"(attribute) | 穴埋め |
| 4 | html-int-04-figure | 図版と説明 | figure/figcaption/img(assets/graph.svg)。element figure > img(selector)、text figcaption | 穴埋め |
| 5 | html-int-05-nested-lists | 入れ子リストと説明リスト | `ul ul li`(入れ子)、dl/dt/dd element+count | 穴埋め |
| 6 | html-int-06-table-plus | 表の構造化 | thead/tbody/caption、th scope 属性、colspan(attribute equals "2") | 穴埋め |
| 7 | html-int-07-form-controls | フォーム部品図鑑 | select>option count、textarea、radio 同名2つ(attribute name equals)、label for(attribute) | 穴埋め |
| 8 | html-int-08-form-validation | 入力チェック属性 | required(exists)、type="email"、pattern 属性、maxlength | 穴埋め |
| 9 | html-int-09-a11y | やさしい HTML | img alt、label for、button に aria-label、nav に aria-label(attribute exists/equals) | 穴埋め |
| 10 | html-int-10-blog | 総合: ブログ記事ページ | header/article/aside/footer + figure + 入れ子リスト + ページ内リンクの組合せ(骨格のみ提示) | 自力 |

## css-intermediate「CSS中級」(10)— index.html は editable:false、style.css を編集

| # | slug | title | ねらい / checks 骨子 | 型 |
|---|---|---|---|---|
| 1 | css-int-01-selectors-plus | セレクタ応用 | `ul > li`(子)、`h2 + p`(隣接)、複数セレクタ `h1, h2`。style check で各適用先を判定 | 写経 |
| 2 | css-int-02-specificity | 詳細度とカスケード | class vs 要素の優先。`.note` が p を上書き(style check color)+ source で両宣言存在 | 穴埋め |
| 3 | css-int-03-units | 単位を使い分ける | rem(root 16px 前提: 1.5rem→24px)、%(親 800px 基準)。style check は px 解決値 | 穴埋め |
| 4 | css-int-04-position | position で配置 | relative/absolute の親子。style position、top/left(longhand) | 穴埋め |
| 5 | css-int-05-flex-plus | Flexbox 応用 | flex-grow / flex-basis / order / flex-wrap(全部 longhand) | 穴埋め |
| 6 | css-int-06-grid | Grid 入門 | display grid、grid-template-columns "100px 200px 100px"、row-gap/column-gap | 写経寄り穴埋め |
| 7 | css-int-07-grid-layout | Grid でページレイアウト | grid-column-start/end で横断ヘッダー、grid-template-rows | 穴埋め |
| 8 | css-int-08-transitions | なめらかに変化させる | transition-property/duration(style check)+ a:hover の source check | 穴埋め |
| 9 | css-int-09-transforms | transform で動かす | transform: rotate/scale(computed matrix 同士の比較で判定可 — 期待値も同じ書き方で)+ transform-origin | 穴埋め |
| 10 | css-int-10-hero | 総合: ヒーローセクション | grid or flex + position + transition の組合せで LP 風ヒーロー | 自力 |

## js-intermediate「JavaScript中級」(12)— 1〜6 worker(script.js のみ)、7〜12 dom

| # | slug | title | ねらい / checks 骨子 | runner | 型 |
|---|---|---|---|---|---|
| 1 | js-int-01-functions-plus | 関数式とアロー関数 | fn: double(5)→10(アロー禁止はしないが fn check 対象は function 宣言のラッパでも可 — 教材の書かせ方は「const double = ... を使う function 宣言 calc」ではなく素直に function でアローを内部使用)+ source `=>` | worker | 写経 |
| 2 | js-int-02-scope | スコープを理解する | fn: counterDemo()→[1,2](クロージャ前段)+ source `let` | worker | 穴埋め |
| 3 | js-int-03-filter-find | filter と find | fn: adults([...])→フィルタ結果、findUser | worker | 穴埋め |
| 4 | js-int-04-reduce | reduce で集計 | fn: total([100,200,300])→600、average | worker | 穴埋め |
| 5 | js-int-05-objects-plus | 分割代入とスプレッド | fn: merge({a:1},{b:2})→{a:1,b:2}、source `...` | worker | 穴埋め |
| 6 | js-int-06-strings | 文字列を加工する | fn: initials("Taro Yamada")→"T.Y"、テンプレートリテラル source | worker | 穴埋め |
| 7 | js-int-07-dom-create | 要素を作って追加 | createElement/append。element `#list li` count 3(スクリプトで生成) | dom | 穴埋め |
| 8 | js-int-08-render-list | 配列からリスト描画 | データ配列→ li 生成。element count + text 先頭要素 | dom | 穴埋め |
| 9 | js-int-09-classlist | classList で見た目を切替 | custom: fire click → classList.contains、style check は初期状態 | dom | 穴埋め |
| 10 | js-int-10-input-event | 入力に反応する | custom: input へ値設定+ input イベント dispatch → 表示更新(fire は click 以外に "input" も dispatch 可能) | dom | 穴埋め |
| 11 | js-int-11-timers | タイマーで動かす | custom: fire click → wait(400) → テキスト変化(setTimeout 300ms) | dom | 穴埋め |
| 12 | js-int-12-counter | 総合: カウンター | +/-/リセット3ボタン。custom ×3(増える/減る/0に戻る)+ element | dom | 自力 |

## html-advanced「HTML上級」(10)

| # | slug | title | ねらい / checks 骨子 | 型 |
|---|---|---|---|---|
| 1 | html-adv-01-details | 開閉できる UI | details/summary。element、text summary、custom: fire click → details.open | 写経 |
| 2 | html-adv-02-dialog | dialog とモーダル | element dialog、custom: ボタン fire → dialog.open true(showModal) | 穴埋め |
| 3 | html-adv-03-data-attr | data-* 属性 | attribute `li` data-price exists/equals、JS で dataset 読み(console or text) | 穴埋め |
| 4 | html-adv-04-template | template で複製 | element template、custom: script が template を clone して `#list li` count 3 | 穴埋め |
| 5 | html-adv-05-meta | ページ情報を整える | source: charset/viewport/description(DOM 化で消えないが source で統一) | 写経 |
| 6 | html-adv-06-table-a11y | 表のアクセシビリティ | caption、th scope="col/row"、tfoot | 穴埋め |
| 7 | html-adv-07-fieldset | フォームをグループ化 | fieldset/legend、autocomplete 属性、inputmode | 穴埋め |
| 8 | html-adv-08-srcset | 画像の出し分け | picture/source(media 属性)+ img(assets の svg 2種)。attribute media equals | 穴埋め |
| 9 | html-adv-09-landmarks | ランドマークで案内する | main は1つ、nav/aside/footer + aria-labelledby の対応(attribute equals) | 穴埋め |
| 10 | html-adv-10-product | 総合: 商品詳細ページ | dialog(購入確認)+ details(スペック)+ data-*(価格)+ 表 の組合せ | 自力 |

## css-advanced「CSS上級」(10)

| # | slug | title | ねらい / checks 骨子 | 型 |
|---|---|---|---|---|
| 1 | css-adv-01-variables | カスタムプロパティ | `:root` の --main-color(source)+ 適用先の style check(var() が解決された色) | 写経 |
| 2 | css-adv-02-calc | calc() で計算 | width: calc(100% - 40px) → 800px 親で 760px(style check) | 穴埋め |
| 3 | css-adv-03-media | メディアクエリ | @media (max-width: 900px) 内の宣言が 800×600 で適用される(style check)+ source @media | 穴埋め |
| 4 | css-adv-04-pseudo-elements | ::before / ::after | source `content:` + custom(getComputedStyle(el,"::before").content) | 穴埋め |
| 5 | css-adv-05-keyframes | @keyframes アニメーション | animation-name/duration/iteration-count(longhand style check)+ source @keyframes | 穴埋め |
| 6 | css-adv-06-object-fit | 画像のトリミング | object-fit: cover、aspect-ratio(longhand 扱い可) | 穴埋め |
| 7 | css-adv-07-sticky | 追従ヘッダー | position: sticky + top: 0(style check) | 穴埋め |
| 8 | css-adv-08-z-index | 重なりを制御する | z-index + position(2要素の重なり、custom で elementFromPoint 判定も可) | 穴埋め |
| 9 | css-adv-09-grid-plus | Grid 上級 | repeat()/minmax を書かせる(source)+ 800px 時の computed columns(style check) | 穴埋め |
| 10 | css-adv-10-landing | 総合: レスポンシブ LP | 変数 + grid + sticky + @media の組合せ | 自力 |

## js-advanced「JavaScript上級」(12)— 1〜9 worker、10〜12 dom

| # | slug | title | ねらい / checks 骨子 | runner | 型 |
|---|---|---|---|---|---|
| 1 | js-adv-01-class | クラスを定義する | class User + fn: makeGreeting("タロウ")→"こんにちは、タロウです"(class を使う function) + source `class ` | worker | 写経 |
| 2 | js-adv-02-inheritance | クラスの継承 | class Dog extends Animal + fn: describeDog() + source `extends` | worker | 穴埋め |
| 3 | js-adv-03-closure | クロージャ | fn: makeCounterResult()→[1,2,3](makeCounter を3回呼んだ結果を返す関数) | worker | 穴埋め |
| 4 | js-adv-04-higher-order | 高階関数 | fn: applyTwice(fnを受ける…は structured clone 不可 → 内部定義で結果を返す形: twiceDemo(5)→20)+ source | worker | 穴埋め |
| 5 | js-adv-05-promise | Promise 入門 | fn: delayedValue()→Promise→"done"(await 比較)+ source `new Promise` | worker | 穴埋め |
| 6 | js-adv-06-async-await | async / await | fn: fetchTotal()(async, タイマー2つを await して合算)→300 + source `await` | worker | 穴埋め |
| 7 | js-adv-07-try-catch | エラーに備える | fn: safeParse('{"a":1}')→{a:1} / safeParse("×")→null + source `try` | worker | 穴埋め |
| 8 | js-adv-08-map-set | Map と Set | fn: uniqueCount([1,1,2])→2(Set)、scoreOf(Map 利用) | worker | 穴埋め |
| 9 | js-adv-09-regex | 正規表現入門 | fn: isPostalCode("123-4567")→true / false ケース + source `/\d{3}-\d{4}/` 相当 | worker | 穴埋め |
| 10 | js-adv-10-delegation | イベントデリゲーション | 親 ul に1つの listener。custom: 動的追加した li を fire → 反応 + source で addEventListener が1回 | dom | 穴埋め |
| 11 | js-adv-11-render-state | 状態から描画する | state オブジェクト → render()。custom: fire → state 変化 → 再描画 | dom | 穴埋め |
| 12 | js-adv-12-todo | 総合: TODO リスト | 追加/完了トグル/削除/残数表示。custom ×4 | dom | 自力 |

## capstone-projects「応用編: つくってみよう」(5)— **全レッスン dom / files = index.html + style.css + script.js(全部 editable)**

応用編の思想: **checks は「核となる要件」だけに絞り、見た目や実装方針の自由を最大化する**(多様な解が合格する)。initial はほぼ空の骨格(HTML は doctype+link+script 参照のみ、CSS/JS はコメント1行)。スライドは「完成イメージ(SVG モック)→ 要件 → 進め方のヒント → 自由化の提案」の構成。estMinutes 15〜25。hints は 4〜5 個(設計指針→部分実装例)。

| # | slug | title | 要件(= checks。これ以外は自由) |
|---|---|---|---|
| 1 | cap-01-profile-card | プロフィールカード | `.card` 内に img + h1 + p / .card に background-color と border-radius 系(source)/ ホバー時の変化(source :hover) |
| 2 | cap-02-omikuji | おみくじ | ボタンと結果表示欄 / custom: fire click → `#result` のテキストが候補集合(大吉/中吉/小吉/凶 など教材定義の配列)のいずれかに変化 / 2回押しても集合内(乱数を許容する決定的述語) |
| 3 | cap-03-stopwatch | ストップウォッチ | スタート/ストップ/リセットボタン / custom: スタート → wait(500) → 表示が "0.0" から変化 / ストップ → wait(400) → 変化しない / リセット → "0.0" に戻る |
| 4 | cap-04-quiz | 3問クイズ | 問題データは配列で持つ(source: `[` を含む questions 定義)/ custom: 選択肢 fire → 次の問題 or 結果 / 全問後に `#score` へ点数表示 |
| 5 | cap-05-todo-app | TODO アプリ完全版 | custom: 入力+追加 → li 増加 / 完了トグル(class 変化)/ 削除 / `#count` の残数が追従。エンターキー対応(keydown fire)は任意加点にせず hints で誘導 |

- cap-XX の checks はいずれも **id/class の「契約」だけをスライドで明示**(例:「結果は id="result" の要素に表示してください — 判定がここを見ます」)。それ以外の構造・デザインは自由と明記する
- solution は「シンプルだが見栄えのする」リファレンス実装(過度に凝らない)

## プラットフォーム変更(platform-ui エージェント担当。教材エージェントは触らない)

1. **ファイラー**: 演習画面で `hidden 除外後のファイル数 >= 3` のとき、ファイルタブを**左サイドのファイルツリーペイン**(Progate/VSCode 風)に切替(md 未満は従来タブ)。lock 表示・キーボード操作・`data-testid="file-tree-item-{name}"`
2. **レベル別コース一覧**: content-meta に `level` を追加(codegen)し、/courses と LP と /me をレベルセクション(基礎編/中級編/上級編/応用編)でグループ表示。CourseOverview に level を追加
3. **バッジの自動導出**: course_complete_* を content-meta から動的生成(既存 id は不変)。「levelマスター」バッジ(例: intermediate 全コース修了)は今回スコープ外
4. LP の「全32レッスン」チップ等の数値を動的化
