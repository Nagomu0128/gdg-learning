import { defineLesson } from "@codesteps/lesson-kit";

// CURRICULUM #1(写経): doctype・html/head/body の骨格と title・h1
export default defineLesson({
  slug: "html-01-first-page",
  title: "はじめてのHTML",
  estMinutes: 5,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <!-- ここに title タグで「はじめてのページ」という題名を書こう -->
  </head>
  <body>
    <!-- ここに h1 タグで好きな見出しを書こう -->
  </body>
</html>
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "doctype",
      file: "index.html",
      pattern: "<!doctype\\s+html>",
      flags: "i",
      message: "1行目の <!doctype html> は消さずに残しておきましょう",
    },
    {
      type: "source",
      id: "title-exists",
      file: "index.html",
      pattern: "<title>",
      flags: "i",
      message: "head の中に <title> タグを書きましょう",
    },
    { type: "text", id: "title-text", selector: "title", equals: "はじめてのページ" },
    { type: "element", id: "h1-exists", selector: "h1" },
  ],
  hints: [
    "head の中には「ページの情報」、body の中には「画面に表示される中身」を書きます。題名は title タグ、見出しは h1 タグです",
    "<title>題名</title> を head の中に、<h1>見出し</h1> を body の中に書きます。タグの記号は半角で入力しましょう",
    "head の中に <title>はじめてのページ</title>、body の中に <h1>こんにちは!</h1> と書けば完成です",
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>はじめてのページ</title>
  </head>
  <body>
    <h1>こんにちは!</h1>
  </body>
</html>
`,
  },
});
