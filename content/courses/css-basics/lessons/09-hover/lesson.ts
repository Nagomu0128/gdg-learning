import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>おすすめリンク集</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>おすすめリンク集</h1>
    <ul>
      <li><a href="https://example.com">はじめてのHTML</a></li>
      <li><a href="https://example.com">CSSデザインの見本帳</a></li>
      <li><a href="https://example.com">プログラミングの歩き方</a></li>
    </ul>
  </body>
</html>
`;

const initialCss = `body {
  font-family: sans-serif;
}

li {
  margin-bottom: 8px;
}

a {
  font-size: 18px;
  /* ここに color を書いて、リンクの色を green にしよう */
}

/* ここに a:hover のルールを書いて、
   マウスをのせたら color が orange に変わるようにしよう */
`;

const solutionCss = `body {
  font-family: sans-serif;
}

li {
  margin-bottom: 8px;
}

a {
  font-size: 18px;
  color: green;
}

a:hover {
  color: orange;
}
`;

// :hover は computed style で判定できないため、a:hover ブロックは source check で見る(CURRICULUM)
export default defineLesson({
  slug: "css-09-hover",
  title: "マウスをのせたときの変化",
  estMinutes: 6,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "a-color",
      type: "style",
      selector: "a",
      property: "color",
      equals: "green",
    },
    {
      id: "hover-rule",
      type: "source",
      file: "style.css",
      pattern: "a:hover\\s*\\{",
      message: "a:hover のルール(マウスをのせたときのスタイル)を書きましょう",
    },
    {
      id: "hover-color",
      type: "source",
      file: "style.css",
      pattern: "a:hover\\s*\\{[^}]*color\\s*:\\s*orange",
      message: "a:hover のルールの中で、color を orange にしましょう",
    },
  ],
  hints: [
    "マウスをのせたときだけ効くスタイルは、セレクタに :hover を付けた別のルールに書きます",
    "ふだんの色は a のルールに、のせたときの色は a:hover のルールに、それぞれ color で指定します",
    "a { color: green; } のあとに a:hover { color: orange; } というルールを書けば完成です",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
