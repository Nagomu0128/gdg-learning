import { defineLesson } from "@codesteps/lesson-kit";

// 判定ビューポートは 800×600 固定(§6.3)。index.html 側で body の margin を 0 に
// 固定しているため、% の基準(body の幅)は常に 800px になり、calc の結果が決定的になる。
const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>calc() で計算</title>
    <style>
      /* 判定を安定させるための土台(このファイルは編集できません) */
      body {
        margin: 0;
      }
    </style>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div class="banner">
      <h1>夏の写真フェア開催中</h1>
    </div>
    <div class="gallery">
      <div class="gallery-item">写真1</div>
      <div class="gallery-item">写真2</div>
      <div class="gallery-item">写真3</div>
      <div class="gallery-item">写真4</div>
    </div>
  </body>
</html>
`;

const initialCss = `body {
  font-family: sans-serif;
}

.banner {
  margin-left: 20px;
  padding-top: 16px;
  padding-bottom: 16px;
  background-color: #dbeafe;
  text-align: center;
  /* ここに width を書いて、calc を使い「100% から 40px を引いた幅」にしよう */
}

.gallery {
  display: flex;
  margin-top: 16px;
}

.gallery-item {
  height: 80px;
  text-align: center;
  /* ここに width を書いて、calc を使い「100% を 4 で割った幅」にしよう */
}

.gallery-item:nth-child(odd) {
  background-color: #bfdbfe;
}

.gallery-item:nth-child(even) {
  background-color: #60a5fa;
}
`;

const solutionCss = `body {
  font-family: sans-serif;
}

.banner {
  margin-left: 20px;
  padding-top: 16px;
  padding-bottom: 16px;
  background-color: #dbeafe;
  text-align: center;
  width: calc(100% - 40px);
}

.gallery {
  display: flex;
  margin-top: 16px;
}

.gallery-item {
  height: 80px;
  text-align: center;
  width: calc(100% / 4);
}

.gallery-item:nth-child(odd) {
  background-color: #bfdbfe;
}

.gallery-item:nth-child(even) {
  background-color: #60a5fa;
}
`;

export default defineLesson({
  slug: "css-adv-02-calc",
  title: "calc() で計算",
  estMinutes: 6,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "use-calc",
      type: "source",
      file: "style.css",
      pattern: "calc\\(",
      message: "width の値に calc() を使って幅を計算しましょう",
    },
    {
      id: "banner-width",
      type: "style",
      selector: ".banner",
      property: "width",
      equals: "760px",
      message:
        ".banner の幅が 760px(800px - 40px)になっていません。width: calc(100% - 40px); と書きましょう(- の前後の半角スペースを忘れずに)",
    },
    {
      id: "gallery-item-width",
      type: "style",
      selector: ".gallery-item",
      property: "width",
      equals: "200px",
      message: ".gallery-item の幅が 200px(800px ÷ 4)になっていません。width: calc(100% / 4); と書きましょう",
    },
  ],
  hints: [
    "calc() を使うと、% と px のような単位のちがう値どうしでも計算できます。例: width: calc(100% - 40px);",
    "引き算(-)と足し算(+)は、記号の前後に半角スペースが必要です。calc(100%-40px) と詰めて書くと計算されません",
    ".banner には width: calc(100% - 40px); を、.gallery-item には width: calc(100% / 4); を書けば完成です",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
