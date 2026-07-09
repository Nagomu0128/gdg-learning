import { defineLesson } from "@codesteps/lesson-kit";

// CURRICULUM #2(写経): h1/h2/p で自己紹介ページを組み立てる
export default defineLesson({
  slug: "html-02-headings",
  title: "見出しと段落",
  estMinutes: 5,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>自己紹介</title>
  </head>
  <body>
    <!-- ここに h1 タグで「自己紹介」という見出しを書こう -->
    <p>こんにちは。タロウです。</p>
    <!-- ここに h2 タグで「すきなこと」という見出しを書こう -->
    <!-- ここに p タグで、すきなことを紹介する文章を書こう -->
  </body>
</html>
`,
    },
  },
  checks: [
    { type: "element", id: "h1-exists", selector: "h1" },
    { type: "text", id: "h1-text", selector: "h1", equals: "自己紹介" },
    { type: "element", id: "h2-exists", selector: "h2" },
    { type: "element", id: "p-count", selector: "p", count: 2 },
  ],
  hints: [
    "見出しは h1 や h2 タグ、文章のまとまりは p タグで囲みます。h2 は h1 より一段小さい見出しです",
    "<h1>自己紹介</h1> のように、開きタグと閉じタグで文字を囲みます。h2 も p も同じ形です",
    "<h1>自己紹介</h1> と <h2>すきなこと</h2> と <p>すきなことの文章</p> の3行を書き足せば完成です",
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>自己紹介</title>
  </head>
  <body>
    <h1>自己紹介</h1>
    <p>こんにちは。タロウです。</p>
    <h2>すきなこと</h2>
    <p>さんぽとプログラミングがすきです。</p>
  </body>
</html>
`,
  },
});
