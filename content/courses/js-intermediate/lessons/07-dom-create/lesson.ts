import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-int-07-dom-create",
  title: "要素を作って追加",
  estMinutes: 6,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>要素を作って追加</title>
  </head>
  <body>
    <h1>買い物リスト</h1>
    <ul id="list"></ul>
    <script src="script.js"></script>
  </body>
</html>
`,
      editable: false,
    },
    "script.js": {
      initial: `// ul 要素を取得する
const list = document.getElementById("list");

// 1個目: li 要素を作って追加する(お手本)
const item1 = document.createElement("li");
item1.textContent = "りんご";
list.appendChild(item1);

// ここに2個目の li(バナナ)を作って追加しよう

// ここに3個目の li(ぶどう)を作って追加しよう

`,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-createelement",
      file: "script.js",
      pattern: "createElement\\s*\\(\\s*[\"']li[\"']\\s*\\)",
      message: 'document.createElement("li") で li 要素を作りましょう',
    },
    {
      type: "element",
      id: "list-has-three-items",
      selector: "#list li",
      count: 3,
      message: "li 要素を3個にしましょう(お手本の1個に加えて、あと2個追加します)",
    },
    {
      type: "text",
      id: "second-item-text",
      selector: "#list li:nth-child(2)",
      equals: "バナナ",
      message: "2個目の li の中身を「バナナ」にしましょう",
    },
    {
      type: "text",
      id: "third-item-text",
      selector: "#list li:nth-child(3)",
      equals: "ぶどう",
      message: "3個目の li の中身を「ぶどう」にしましょう",
    },
  ],
  hints: [
    "お手本の3行(作る → 文字を入れる → 追加する)をもう1セット書けば、2個目が追加できます。変数名は item2 のように変えましょう",
    'document.createElement("li") で作った要素に textContent で文字を入れ、list.appendChild(要素) でリストに追加します',
    'const item2 = document.createElement("li"); item2.textContent = "バナナ"; list.appendChild(item2); と書きましょう。3個目(ぶどう)も同じ形です',
  ],
  solution: {
    "script.js": `// ul 要素を取得する
const list = document.getElementById("list");

// 1個目: li 要素を作って追加する(お手本)
const item1 = document.createElement("li");
item1.textContent = "りんご";
list.appendChild(item1);

// 2個目: バナナ
const item2 = document.createElement("li");
item2.textContent = "バナナ";
list.appendChild(item2);

// 3個目: ぶどう
const item3 = document.createElement("li");
item3.textContent = "ぶどう";
list.appendChild(item3);
`,
  },
});
