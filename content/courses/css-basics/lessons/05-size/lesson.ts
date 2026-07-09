import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>としょかんメンバーカード</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>としょかんメンバーカード</h1>
    <div class="card">
      <p>なまえ: やまだ はなこ</p>
      <p>ばんごう: 0123</p>
    </div>
  </body>
</html>
`;

const styleCss = `.card {
  /* ここに、横はばを 300px、高さを 120px にする2行を書こう */

  /* ここに、背景色を #f0f0f0 にする1行を書こう */
}
`;

export default defineLesson({
  slug: "css-05-size",
  title: "大きさと背景",
  estMinutes: 5,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: styleCss },
  },
  checks: [
    {
      id: "card-width",
      type: "style",
      selector: ".card",
      property: "width",
      equals: "300px",
    },
    {
      id: "card-height",
      type: "style",
      selector: ".card",
      property: "height",
      equals: "120px",
    },
    {
      id: "card-background",
      type: "style",
      selector: ".card",
      property: "background-color",
      equals: "#f0f0f0",
    },
  ],
  hints: [
    "大きさは width(横はば)と height(高さ)、背景の色は background-color のプロパティで指定します",
    "width: 300px; のように「プロパティ: 値;」の形で書きます。背景色の値には #f0f0f0 というカラーコードを使います",
    ".card の中に width: 300px; / height: 120px; / background-color: #f0f0f0; の3行を書けば完成です",
  ],
  solution: {
    "style.css": `.card {
  width: 300px;
  height: 120px;
  background-color: #f0f0f0;
}
`,
  },
});
