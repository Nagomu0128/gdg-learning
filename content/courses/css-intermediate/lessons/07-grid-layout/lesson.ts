import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>マイポートフォリオ</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div class="page">
      <header>マイポートフォリオ</header>
      <nav>メニュー</nav>
      <main>ようこそ。ここに作品紹介がならびます。</main>
      <footer>マイポートフォリオ 2026</footer>
    </div>
  </body>
</html>
`;

const initialCss = `body {
  font-family: sans-serif;
  margin: 0;
}

.page {
  display: grid;
  /* ここに grid-template-columns を書いて、200px 400px の2列にしよう */
  /* ここに grid-template-rows を書いて、60px 240px 60px の3行にしよう */
  column-gap: 8px;
  row-gap: 8px;
}

header {
  background-color: #0369a1;
  color: #ffffff;
  padding-top: 16px;
  padding-left: 16px;
  /* ここに grid-column-start と grid-column-end を書いて、
     ヘッダーを1番の線から3番の線まで横断させよう */
}

nav {
  background-color: #e0f2fe;
  padding-top: 16px;
  padding-left: 16px;
}

main {
  background-color: #f8fafc;
  padding-top: 16px;
  padding-left: 16px;
}

footer {
  background-color: #e2e8f0;
  grid-column-start: 1;
  grid-column-end: 3;
  padding-top: 16px;
  text-align: center;
}
`;

const solutionCss = `body {
  font-family: sans-serif;
  margin: 0;
}

.page {
  display: grid;
  grid-template-columns: 200px 400px;
  grid-template-rows: 60px 240px 60px;
  column-gap: 8px;
  row-gap: 8px;
}

header {
  background-color: #0369a1;
  color: #ffffff;
  padding-top: 16px;
  padding-left: 16px;
  grid-column-start: 1;
  grid-column-end: 3;
}

nav {
  background-color: #e0f2fe;
  padding-top: 16px;
  padding-left: 16px;
}

main {
  background-color: #f8fafc;
  padding-top: 16px;
  padding-left: 16px;
}

footer {
  background-color: #e2e8f0;
  grid-column-start: 1;
  grid-column-end: 3;
  padding-top: 16px;
  text-align: center;
}
`;

export default defineLesson({
  slug: "css-int-07-grid-layout",
  title: "Grid でページレイアウト",
  estMinutes: 7,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "page-display",
      type: "style",
      selector: ".page",
      property: "display",
      equals: "grid",
    },
    {
      id: "page-columns",
      type: "style",
      selector: ".page",
      property: "grid-template-columns",
      equals: "200px 400px",
    },
    {
      id: "page-rows",
      type: "style",
      selector: ".page",
      property: "grid-template-rows",
      equals: "60px 240px 60px",
    },
    {
      id: "header-col-start",
      type: "style",
      selector: "header",
      property: "grid-column-start",
      equals: "1",
    },
    {
      id: "header-col-end",
      type: "style",
      selector: "header",
      property: "grid-column-end",
      equals: "3",
    },
  ],
  hints: [
    "列と行の設計図は親の .page に書きます。ヘッダーの横断は、header 自身に「どの線から始まり、どの線で終わるか」を指定します",
    "行は grid-template-rows: 60px 240px 60px; で3行になります。横断は grid-column-start: 1; と grid-column-end: 3; です(2列のとき、右はしの線は3番)",
    ".page に grid-template-columns: 200px 400px; と grid-template-rows: 60px 240px 60px; を、header に grid-column-start: 1; と grid-column-end: 3; を書けば完成です",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
