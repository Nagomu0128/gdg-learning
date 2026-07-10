import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-int-12-counter",
  title: "総合: カウンター",
  estMinutes: 8,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>カウンター</title>
  </head>
  <body>
    <h1>カウンター</h1>
    <!-- ここに id="count" の表示要素(p など。中身は 0)を書こう -->
    <!-- ここに id="plus" / id="minus" / id="reset" の3つの button を書こう -->
    <script src="script.js"></script>
  </body>
</html>
`,
    },
    "script.js": {
      initial: `// ここにカウンターのプログラムを書こう
// 1. 今の数を let の変数で持つ(はじめは 0)
// 2. 3つのボタンそれぞれに click の処理を登録する
// 3. 数が変わるたびに id="count" の要素の文字を書き換える

`,
    },
  },
  checks: [
    {
      type: "element",
      id: "count-element",
      selector: "#count",
      message: '数を表示する id="count" の要素を書きましょう',
    },
    {
      type: "element",
      id: "plus-button",
      selector: "button#plus",
      message: '+1する id="plus" の button を書きましょう',
    },
    {
      type: "element",
      id: "minus-button",
      selector: "button#minus",
      message: '-1する id="minus" の button を書きましょう',
    },
    {
      type: "element",
      id: "reset-button",
      selector: "button#reset",
      message: '0に戻す id="reset" の button を書きましょう',
    },
    {
      type: "text",
      id: "count-starts-at-zero",
      selector: "#count",
      equals: "0",
      message: "はじめは #count の中身を「0」にしましょう",
    },
    {
      type: "custom",
      id: "plus-increments",
      message: "「+1」ボタンを押すたびに、#count の数が1増えるようにしましょう",
      run: async (ctx) => {
        const count = ctx.document.querySelector("#count");
        if (count === null) {
          return false;
        }
        const before = Number((count.textContent ?? "").trim());
        if (Number.isNaN(before)) {
          return false;
        }
        ctx.fire("#plus", "click");
        await ctx.wait(50);
        return Number((count.textContent ?? "").trim()) === before + 1;
      },
    },
    {
      type: "custom",
      id: "minus-decrements",
      message: "「-1」ボタンを押すと、#count の数が1減るようにしましょう",
      run: async (ctx) => {
        const count = ctx.document.querySelector("#count");
        if (count === null) {
          return false;
        }
        const before = Number((count.textContent ?? "").trim());
        if (Number.isNaN(before)) {
          return false;
        }
        ctx.fire("#minus", "click");
        await ctx.wait(50);
        return Number((count.textContent ?? "").trim()) === before - 1;
      },
    },
    {
      type: "custom",
      id: "reset-returns-to-zero",
      message: "「リセット」ボタンを押すと、#count が 0 に戻るようにしましょう",
      run: async (ctx) => {
        // 何回か増やして 0 でない状態にしてから、リセットで 0 に戻ることを確かめる
        ctx.fire("#plus", "click");
        ctx.fire("#plus", "click");
        await ctx.wait(50);
        ctx.fire("#reset", "click");
        await ctx.wait(50);
        const count = ctx.document.querySelector("#count");
        if (count === null) {
          return false;
        }
        return (count.textContent ?? "").trim() === "0";
      },
    },
  ],
  hints: [
    "数そのものは let count = 0; の変数で持ち、画面の文字はその写しだと考えましょう。どのボタンの処理も「変数を変える → 表示を書き換える」の2段です",
    'HTML には <p id="count">0</p> と、id が plus / minus / reset の3つの <button> を並べます。JS では document.getElementById でそれぞれ取得し、addEventListener("click", ...) を3つ登録します',
    "+1 の処理は count = count + 1; のあとに表示要素の textContent = count; です。-1 は count = count - 1、リセットは count = 0 にして、同じように表示を書き換えます",
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>カウンター</title>
  </head>
  <body>
    <h1>カウンター</h1>
    <p id="count">0</p>
    <button id="plus">+1</button>
    <button id="minus">-1</button>
    <button id="reset">リセット</button>
    <script src="script.js"></script>
  </body>
</html>
`,
    "script.js": `// 今の数を変数で持つ(はじめは 0)
let count = 0;

// 表示する要素
const display = document.getElementById("count");

// 変数の値を画面に反映する
function render() {
  display.textContent = count;
}

// +1 ボタン
document.getElementById("plus").addEventListener("click", () => {
  count = count + 1;
  render();
});

// -1 ボタン
document.getElementById("minus").addEventListener("click", () => {
  count = count - 1;
  render();
});

// リセットボタン
document.getElementById("reset").addEventListener("click", () => {
  count = 0;
  render();
});
`,
  },
});
