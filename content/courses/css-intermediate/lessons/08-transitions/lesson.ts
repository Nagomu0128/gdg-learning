import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>プログラミング勉強会</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>プログラミング勉強会</h1>
    <p>はじめてでも大丈夫。いっしょに手を動かして学びましょう。</p>
    <a href="https://example.com">参加を申し込む</a>
  </body>
</html>
`;

const initialCss = `body {
  font-family: sans-serif;
}

a {
  display: inline-block;
  background-color: #0ea5e9;
  color: #ffffff;
  text-decoration: none;
  padding-top: 12px;
  padding-right: 24px;
  padding-bottom: 12px;
  padding-left: 24px;
  border-radius: 8px;
  /* ここに transition-property と transition-duration を書いて、
     background-color が 0.3s かけて変わるようにしよう */
}

/* ここに a:hover のルールを書いて、
   マウスをのせたら background-color が #0369a1 に変わるようにしよう */
`;

const solutionCss = `body {
  font-family: sans-serif;
}

a {
  display: inline-block;
  background-color: #0ea5e9;
  color: #ffffff;
  text-decoration: none;
  padding-top: 12px;
  padding-right: 24px;
  padding-bottom: 12px;
  padding-left: 24px;
  border-radius: 8px;
  transition-property: background-color;
  transition-duration: 0.3s;
}

a:hover {
  background-color: #0369a1;
}
`;

// :hover 中の computed は判定できないため、a:hover ブロックは source check で見る(css-09 と同じ方針)
export default defineLesson({
  slug: "css-int-08-transitions",
  title: "なめらかに変化させる",
  estMinutes: 6,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "transition-property",
      type: "style",
      selector: "a",
      property: "transition-property",
      equals: "background-color",
    },
    {
      id: "transition-duration",
      type: "style",
      selector: "a",
      property: "transition-duration",
      equals: "0.3s",
    },
    {
      id: "hover-rule",
      type: "source",
      file: "style.css",
      pattern: "a:hover\\s*\\{",
      message: "a:hover のルール(マウスをのせたとき用のスタイル)を書きましょう",
    },
    {
      id: "hover-background",
      type: "source",
      file: "style.css",
      pattern: "a:hover\\s*\\{[^}]*background-color\\s*:\\s*#0369a1",
      flags: "i",
      message: "a:hover のルールの中で、background-color を #0369a1 にしましょう",
    },
  ],
  hints: [
    "なめらかな変化は、ふだんの状態のルール(a)に transition-property と transition-duration を書いておきます。変化後の色は a:hover のルールに書きます",
    "transition-property: background-color; transition-duration: 0.3s; の2行です。時間は s(秒)の単位で書きます",
    "a のルールに transition-property: background-color; transition-duration: 0.3s; を足して、a:hover { background-color: #0369a1; } のルールを書けば完成です",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
