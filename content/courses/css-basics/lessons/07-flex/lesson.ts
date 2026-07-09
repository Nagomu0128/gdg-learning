import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>週末の旅行プラン</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>週末の旅行プランを選ぼう</h1>
    <div class="container">
      <div class="item">山でハイキング</div>
      <div class="item">海でシュノーケル</div>
      <div class="item">街で食べ歩き</div>
    </div>
  </body>
</html>
`;

const initialCss = `body {
  font-family: sans-serif;
}

.container {
  background-color: #e0f2fe;
  padding: 12px;
  /* ここに display と justify-content を書いて、3つのプランを横にならべよう */
}

.item {
  background-color: #ffffff;
  border: 1px solid #7dd3fc;
  border-radius: 8px;
  padding: 16px;
}
`;

const solutionCss = `body {
  font-family: sans-serif;
}

.container {
  background-color: #e0f2fe;
  padding: 12px;
  display: flex;
  justify-content: space-between;
}

.item {
  background-color: #ffffff;
  border: 1px solid #7dd3fc;
  border-radius: 8px;
  padding: 16px;
}
`;

export default defineLesson({
  slug: "css-07-flex",
  title: "Flexboxで横にならべる",
  estMinutes: 6,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "container-flex",
      type: "style",
      selector: ".container",
      property: "display",
      equals: "flex",
    },
    {
      id: "container-justify",
      type: "style",
      selector: ".container",
      property: "justify-content",
      equals: "space-between",
    },
  ],
  hints: [
    "子要素を横にならべたいときは、親要素(.container)に display: flex を指定します",
    "横方向のすきまの空け方は justify-content で決めます。両はしまで広げてならべる値は space-between です",
    ".container のルールに display: flex; と justify-content: space-between; の2行を足せば完成です",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
