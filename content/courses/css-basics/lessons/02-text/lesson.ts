import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>としょしつ通信</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>としょしつ通信</h1>
    <p>今月の新しい本がとどきました。</p>
    <p>みなさんの来館をまっています。</p>
  </body>
</html>
`;

const styleCss = `h1 {
  /* ここに、文字の大きさを 40px にする1行を書こう */
}

p {
  /* ここに、文字を中央にそろえる1行を書こう */
}
`;

export default defineLesson({
  slug: "css-02-text",
  title: "文字の大きさとそろえ",
  estMinutes: 4,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: styleCss },
  },
  checks: [
    {
      id: "h1-font-size",
      type: "style",
      selector: "h1",
      property: "font-size",
      equals: "40px",
    },
    {
      id: "p-text-align",
      type: "style",
      selector: "p",
      property: "text-align",
      equals: "center",
    },
  ],
  hints: [
    "文字の大きさは font-size、文字のそろえは text-align というプロパティで変えられます",
    "大きさは font-size: 40px; のように数字と px で、中央ぞろえは text-align: center; と書きます",
    "h1 の { } の中に font-size: 40px; を、p の { } の中に text-align: center; を書けば完成です",
  ],
  solution: {
    "style.css": `h1 {
  font-size: 40px;
}

p {
  text-align: center;
}
`,
  },
});
