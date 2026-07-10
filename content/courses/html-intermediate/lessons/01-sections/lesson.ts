import { defineLesson } from "@codesteps/lesson-kit";

// CURRICULUM-2 html-intermediate #1(写経): section / article / aside でページを区画する
export default defineLesson({
  slug: "html-int-01-sections",
  title: "ページを区画する",
  estMinutes: 5,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>今日のニュース</title>
  </head>
  <body>
    <h1>今日のニュース</h1>
    <section>
      <!-- ここに article タグを書き、中に h2(記事の見出し)と p(記事の本文)を入れよう -->
    </section>
    <!-- ここに aside タグを書き、中に p タグでお知らせを1行書こう -->
  </body>
</html>
`,
    },
  },
  checks: [
    { type: "element", id: "section-exists", selector: "section", count: 1 },
    { type: "element", id: "article-exists", selector: "article", count: 1 },
    {
      type: "element",
      id: "article-h2",
      selector: "article h2",
      message: "article の中に h2 で記事の見出しを書きましょう",
    },
    { type: "element", id: "aside-exists", selector: "aside", count: 1 },
  ],
  hints: [
    "ページのテーマごとのまとまりは section、それだけで1つの読みものになるまとまりは article、本筋から少し外れた補足は aside で囲みます",
    "section の中に <article><h2>見出し</h2><p>本文</p></article> の形で記事を入れ、section の下(外側)に <aside><p>お知らせ</p></aside> を書きます",
    "section の中に <article><h2>公園の桜が満開になりました</h2><p>駅前の公園は、桜を見に来た人でにぎわっています。</p></article> を、section の下に <aside><p>お知らせ: あすは雨の予報です。</p></aside> を書けば完成です",
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>今日のニュース</title>
  </head>
  <body>
    <h1>今日のニュース</h1>
    <section>
      <article>
        <h2>公園の桜が満開になりました</h2>
        <p>駅前の公園は、桜を見に来た人でにぎわっています。</p>
      </article>
    </section>
    <aside>
      <p>お知らせ: あすは雨の予報です。</p>
    </aside>
  </body>
</html>
`,
  },
});
