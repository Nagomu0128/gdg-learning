import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>いろどりカフェ</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>いろどりカフェ</h1>
    <p>季節の果物を使ったジュースが人気のお店です。</p>
    <p>今月のおすすめは、いちごとバナナのミックスジュースです。</p>
  </body>
</html>
`;

export default defineLesson({
  slug: "css-01-color",
  title: "CSSで色をつける",
  estMinutes: 4,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": {
      initial: "/* ここに h1 の文字色を red にするCSSを書こう */\n",
    },
  },
  checks: [
    {
      id: "h1-selector",
      type: "source",
      file: "style.css",
      pattern: "h1\\s*\\{",
      flags: "i",
      message: "style.css に h1 のルール(h1 { ... })を書きましょう",
    },
    {
      id: "h1-color",
      type: "style",
      selector: "h1",
      property: "color",
      equals: "red",
    },
  ],
  hints: [
    "CSSは「セレクタ { プロパティ: 値; }」の形で書きます。今回のセレクタは h1 です",
    "文字の色を変えるプロパティは color です。h1 { color: red; } と書くと h1 の文字が赤になります",
  ],
  solution: {
    "style.css": `h1 {
  color: red;
}
`,
  },
});
