import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>作品ギャラリー</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>作品ギャラリー</h1>
    <div class="gallery">
      <div class="tile">春</div>
      <div class="tile">夏</div>
      <div class="tile">秋</div>
      <div class="tile">冬</div>
      <div class="tile">朝</div>
      <div class="tile">夜</div>
    </div>
  </body>
</html>
`;

const initialCss = `body {
  font-family: sans-serif;
}

.gallery {
  /* ここに display: grid; と grid-template-columns を書いて、
     100px 200px 100px の3列にならべよう */
  /* つづけて row-gap と column-gap で、ますのあいだを 16px あけよう */
}

.tile {
  background-color: #bae6fd;
  border-radius: 8px;
  padding-top: 24px;
  padding-bottom: 24px;
  text-align: center;
}
`;

const solutionCss = `body {
  font-family: sans-serif;
}

.gallery {
  display: grid;
  grid-template-columns: 100px 200px 100px;
  row-gap: 16px;
  column-gap: 16px;
}

.tile {
  background-color: #bae6fd;
  border-radius: 8px;
  padding-top: 24px;
  padding-bottom: 24px;
  text-align: center;
}
`;

export default defineLesson({
  slug: "css-int-06-grid",
  title: "Grid 入門",
  estMinutes: 6,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "gallery-display",
      type: "style",
      selector: ".gallery",
      property: "display",
      equals: "grid",
    },
    {
      id: "gallery-columns",
      type: "style",
      selector: ".gallery",
      property: "grid-template-columns",
      equals: "100px 200px 100px",
    },
    {
      id: "gallery-row-gap",
      type: "style",
      selector: ".gallery",
      property: "row-gap",
      equals: "16px",
    },
    {
      id: "gallery-column-gap",
      type: "style",
      selector: ".gallery",
      property: "column-gap",
      equals: "16px",
    },
  ],
  hints: [
    "ならべ方の指示は親要素(.gallery)に書きます。display: grid で Grid レイアウトを始めて、grid-template-columns に列の幅を左から順にならべます",
    "grid-template-columns: 100px 200px 100px; のように、幅を半角スペース区切りで書くと3列になります。ますのあいだのすきまは row-gap と column-gap で空けます",
    ".gallery { display: grid; grid-template-columns: 100px 200px 100px; row-gap: 16px; column-gap: 16px; } と書けば完成です",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
