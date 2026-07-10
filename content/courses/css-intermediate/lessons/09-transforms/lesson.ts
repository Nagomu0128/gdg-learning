import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>セールのお知らせ</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div class="card">
      <span class="badge">SALE</span>
      <h1>夏の大セール</h1>
      <p>人気の文房具が最大50%オフ。7月20日までの3日間かぎり。</p>
    </div>
  </body>
</html>
`;

const initialCss = `body {
  font-family: sans-serif;
  background-color: #f1f5f9;
}

.card {
  width: 360px;
  background-color: #ffffff;
  border-radius: 12px;
  padding-top: 24px;
  padding-right: 24px;
  padding-bottom: 24px;
  padding-left: 24px;
}

.badge {
  display: inline-block;
  background-color: #dc2626;
  color: #ffffff;
  font-weight: bold;
  padding-top: 4px;
  padding-right: 12px;
  padding-bottom: 4px;
  padding-left: 12px;
  border-radius: 4px;
  /* ここに transform を書いて、rotate(-10deg) でバッジをかたむけよう */
  /* ここに transform-origin: top left; も書いて、左上の角を基準にしよう */
}

h1 {
  font-size: 24px;
  /* ここに transform を書いて、scale(1.2) で見出しを1.2倍にひろげよう */
}
`;

const solutionCss = `body {
  font-family: sans-serif;
  background-color: #f1f5f9;
}

.card {
  width: 360px;
  background-color: #ffffff;
  border-radius: 12px;
  padding-top: 24px;
  padding-right: 24px;
  padding-bottom: 24px;
  padding-left: 24px;
}

.badge {
  display: inline-block;
  background-color: #dc2626;
  color: #ffffff;
  font-weight: bold;
  padding-top: 4px;
  padding-right: 12px;
  padding-bottom: 4px;
  padding-left: 12px;
  border-radius: 4px;
  transform: rotate(-10deg);
  transform-origin: top left;
}

h1 {
  font-size: 24px;
  transform: scale(1.2);
}
`;

// transform の期待値は computed(matrix)同士の比較になるため、期待値も同じ書き方で指定する(CURRICULUM-2)
export default defineLesson({
  slug: "css-int-09-transforms",
  title: "transform で動かす",
  estMinutes: 6,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "badge-rotate",
      type: "style",
      selector: ".badge",
      property: "transform",
      equals: "rotate(-10deg)",
    },
    {
      id: "badge-origin",
      type: "style",
      selector: ".badge",
      property: "transform-origin",
      equals: "top left",
    },
    {
      id: "title-scale",
      type: "style",
      selector: "h1",
      property: "transform",
      equals: "scale(1.2)",
    },
  ],
  hints: [
    "変形は transform プロパティに、rotate() や scale() などの関数の形で書きます。基準点を変えるのは transform-origin です",
    "かたむけるのは transform: rotate(-10deg);(マイナスは反時計回り)、拡大は transform: scale(1.2); です。基準点は transform-origin: top left; で左上になります",
    ".badge に transform: rotate(-10deg); と transform-origin: top left; を、h1 に transform: scale(1.2); を書けば完成です",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
