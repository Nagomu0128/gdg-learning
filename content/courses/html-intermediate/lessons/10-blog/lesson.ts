import { defineLesson } from "@codesteps/lesson-kit";

// CURRICULUM-2 html-intermediate #10(自力): 総合 — header/article/aside/footer + figure + 入れ子リスト + ページ内リンクの組合せ。初期コードは骨格のみ
export default defineLesson({
  slug: "html-int-10-blog",
  title: "総合: ブログ記事ページ",
  estMinutes: 8,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>タロウのブログ</title>
  </head>
  <body>
    <!-- ここにブログ記事ページを自力で作ろう -->
    <!-- 1. header — 中に h1(ブログ名)と、記事へ飛ぶ a(href="#today")を入れる -->
    <!-- 2. article — id="today" を付け、中に h2(記事の見出し)と p(本文)を書く -->
    <!-- 3. article の中に figure — img(photo.svg、alt 付き)と figcaption を入れる -->
    <!-- 4. article の中に ul — 項目の1つに入れ子の ul(li 2個)を入れる -->
    <!-- 5. aside — 記事の補足やお知らせを書く -->
    <!-- 6. footer — ページの最後のしめくくりを書く -->
  </body>
</html>
`,
    },
  },
  checks: [
    { id: "header-exists", type: "element", selector: "header", count: 1 },
    {
      id: "jump-link",
      type: "attribute",
      selector: "header a",
      name: "href",
      equals: "#today",
      message: "header の中の a タグの href 属性を「#today」にしましょう",
    },
    { id: "article-exists", type: "element", selector: "article", count: 1 },
    {
      id: "article-id",
      type: "attribute",
      selector: "article",
      name: "id",
      equals: "today",
      message: 'article タグに id="today" を付けて、リンクの飛び先にしましょう',
    },
    {
      id: "article-heading",
      type: "element",
      selector: "article h2",
      message: "article の中に h2 で記事の見出しを書きましょう",
    },
    {
      id: "figure-img",
      type: "element",
      selector: "figure > img",
      message: "figure タグの中に img タグを入れましょう",
    },
    {
      id: "img-src",
      type: "attribute",
      selector: "figure > img",
      name: "src",
      equals: "photo.svg",
      message: "img の src 属性を「photo.svg」にしましょう",
    },
    {
      id: "img-alt",
      type: "attribute",
      selector: "figure > img",
      name: "alt",
      exists: true,
      message: "img に alt 属性(画像の内容の説明)を付けましょう",
    },
    {
      id: "figcaption-exists",
      type: "element",
      selector: "figure figcaption",
      message: "figure の中に figcaption で図の説明文を書きましょう",
    },
    {
      id: "nested-list",
      type: "element",
      selector: "ul ul li",
      count: 2,
      message: "リストの項目の1つに入れ子の ul を書き、その中に li を2個入れましょう",
    },
    { id: "aside-exists", type: "element", selector: "aside", count: 1 },
    { id: "footer-exists", type: "element", selector: "footer", count: 1 },
  ],
  hints: [
    "まずページの大わくを上から順に書きましょう。header(ブログ名とリンク)、article(記事本文)、aside(補足)、footer の4つです。そのあと article の中身(h2・p・figure・リスト)をうめていくと迷いません。ページ内リンクは、a の href の「#」のうしろと飛び先の id の値をそろえるのでした",
    'header は <header><h1>ブログ名</h1><a href="#today">きょうの記事へ</a></header>、記事は <article id="today"> ではじめます。figure は <figure><img src="photo.svg" alt="画像の説明"><figcaption>図1: 説明</figcaption></figure>、入れ子リストは li の閉じタグの前に <ul><li>項目</li><li>項目</li></ul> を入れる形です',
    'body の中に、<header><h1>タロウのブログ</h1><a href="#today">きょうの記事へジャンプ</a></header>、<article id="today"><h2>休日のパンケーキ作り</h2><p>本文の文章</p><figure><img src="photo.svg" alt="お皿にのったパンケーキ"><figcaption>図1: 焼きあがったパンケーキ</figcaption></figure><ul><li>ホットケーキミックス</li><li>トッピング<ul><li>はちみつ</li><li>バター</li></ul></li></ul></article>、<aside><p>関連記事: はじめてのクッキー作り</p></aside>、<footer><p>タロウのブログ</p></footer> の順にならべれば完成です',
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>タロウのブログ</title>
  </head>
  <body>
    <header>
      <h1>タロウのブログ</h1>
      <a href="#today">きょうの記事へジャンプ</a>
    </header>
    <article id="today">
      <h2>休日のパンケーキ作り</h2>
      <p>きょうは家族でパンケーキを作りました。ふわふわに焼けて大成功です。</p>
      <figure>
        <img src="photo.svg" alt="お皿にのったパンケーキ">
        <figcaption>図1: 焼きあがったパンケーキ</figcaption>
      </figure>
      <h3>用意したもの</h3>
      <ul>
        <li>ホットケーキミックス</li>
        <li>トッピング
          <ul>
            <li>はちみつ</li>
            <li>バター</li>
          </ul>
        </li>
      </ul>
    </article>
    <aside>
      <p>関連記事: はじめてのクッキー作り</p>
    </aside>
    <footer>
      <p>タロウのブログ</p>
    </footer>
  </body>
</html>
`,
  },
});
