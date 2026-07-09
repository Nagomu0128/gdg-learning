import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>今月のおすすめ図書</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1 id="title">今月のおすすめ図書</h1>
    <p>図書委員が選んだ3冊を紹介します。</p>
    <ul>
      <li>星空の観察ガイド</li>
      <li class="highlight">世界の橋の物語</li>
      <li>はじめての天気図</li>
    </ul>
  </body>
</html>
`;

const styleCss = `/* id セレクタは #、class セレクタは . で始めます */

#title {
  /* ここに、文字色を blue にする1行を書こう */
}

/* この下に .highlight のルールを書いて、背景色を yellow にしよう */
`;

export default defineLesson({
  slug: "css-03-selectors",
  title: "クラスとIDのセレクタ",
  estMinutes: 5,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: styleCss },
  },
  checks: [
    {
      id: "title-color",
      type: "style",
      selector: "#title",
      property: "color",
      equals: "blue",
    },
    {
      id: "highlight-selector",
      type: "source",
      file: "style.css",
      pattern: "\\.highlight\\s*\\{",
      message: "style.css に .highlight のルール(.highlight { ... })を書きましょう",
    },
    {
      id: "highlight-background",
      type: "style",
      selector: ".highlight",
      property: "background-color",
      equals: "yellow",
    },
  ],
  hints: [
    "id には #、class には .(ドット)を先頭につけたセレクタを使います。#title のルールは用意ずみです",
    "背景色のプロパティは background-color です。.highlight { } というルールを新しく書き、その中に指定します",
    "#title { color: blue; } と .highlight { background-color: yellow; } の2つのルールがあれば完成です",
  ],
  solution: {
    "style.css": `#title {
  color: blue;
}

.highlight {
  background-color: yellow;
}
`,
  },
});
