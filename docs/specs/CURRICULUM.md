# CURRICULUM.md — MVP 全32レッスン確定マップ

§2.7 の骨子を具体化した確定カリキュラム。**slug は公開後不変の安定識別子**(§4.1)なので変更禁止。ディレクトリ名は `lessons/{NN}-{topic}/`。course.ts はオーケストレーターが作成済み(変更禁止)。

## 教材著者(G/H/I)共通ルール

- 各レッスン = `lesson.ts` + `slides/01.mdx`〜(3〜5枚)。スライドの最終枚は「やってみよう」(演習の指示の予告)で締める。
- 難度設計(§2.7): 各コース内で「写経(初期コードほぼ完成・1〜2行書く)→ 穴埋め(骨格あり)→ 自力(最小限の骨格)」へ徐々に。各レッスンの指定を下表に示す。
- **instruction**: 演習画面左ペインの手順文は `lesson.ts` に `hints` とは別で持たない — スライド最終枚と checks メッセージが導くため、`files` の初期コード内コメント(`<!-- ここに〜 -->` / `// ここに〜`)で誘導する。
- checks は**上から順に**「存在 → 内容 → 仕上げ」の順で並べる(表示は最初の失敗1件 — §2.1)。id はレッスン内一意の kebab-case。message は既定テンプレで不自然な場合のみ上書き。
- hints は 2〜3 個。ヒント1=考え方、ヒント2=書き方の形、ヒント3=ほぼ答え(§2.4 で 2 失敗ごとに 1 開放)。
- **solution は必ず全 checks に合格すること**(§4.4 ステージ2で機械検証される)。editable な全ファイルを solution に含める。
- HTML の骨格レッスン以外は、`files` の初期コードに `<!doctype html>` 等の骨格を含めてよい(骨格はレッスン1で学習済み)。
- **DOM の暗黙生成に注意**: `html/head/body` は空文書でも DOM に存在する。骨格の検証は `element` ではなく `source` check(pattern)を使う。
- style check の期待値は px / キーワード / 色名・hex のみ(em・% は使わない)。property は longhand のみ(例: `background-color`, `padding-top`, `font-size`, `text-align`, `justify-content`)。
- fn check の対象は **function 宣言**(`function add() {}`)。アロー関数 + const は fn check では検証不可(worker のグローバルに乗らないため)。教材の指示もそう書く。
- console check: `console.log` の出力は複数引数を半角スペース結合した文字列として比較される。期待行は正規化(trim + 連続空白畳み)後の完全一致。
- 全角文字はスライド本文・HTML テキストコンテンツでは自由。**コード例のタグ・記号は必ず半角**。
- 画像アセットは `assets/` サブディレクトリに **SVG(テキスト)** で置く(バイナリ作成禁止)。参照は `<img src="ファイル名">`(相対パス — `<base>` 注入で解決される。§6.1)。
- MDX で使えるもの: 標準 Markdown、コードフェンス(```html / ```css / ```js — Shiki ハイライト)、`<Callout type="info|warn">`(D 提供)。他のコンポーネント・import は禁止。

## html-basics「HTML入門」(course.ts 済)

| # | slug | dir | title | ねらい / checks 骨子 | 型 |
|---|---|---|---|---|---|
| 1 | html-01-first-page | 01-first-page | はじめてのHTML | doctype・html/head/body・title。source: `<!doctype html>`(大小無視)/`<title>`、text: `title` equals「はじめてのページ」、element: `h1` | 写経 |
| 2 | html-02-headings | 02-headings | 見出しと段落 | h1/h2/p。element h1・h2・p(count 2)、text h1 equals「自己紹介」 | 写経 |
| 3 | html-03-links | 03-links | リンクをはろう | a href。element a、attribute a href equals "https://example.com"、text a | 穴埋め |
| 4 | html-04-images | 04-images | 画像をのせよう | img src/alt。assets/cat.svg 同梱。element img、attribute img src equals "cat.svg"、attribute img alt exists | 穴埋め |
| 5 | html-05-lists | 05-lists | リストでならべる | ul/li・ol。element `ul`、element `ul > li` count 3、element `ol > li` count 2(count は厳密一致 — メッセージで「2個」と明示) | 穴埋め |
| 6 | html-06-table | 06-table | 表をつくる | table/tr/th/td。element table、`tr` count 3、`th` count 2、`td` count 4 | 穴埋め |
| 7 | html-07-form | 07-form | フォームの部品 | form/input/button。element form、`form input` + attribute input placeholder exists、element `form button`、text button | 穴埋め |
| 8 | html-08-semantic | 08-semantic | ページに意味のある区切りを | header/nav/main/footer。element 各1 + `nav a` count 2(厳密一致 — メッセージで「2個」と明示) | 穴埋め |
| 9 | html-09-id-class | 09-id-class | idとclass | attribute: `h1` id equals "main-title"、element `.item` count 3、attribute `p.intro` class(existsでなくselectorで判定) | 穴埋め |
| 10 | html-10-profile | 10-profile | 総合: プロフィールページ | h1 + img(alt付) + ul>li 3 + a href。既習の組合せ。初期コードは骨格のみ | 自力 |

## css-basics「CSS入門」(files: index.html は editable:false が基本、style.css を編集)

| # | slug | dir | title | ねらい / checks 骨子 | 型 |
|---|---|---|---|---|---|
| 1 | css-01-color | 01-color | CSSで色をつける | セレクタ構文。style h1 color = red。source: `h1` セレクタ使用 | 写経 |
| 2 | css-02-text | 02-text | 文字の大きさとそろえ | style h1 font-size 40px(32px は h1 の UA 既定値 2em と同値で空検証になるため回避)、style p text-align center | 写経 |
| 3 | css-03-selectors | 03-selectors | クラスとIDのセレクタ | style .highlight background-color yellow、style #title color blue | 穴埋め |
| 4 | css-04-box | 04-box | ボックスモデル | style .box padding-top 16px(等4方向のうち2つ)、border-bottom-width 2px / border-bottom-style solid | 穴埋め |
| 5 | css-05-size | 05-size | 大きさと背景 | style .card width 300px、height 120px?、background-color #f0f0f0 系 | 穴埋め |
| 6 | css-06-display | 06-display | 並べ方を変える display | style li display inline-block、style .hidden display none | 穴埋め |
| 7 | css-07-flex | 07-flex | Flexboxで横にならべる | style .container display flex、justify-content space-between | 穴埋め |
| 8 | css-08-flex-center | 08-flex-center | Flexboxで中央にそろえる | style .container align-items center、flex-direction column? row-gap/column-gap | 穴埋め |
| 9 | css-09-hover | 09-hover | マウスをのせたときの変化 | :hover は computed で判定不可 → source: `a:hover` ブロック + `color` 宣言の pattern。基本状態の style a color も1本 | 穴埋め |
| 10 | css-10-card | 10-card | 総合: プロフィールカード | width / background-color / padding-top / border-top-left-radius系は使わず(shorthand禁止に注意)、display flex 等の組合せ | 自力 |

- css コースの index.html は各レッスンで見栄えする最小構造を editable:false で用意。style.css が editable。
- 色の期待値: 色名(red/blue/yellow)か hex。computed 比較で `rgb()` に解決されるので表記ゆれは吸収される(§5.3)。

## js-basics「JavaScript入門」(files: script.js のみが基本。11・12 は index.html + script.js)

| # | slug | dir | title | ねらい / checks 骨子 | runner | 型 |
|---|---|---|---|---|---|---|
| 1 | js-01-hello | 01-hello | はじめてのJavaScript | console equals ["Hello, World!"] | worker | 写経 |
| 2 | js-02-variables | 02-variables | 変数に入れる | const/let。console ["ぼくの名前はタロウ"]系 + source: `const` 使用 | worker | 写経 |
| 3 | js-03-calc | 03-calc | 計算してみよう | console ["300", "15"]等(数値出力は文字列比較)。source: `*` や `+` | worker | 穴埋め |
| 4 | js-04-if | 4-if→dir 04-if | 条件分岐 if | fn: canEnter(20)→true, canEnter(15)→false(fn check 2本) | worker | 穴埋め |
| 5 | js-05-loop | 05-loop | くり返し for | console ["1","2","3","4","5"] ordered:true。source: `for` | worker | 穴埋め |
| 6 | js-06-function | 06-function | 関数をつくる | fn: add(1,2)→3, add(10,-5)→5 | worker | 穴埋め |
| 7 | js-07-array | 07-array | 配列 | fn: firstItem(["a","b"])→"a"、console 配列 length 出力 | worker | 穴埋め |
| 8 | js-08-object | 08-object | オブジェクト | fn: getName({name:"タロウ",age:12})→"タロウ" | worker | 穴埋め |
| 9 | js-09-array-methods | 09-array-methods | 配列をまとめて処理 | fn: doubleAll([1,2,3])→[2,4,6]。source: `.map(` | worker | 穴埋め |
| 10 | js-10-fizzbuzz | 10-fizzbuzz | 総合: FizzBuzz | fn: fizzbuzz(3)→"Fizz", fizzbuzz(5)→"Buzz", fizzbuzz(15)→"FizzBuzz", fizzbuzz(7)→"7" | worker | 自力 |
| 11 | js-11-dom | 11-dom | DOMをさわってみよう | script.js で `document.getElementById("greeting").textContent = ...`。text #greeting equals、element #greeting | dom | 穴埋め |
| 12 | js-12-events | 12-events | クリックに反応する | custom check: fire("button", "click") → #message の textContent 変化。element button | dom | 自力寄り穴埋め |

- js-04 の dir は `04-if`。
- js コース(worker)の console 数値出力: `console.log(300)` → text は "300"。
- js-12 の custom check は §5.6 の ctx(`fire`/`wait`)を使う。message 必須。
- 総合レッスン(10)の fizzbuzz は「3の倍数はFizz、5の倍数はBuzz、両方はFizzBuzz、それ以外は数値を文字列で返す」。戻り値は文字列で統一。
