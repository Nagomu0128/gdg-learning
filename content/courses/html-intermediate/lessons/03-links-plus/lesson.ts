import { defineLesson } from "@codesteps/lesson-kit";

// CURRICULUM-2 html-intermediate #3(穴埋め): ページ内リンク(href="#about" + id)と target="_blank" / rel="noopener"。
// 判定は href の属性値のみ(実遷移は扱わない — §6.1)
export default defineLesson({
  slug: "html-int-03-links-plus",
  title: "リンク応用",
  estMinutes: 7,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>わたしのページ</title>
  </head>
  <body>
    <h1>わたしのページ</h1>
    <nav>
      <!-- この a タグの href 属性を「#about」にして、ページ内リンクにしよう -->
      <a href="">じこしょうかいへ</a>
    </nav>
    <p>ようこそ。このページでは、わたしのことを紹介します。</p>
    <p>上のリンクから、じこしょうかいまでジャンプできるようにします。</p>
    <!-- この section タグに id="about" を付けよう -->
    <section>
      <h2>じこしょうかい</h2>
      <p>こんにちは。タロウです。プログラミングを勉強しています。</p>
      <!-- 下の a タグに target="_blank" と rel="noopener" を付けて、新しいタブで開くようにしよう -->
      <p><a href="https://example.com">すきなサイト</a></p>
    </section>
  </body>
</html>
`,
    },
  },
  checks: [
    {
      type: "attribute",
      id: "nav-link-href",
      selector: "nav a",
      name: "href",
      equals: "#about",
      message: "nav の中の a タグの href 属性を「#about」にしましょう",
    },
    { type: "attribute", id: "section-id", selector: "section", name: "id", equals: "about" },
    {
      type: "attribute",
      id: "external-target",
      selector: "section a",
      name: "target",
      equals: "_blank",
      message: '「すきなサイト」の a タグに target="_blank" を付けましょう',
    },
    {
      type: "attribute",
      id: "external-rel",
      selector: "section a",
      name: "rel",
      equals: "noopener",
      message: '「すきなサイト」の a タグに rel="noopener" を付けましょう',
    },
  ],
  hints: [
    'リンク先が同じページの中にあるときは、href に「#」+ 飛び先の id を書きます。新しいタブで開くリンクには target="_blank" と rel="noopener" をセットで付けます',
    '<a href="#about"> と <section id="about"> のように、href の「#」のうしろと id の値をぴったりそろえます。新しいタブのリンクは <a href="URL" target="_blank" rel="noopener"> の形です',
    'nav の a タグを <a href="#about">じこしょうかいへ</a> に、section を <section id="about"> に、すきなサイトの a タグを <a href="https://example.com" target="_blank" rel="noopener">すきなサイト</a> にすれば完成です',
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>わたしのページ</title>
  </head>
  <body>
    <h1>わたしのページ</h1>
    <nav>
      <a href="#about">じこしょうかいへ</a>
    </nav>
    <p>ようこそ。このページでは、わたしのことを紹介します。</p>
    <p>上のリンクから、じこしょうかいまでジャンプできるようにします。</p>
    <section id="about">
      <h2>じこしょうかい</h2>
      <p>こんにちは。タロウです。プログラミングを勉強しています。</p>
      <p><a href="https://example.com" target="_blank" rel="noopener">すきなサイト</a></p>
    </section>
  </body>
</html>
`,
  },
});
