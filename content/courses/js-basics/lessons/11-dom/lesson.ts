import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-11-dom",
  title: "DOMをさわってみよう",
  estMinutes: 6,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>DOMをさわってみよう</title>
  </head>
  <body>
    <h1>DOMをさわってみよう</h1>
    <p id="greeting">まだ書き換えられていません</p>
    <script src="script.js"></script>
  </body>
</html>
`,
      editable: false,
    },
    "script.js": {
      initial: `// id が "greeting" の要素を取得する
const greeting = document.getElementById("greeting");

// ここで greeting.textContent を「こんにちは、JavaScript!」に書き換えよう

`,
    },
  },
  checks: [
    { type: "element", id: "greeting-element", selector: "#greeting" },
    {
      type: "source",
      id: "use-getelementbyid",
      file: "script.js",
      pattern: "getElementById\\s*\\(\\s*[\"']greeting[\"']\\s*\\)",
      message: 'document.getElementById("greeting") で要素を取得しましょう',
    },
    {
      type: "source",
      id: "use-textcontent",
      file: "script.js",
      pattern: "\\.textContent",
      // initial のコメント誘導(「ここで greeting.textContent を…」)への誤マッチを防ぐ
      ignoreComments: true,
      message: "取得した要素の textContent に新しい文字を代入しましょう",
    },
    {
      type: "text",
      id: "greeting-text",
      selector: "#greeting",
      equals: "こんにちは、JavaScript!",
    },
  ],
  hints: [
    'document.getElementById("greeting") で取得した要素は、変数 greeting に入っています',
    '要素の文字は「要素.textContent = "新しい文字"」の形で書き換えられます',
    'greeting.textContent = "こんにちは、JavaScript!"; と書きましょう',
  ],
  solution: {
    "script.js": `// id が "greeting" の要素を取得する
const greeting = document.getElementById("greeting");

// textContent で文字を書き換える
greeting.textContent = "こんにちは、JavaScript!";
`,
  },
});
