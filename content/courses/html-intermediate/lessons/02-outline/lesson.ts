import { defineLesson } from "@codesteps/lesson-kit";

// CURRICULUM-2 html-intermediate #2(穴埋め): h1 は1つ・section h2 ×2・h3 で見出しの階層を設計する
export default defineLesson({
  slug: "html-int-02-outline",
  title: "見出しで文書を設計する",
  estMinutes: 5,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>あさがおの観察日記</title>
  </head>
  <body>
    <h1>あさがおの観察日記</h1>
    <section>
      <h2>育てかた</h2>
      <p>たねをまいて、毎日水をやります。</p>
    </section>
    <section>
      <!-- ここに h2 タグで「観察の記録」という見出しを書こう -->
      <p>成長のようすを記録していきます。</p>
      <!-- ここに h3 タグで「7月の記録」という見出しを書こう -->
      <p>つるがのびて、花がさきはじめました。</p>
    </section>
  </body>
</html>
`,
    },
  },
  checks: [
    { type: "element", id: "section-count", selector: "section", count: 2 },
    {
      type: "element",
      id: "h1-single",
      selector: "h1",
      count: 1,
      message: "h1 の見出しはページに1つだけにしましょう",
    },
    {
      type: "element",
      id: "section-h2-count",
      selector: "section h2",
      count: 2,
      message: "section の中の h2 を合計2個にしましょう",
    },
    { type: "element", id: "h3-exists", selector: "h3" },
  ],
  hints: [
    "見出しは h1 → h2 → h3 の順に階層を作ります。h1 はページ全体のタイトルなので1ページに1つだけ、章の見出しは h2、章の中の小見出しは h3 です",
    "2つ目の section の中に h2 を1つ、そのあとに h3 を1つ書き足します。<h2>観察の記録</h2> と <h3>7月の記録</h3> の形です",
    "コメントのある場所に <h2>観察の記録</h2> と <h3>7月の記録</h3> を書けば完成です",
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>あさがおの観察日記</title>
  </head>
  <body>
    <h1>あさがおの観察日記</h1>
    <section>
      <h2>育てかた</h2>
      <p>たねをまいて、毎日水をやります。</p>
    </section>
    <section>
      <h2>観察の記録</h2>
      <p>成長のようすを記録していきます。</p>
      <h3>7月の記録</h3>
      <p>つるがのびて、花がさきはじめました。</p>
    </section>
  </body>
</html>
`,
  },
});
