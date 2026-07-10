import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-int-09-classlist",
  title: "classList で見た目を切替",
  estMinutes: 7,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>classList で見た目を切替</title>
    <style>
      #panel {
        padding: 16px;
        background-color: #e0f0ff;
      }
      .hidden {
        display: none;
      }
    </style>
  </head>
  <body>
    <h1>お知らせパネル</h1>
    <button id="toggle">表示を切り替える</button>
    <p id="panel">今日は晴れ。おでかけ日和です</p>
    <script src="script.js"></script>
  </body>
</html>
`,
      editable: false,
    },
    "script.js": {
      initial: `// ボタンとパネルの要素を取得する
const button = document.getElementById("toggle");
const panel = document.getElementById("panel");

// ここに click イベントの処理を登録して、
// panel の classList で "hidden" クラスを toggle しよう

`,
    },
  },
  checks: [
    {
      type: "style",
      id: "panel-visible-initially",
      selector: "#panel",
      property: "display",
      equals: "block",
      message: "読み込み直後は #panel が表示されたまま(hidden クラスが付いていない状態)にしましょう",
    },
    {
      type: "source",
      id: "use-classlist-toggle",
      file: "script.js",
      pattern: "classList\\s*\\.\\s*toggle\\s*\\(\\s*[\"']hidden[\"']",
      message: 'panel.classList.toggle("hidden") で hidden クラスを付け外ししましょう',
    },
    {
      type: "custom",
      id: "click-hides-panel",
      message: "ボタンを1回押したら、#panel に hidden クラスが付いて非表示になるようにしましょう",
      run: async (ctx) => {
        ctx.fire("#toggle", "click");
        await ctx.wait(50);
        const panel = ctx.document.querySelector("#panel");
        if (panel === null) {
          return false;
        }
        return panel.classList.contains("hidden");
      },
    },
    {
      type: "custom",
      id: "click-shows-panel-again",
      message: "ボタンをもう一度押したら、hidden クラスが外れてパネルが再び表示されるようにしましょう",
      run: async (ctx) => {
        ctx.fire("#toggle", "click");
        await ctx.wait(50);
        const panel = ctx.document.querySelector("#panel");
        if (panel === null) {
          return false;
        }
        return !panel.classList.contains("hidden");
      },
    },
  ],
  hints: [
    'まず button.addEventListener("click", () => { ... }) で、クリックされたときの処理を登録します',
    'クラスの付け外しは panel.classList.toggle("クラス名") が便利です。付いていなければ付け、付いていれば外してくれます',
    'クリックの処理の中に panel.classList.toggle("hidden"); と1行書きましょう',
  ],
  solution: {
    "script.js": `// ボタンとパネルの要素を取得する
const button = document.getElementById("toggle");
const panel = document.getElementById("panel");

// クリックのたびに hidden クラスを付け外しする
button.addEventListener("click", () => {
  panel.classList.toggle("hidden");
});
`,
  },
});
