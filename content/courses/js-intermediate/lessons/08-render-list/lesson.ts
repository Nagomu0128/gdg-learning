import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-int-08-render-list",
  title: "配列からリスト描画",
  estMinutes: 7,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>配列からリスト描画</title>
  </head>
  <body>
    <h1>今日のメニュー</h1>
    <ul id="menu"></ul>
    <script src="script.js"></script>
  </body>
</html>
`,
      editable: false,
    },
    "script.js": {
      initial: `// メニューのデータ(配列)
const items = ["おにぎり", "みそ汁", "たまご焼き", "お茶"];

// ul 要素を取得する
const menu = document.getElementById("menu");

// ここに for...of のくり返しを書いて、
// items の1つ1つについて li を作り、menu に追加しよう

`,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-loop",
      file: "script.js",
      pattern: "for\\s*\\(|\\.forEach\\s*\\(",
      message: "for...of などのくり返しを使って、配列から li を作りましょう",
    },
    {
      type: "element",
      id: "menu-has-four-items",
      selector: "#menu li",
      count: 4,
      message: "配列の項目の数だけ(4個)li 要素が並ぶようにしましょう",
    },
    {
      type: "text",
      id: "first-item-text",
      selector: "#menu li",
      equals: "おにぎり",
      message: "1個目の li の中身が、配列の1個目「おにぎり」になるようにしましょう",
    },
  ],
  hints: [
    "前のレッスンの「作る → 中身を入れる → 追加する」の3ステップを、配列の項目の数だけくり返します",
    "for (const item of items) { ... } と書くと、配列から1つずつ取り出して item に入れながらくり返せます",
    'くり返しの中で const li = document.createElement("li"); li.textContent = item; menu.appendChild(li); と書きましょう',
  ],
  solution: {
    "script.js": `// メニューのデータ(配列)
const items = ["おにぎり", "みそ汁", "たまご焼き", "お茶"];

// ul 要素を取得する
const menu = document.getElementById("menu");

// 配列から1つずつ取り出して li を作り、追加する
for (const item of items) {
  const li = document.createElement("li");
  li.textContent = item;
  menu.appendChild(li);
}
`,
  },
});
