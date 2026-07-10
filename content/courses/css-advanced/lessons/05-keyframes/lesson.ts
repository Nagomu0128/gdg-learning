import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>@keyframes アニメーション</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>読み込み中...</h1>
    <div class="loader"></div>
    <p>データを準備しています。そのままお待ちください。</p>
  </body>
</html>
`;

const initialCss = `body {
  font-family: sans-serif;
  text-align: center;
}

.loader {
  width: 40px;
  height: 40px;
  margin: 24px auto;
  border: 4px solid #dbeafe;
  border-top-color: #2563eb;
  border-radius: 50%;
  /* ここに animation-name / animation-duration / animation-iteration-count を書こう */
}

/* ここに @keyframes spin を定義しよう
   from は 0deg、to は 360deg まで transform で回転させる */
`;

const solutionCss = `body {
  font-family: sans-serif;
  text-align: center;
}

.loader {
  width: 40px;
  height: 40px;
  margin: 24px auto;
  border: 4px solid #dbeafe;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation-name: spin;
  animation-duration: 1s;
  animation-iteration-count: infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
`;

// animation-* は longhand なら style check 可(CURRICULUM-2)。checks は transform の
// 現在値(時刻依存)には触れず、animation-* の computed 値と @keyframes の source のみを見る(決定性)。
export default defineLesson({
  slug: "css-adv-05-keyframes",
  title: "@keyframes アニメーション",
  estMinutes: 7,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "keyframes-rule",
      type: "source",
      file: "style.css",
      pattern: "@keyframes\\s+spin\\s*\\{",
      message: "@keyframes spin { } のルールを定義しましょう",
    },
    {
      id: "keyframes-rotate",
      type: "source",
      file: "style.css",
      pattern: "rotate\\(\\s*360deg\\s*\\)",
      message: "to のところに transform: rotate(360deg); を書いて、1回転させましょう",
    },
    {
      id: "loader-animation-name",
      type: "style",
      selector: ".loader",
      property: "animation-name",
      equals: "spin",
      message: ".loader に animation-name: spin; を書いて、定義した動きを割り当てましょう",
    },
    {
      id: "loader-animation-duration",
      type: "style",
      selector: ".loader",
      property: "animation-duration",
      equals: "1s",
      message: ".loader に animation-duration: 1s; を書いて、1周の時間を決めましょう",
    },
    {
      id: "loader-animation-count",
      type: "style",
      selector: ".loader",
      property: "animation-iteration-count",
      equals: "infinite",
      message: ".loader に animation-iteration-count: infinite; を書いて、くり返し回し続けましょう",
    },
  ],
  hints: [
    "アニメーションは2つの部品で作ります。動きの中身を @keyframes 名前 { from { } to { } } で定義し、動かしたい要素に animation-* プロパティで割り当てます",
    ".loader には animation-name: spin;(使う動きの名前)、animation-duration: 1s;(1周の時間)、animation-iteration-count: infinite;(無限にくり返す)の3つを書きます",
    "@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } を定義すれば、円が回り始めます",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
