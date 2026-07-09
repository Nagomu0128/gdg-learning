import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>ようこそ</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div class="container">
      <h1>ようこそ!</h1>
      <p>今日から一緒にCSSを学んでいきましょう</p>
      <a class="start" href="#">はじめる</a>
    </div>
  </body>
</html>
`;

const initialCss = `body {
  font-family: sans-serif;
  background-color: #eef2ff;
}

.container {
  height: 280px;
  background-color: #ffffff;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  /* ここに flex-direction、align-items、row-gap を書いて、
     たてならびの中央ぞろえにしよう */
}

h1,
p {
  margin: 0;
}

.start {
  background-color: #4f46e5;
  color: #ffffff;
  padding: 10px 24px;
  border-radius: 8px;
  text-decoration: none;
}
`;

const solutionCss = `body {
  font-family: sans-serif;
  background-color: #eef2ff;
}

.container {
  height: 280px;
  background-color: #ffffff;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  row-gap: 16px;
}

h1,
p {
  margin: 0;
}

.start {
  background-color: #4f46e5;
  color: #ffffff;
  padding: 10px 24px;
  border-radius: 8px;
  text-decoration: none;
}
`;

export default defineLesson({
  slug: "css-08-flex-center",
  title: "Flexboxで中央にそろえる",
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
      id: "container-direction",
      type: "style",
      selector: ".container",
      property: "flex-direction",
      equals: "column",
    },
    {
      id: "container-align",
      type: "style",
      selector: ".container",
      property: "align-items",
      equals: "center",
    },
    {
      id: "container-gap",
      type: "style",
      selector: ".container",
      property: "row-gap",
      equals: "16px",
    },
  ],
  hints: [
    "ならべる向きは flex-direction で変えられます。たてにならべる値は column です",
    "たてならび(column)のとき、align-items: center は横方向の中央ぞろえになります。項目のあいだのすきまは row-gap で空けます",
    ".container に flex-direction: column; align-items: center; row-gap: 16px; の3行を足せば完成です",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
