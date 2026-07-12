import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "react-10-counter-app",
  title: "総合: カウンター",
  estMinutes: 10,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>総合: カウンター</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="/vendor/react.production.min.js"></script>
    <script src="/vendor/react-dom.production.min.js"></script>
    <script src="app.jsx"></script>
  </body>
</html>
`,
      editable: false,
    },
    "app.jsx": {
      initial: `// カウンターアプリを作ろう!
// 要件:
//  1. React.useState で数(はじめは 0)を state として持つ
//  2. id="count" の要素に今の数を表示する
//  3. id="plus" ボタンで +1、id="minus" ボタンで -1、id="reset" ボタンで 0 に戻す
function App() {
  // ここに useState と return を書こう
  return null;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
`,
    },
  },
  checks: [
    {
      type: "element",
      id: "count-rendered",
      selector: "#count",
      count: 1,
      message: '今の数を表示する id="count" の要素を表示しましょう',
    },
    {
      type: "element",
      id: "plus-rendered",
      selector: "button#plus",
      count: 1,
      message: '+1する id="plus" の button を表示しましょう',
    },
    {
      type: "element",
      id: "minus-rendered",
      selector: "button#minus",
      count: 1,
      message: '-1する id="minus" の button を表示しましょう',
    },
    {
      type: "element",
      id: "reset-rendered",
      selector: "button#reset",
      count: 1,
      message: '0に戻す id="reset" の button を表示しましょう',
    },
    {
      type: "text",
      id: "count-starts-zero",
      selector: "#count",
      equals: "0",
      message: "はじめは #count に「0」が表示されるようにしましょう",
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
      id: "reset-returns-zero",
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
    "数は1つの state で持ちます。const [count, setCount] = React.useState(0); から始めましょう",
    "3つのボタンにそれぞれ onClick を付けます。+1 は setCount(count + 1)、-1 は setCount(count - 1)、リセットは setCount(0) です",
    '表示は <p id="count">{count}</p>。ボタンは id を plus / minus / reset にして、それぞれ onClick で setCount を呼びます。全体は <div> か <> </> で1つにまとめます',
  ],
  solution: {
    "app.jsx": `function App() {
  const [count, setCount] = React.useState(0);
  return (
    <div>
      <p id="count">{count}</p>
      <button id="plus" onClick={() => setCount(count + 1)}>
        +1
      </button>
      <button id="minus" onClick={() => setCount(count - 1)}>
        -1
      </button>
      <button id="reset" onClick={() => setCount(0)}>
        リセット
      </button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
`,
  },
});
