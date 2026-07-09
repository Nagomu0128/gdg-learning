import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "html-08-semantic",
  title: "ページに意味のある区切りを",
  estMinutes: 7,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>わたしのブログ</title>
  </head>
  <body>
    <header>
      <h1>わたしのブログ</h1>
    </header>
    <!-- ここに nav タグを書き、中に a タグのリンクを2つ入れよう -->
    <!-- ここに main タグを書き、中に p タグで記事の文章を書こう -->
    <!-- ここに footer タグを書き、中に p タグで「© わたしのブログ」と書こう -->
  </body>
</html>
`,
    },
  },
  checks: [
    { id: "header-exists", type: "element", selector: "header", count: 1 },
    { id: "nav-exists", type: "element", selector: "nav", count: 1 },
    { id: "main-exists", type: "element", selector: "main", count: 1 },
    { id: "footer-exists", type: "element", selector: "footer", count: 1 },
    {
      id: "nav-links",
      type: "element",
      selector: "nav a",
      count: 2,
      message: "nav の中にリンク(aタグ)を2つ入れましょう",
    },
  ],
  hints: [
    "ページを上から <header>(ページの上部)、<nav>(メニュー)、<main>(本文)、<footer>(ページの下部)の順に区切ります",
    '<nav> の中にはリンクを2つならべます。<a href="#">ホーム</a> のように、href が # のリンクでかまいません',
    '形の例: <nav><a href="#">ホーム</a><a href="#">プロフィール</a></nav> <main><p>記事の文章</p></main> <footer><p>© わたしのブログ</p></footer>',
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>わたしのブログ</title>
  </head>
  <body>
    <header>
      <h1>わたしのブログ</h1>
    </header>
    <nav>
      <a href="#">ホーム</a>
      <a href="#">プロフィール</a>
    </nav>
    <main>
      <p>今日はページの区切りかたを学びました。</p>
    </main>
    <footer>
      <p>© わたしのブログ</p>
    </footer>
  </body>
</html>
`,
  },
});
