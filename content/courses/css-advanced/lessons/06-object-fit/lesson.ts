import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>画像のトリミング</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>旅の思い出アルバム</h1>
    <img class="photo-main" src="mountain.svg" alt="朝焼けの山なみ" />
    <div class="thumbnails">
      <img class="photo" src="tower.svg" alt="展望タワー" />
      <img class="photo" src="beach.svg" alt="夕暮れの海辺" />
      <img class="photo" src="plaza.svg" alt="広場の大きな木" />
    </div>
  </body>
</html>
`;

const initialCss = `body {
  font-family: sans-serif;
}

.photo-main {
  display: block;
  width: 100%;
  /* ここに aspect-ratio: 16 / 9; と object-fit: cover; を書いて、
     ワイドな枠いっぱいに切り抜こう */
}

.thumbnails {
  display: flex;
  column-gap: 16px;
  margin-top: 16px;
}

.photo {
  display: block;
  width: 240px;
  /* ここに aspect-ratio: 3 / 2; と object-fit: cover; を書いて、
     3枚の高さをそろえよう */
}
`;

const solutionCss = `body {
  font-family: sans-serif;
}

.photo-main {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.thumbnails {
  display: flex;
  column-gap: 16px;
  margin-top: 16px;
}

.photo {
  display: block;
  width: 240px;
  aspect-ratio: 3 / 2;
  object-fit: cover;
}
`;

// aspect-ratio / object-fit はどちらも longhand なので style check で判定できる(CURRICULUM-2)。
// aspect-ratio の computed 値は「16 / 9」の形に正規化され、レイアウト(親幅・スクロールバー)に
// 依存しないため、期待値の px 計算は不要で決定的。画像はゆがみが見えるよう
// preserveAspectRatio="none" の SVG(縦長・横長・正方形)を同梱する。
export default defineLesson({
  slug: "css-adv-06-object-fit",
  title: "画像のトリミング",
  estMinutes: 6,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "main-ratio",
      type: "style",
      selector: ".photo-main",
      property: "aspect-ratio",
      equals: "16 / 9",
      message: ".photo-main に aspect-ratio: 16 / 9; を書いて、枠を横 16 : 縦 9 の比率にしましょう",
    },
    {
      id: "main-cover",
      type: "style",
      selector: ".photo-main",
      property: "object-fit",
      equals: "cover",
      message: ".photo-main に object-fit: cover; を書いて、ゆがませずに枠いっぱいへ切り抜きましょう",
    },
    {
      id: "photo-ratio",
      type: "style",
      selector: ".photo",
      property: "aspect-ratio",
      equals: "3 / 2",
      message: ".photo に aspect-ratio: 3 / 2; を書いて、3枚の枠を同じ形にそろえましょう",
    },
    {
      id: "photo-cover",
      type: "style",
      selector: ".photo",
      property: "object-fit",
      equals: "cover",
      message: ".photo に object-fit: cover; を書いて、はみ出す部分を切り抜きましょう",
    },
  ],
  hints: [
    "枠の形は aspect-ratio で決められます。値は「幅 / 高さ」の比率で書き、高さは幅から自動で計算されます(例: aspect-ratio: 16 / 9;)",
    "枠と画像の比率がちがうときの収め方が object-fit です。cover は「比率を保ったまま枠を覆う大きさに広げ、はみ出た部分を切り抜く」です",
    ".photo-main に aspect-ratio: 16 / 9; と object-fit: cover; を、.photo に aspect-ratio: 3 / 2; と object-fit: cover; を書きたせば完成です",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
