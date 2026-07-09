import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>プロフィールカード</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div class="card">
      <img src="avatar.svg" alt="ハナのアバター" />
      <h1>ヤマダ ハナ</h1>
      <p>コーヒーと猫が好きなデザイナーです。週末は山を歩いています。</p>
      <ul class="tags">
        <li>デザイン</li>
        <li>コーヒー</li>
        <li>登山</li>
      </ul>
    </div>
  </body>
</html>
`;

const initialCss = `body {
  font-family: sans-serif;
  background-color: #f1f5f9;
}

/* ここに .card のルールを書こう
   ・width を 320px に
   ・background-color を #e0f2fe に
   ・padding-top を 24px に(右・下・左の padding も 24px にするとバランスがよい) */

h1 {
  font-size: 20px;
  margin-top: 12px;
  margin-bottom: 4px;
}

.tags {
  list-style: none;
  padding-left: 0;
  margin-top: 16px;
  /* ここに display と column-gap を書いて、タグを 8px あけて横にならべよう */
}

.tags li {
  background-color: #ffffff;
  border: 1px solid #7dd3fc;
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 14px;
}
`;

const solutionCss = `body {
  font-family: sans-serif;
  background-color: #f1f5f9;
}

.card {
  width: 320px;
  background-color: #e0f2fe;
  padding-top: 24px;
  padding-right: 24px;
  padding-bottom: 24px;
  padding-left: 24px;
}

h1 {
  font-size: 20px;
  margin-top: 12px;
  margin-bottom: 4px;
}

.tags {
  list-style: none;
  padding-left: 0;
  margin-top: 16px;
  display: flex;
  column-gap: 8px;
}

.tags li {
  background-color: #ffffff;
  border: 1px solid #7dd3fc;
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 14px;
}
`;

export default defineLesson({
  slug: "css-10-card",
  title: "総合: プロフィールカード",
  estMinutes: 8,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "card-width",
      type: "style",
      selector: ".card",
      property: "width",
      equals: "320px",
    },
    {
      id: "card-background",
      type: "style",
      selector: ".card",
      property: "background-color",
      equals: "#e0f2fe",
    },
    {
      id: "card-padding",
      type: "style",
      selector: ".card",
      property: "padding-top",
      equals: "24px",
    },
    {
      id: "tags-flex",
      type: "style",
      selector: ".tags",
      property: "display",
      equals: "flex",
    },
    {
      id: "tags-gap",
      type: "style",
      selector: ".tags",
      property: "column-gap",
      equals: "8px",
    },
  ],
  hints: [
    "カードの見た目は .card のルールに、タグのならびは .tags のルールに書きます。どれもこれまでのレッスンで学んだプロパティです",
    ".card には width と background-color と padding-top(右・下・左の padding も)を、.tags には display: flex と column-gap を指定します",
    ".card { width: 320px; background-color: #e0f2fe; padding-top: 24px; padding-right: 24px; padding-bottom: 24px; padding-left: 24px; } と、.tags への display: flex; column-gap: 8px; で完成です",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
