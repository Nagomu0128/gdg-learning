import { defineLesson } from "@codesteps/lesson-kit";

// CURRICULUM-2 html-advanced #9(穴埋め): main は1つ(count 1)、nav/aside/footer、
// nav の aria-labelledby と見出し id の対応(attribute equals)。
export default defineLesson({
  slug: "html-adv-09-landmarks",
  title: "ランドマークで案内する",
  estMinutes: 7,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>町の図書館</title>
  </head>
  <body>
    <header>
      <h1>町の図書館</h1>
    </header>
    <!-- 1. ここに nav を書こう:
         中の最初に id="menu-title" の h2「メニュー」、
         その下に ul と li で a のリンクを2個(href は "#" でよい)。
         nav 自体には aria-labelledby="menu-title" を付ける -->
    <!-- 2. 下の見出しと段落を main で囲もう(main はページに1つだけ) -->
    <h2>今週のおしらせ</h2>
    <p>日曜日はおはなし会をひらきます。</p>
    <!-- 3. ここに aside を書こう。中は p で「開館時間は 9時から17時です。」 -->
    <!-- 4. ここに footer を書こう。中は p で「町の図書館」 -->
  </body>
</html>
`,
    },
  },
  checks: [
    {
      id: "nav-exists",
      type: "element",
      selector: "nav",
      message: "メニューの部分を nav タグで作りましょう",
    },
    {
      id: "nav-heading",
      type: "element",
      selector: "nav h2",
      message: "nav の中の最初に h2 で「メニュー」の見出しを書きましょう",
    },
    {
      id: "nav-links",
      type: "element",
      selector: "nav a",
      count: 2,
      message: "nav の中に ul と li で a のリンクをちょうど2個ならべましょう",
    },
    {
      id: "nav-heading-id",
      type: "attribute",
      selector: "nav h2",
      name: "id",
      equals: "menu-title",
      message: 'nav の中の h2 に id="menu-title" を付けましょう',
    },
    {
      id: "nav-labelledby",
      type: "attribute",
      selector: "nav",
      name: "aria-labelledby",
      equals: "menu-title",
      message: 'nav に aria-labelledby="menu-title" を付けて、見出しの id と対応させましょう',
    },
    {
      id: "main-only-one",
      type: "element",
      selector: "main",
      count: 1,
      message: "おしらせの見出しと段落を main で囲みましょう(main はページに1つだけです)",
    },
    {
      id: "aside-exists",
      type: "element",
      selector: "aside",
      message: "開館時間のような補足情報は aside で囲みましょう",
    },
    {
      id: "footer-exists",
      type: "element",
      selector: "footer",
      message: "ページの下部情報を footer で書きましょう",
    },
  ],
  hints: [
    "ランドマークは「ページのどの部分が何か」を伝える目印のタグです。nav はメニュー、main は本文(ページに1つだけ)、aside は補足、footer は下部情報です",
    'aria-labelledby は「このランドマークの名前は、この id の見出しです」という対応付けです。<nav aria-labelledby="menu-title"> と、その中の <h2 id="menu-title"> を同じ名前でつなぎます',
    'nav はこう書きます: <nav aria-labelledby="menu-title"><h2 id="menu-title">メニュー</h2><ul><li><a href="#">ほんをさがす</a></li><li><a href="#">りようあんない</a></li></ul></nav>。あとは <main>...</main> で本文を囲み、<aside> と <footer> を足せば完成です',
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>町の図書館</title>
  </head>
  <body>
    <header>
      <h1>町の図書館</h1>
    </header>
    <nav aria-labelledby="menu-title">
      <h2 id="menu-title">メニュー</h2>
      <ul>
        <li><a href="#">ほんをさがす</a></li>
        <li><a href="#">りようあんない</a></li>
      </ul>
    </nav>
    <main>
      <h2>今週のおしらせ</h2>
      <p>日曜日はおはなし会をひらきます。</p>
    </main>
    <aside>
      <p>開館時間は 9時から17時です。</p>
    </aside>
    <footer>
      <p>町の図書館</p>
    </footer>
  </body>
</html>
`,
  },
});
