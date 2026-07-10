import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>カスタムプロパティ</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>ハナのフォトブログ</h1>
    <p>テーマカラーは1か所で管理する時代です。</p>
    <a class="button" href="https://example.com">最新の記事を読む</a>
  </body>
</html>
`;

const initialCss = `/* ここに :root のルールを書いて、
   --main-color という変数を #2563eb で定義しよう */

body {
  font-family: sans-serif;
}

h1 {
  color: var(--main-color);
}

.button {
  display: inline-block;
  padding: 8px 16px;
  background-color: var(--main-color);
  color: white;
  text-decoration: none;
  border-radius: 6px;
}
`;

const solutionCss = `:root {
  --main-color: #2563eb;
}

body {
  font-family: sans-serif;
}

h1 {
  color: var(--main-color);
}

.button {
  display: inline-block;
  padding: 8px 16px;
  background-color: var(--main-color);
  color: white;
  text-decoration: none;
  border-radius: 6px;
}
`;

export default defineLesson({
  slug: "css-adv-01-variables",
  title: "カスタムプロパティ",
  estMinutes: 5,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "root-rule",
      type: "source",
      file: "style.css",
      pattern: ":root\\s*\\{",
      message: "変数の置き場所になる :root { } のルールを書きましょう",
    },
    {
      id: "define-main-color",
      type: "source",
      file: "style.css",
      pattern: "--main-color\\s*:\\s*#2563[eE][bB]",
      message: ":root の中に --main-color: #2563eb; と書いて変数を定義しましょう",
    },
    {
      id: "h1-color",
      type: "style",
      selector: "h1",
      property: "color",
      equals: "#2563eb",
      message: "h1 の色が #2563eb になっていません。--main-color の定義を見直してみましょう",
    },
    {
      id: "button-background",
      type: "style",
      selector: ".button",
      property: "background-color",
      equals: "#2563eb",
      message: "ボタンの背景色が #2563eb になっていません。--main-color の定義を見直してみましょう",
    },
  ],
  hints: [
    "変数はふつうのプロパティと同じ「名前: 値;」の形で定義します。名前は -- で始め、どこからでも使えるように :root のルールに置きます",
    ":root { --main-color: 色; } の形です。色には #2563eb を指定しましょう",
    "ファイルの先頭に :root { --main-color: #2563eb; } と書けば、h1 と .button の var(--main-color) がこの色に置き換わります",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
