import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "react-int-06-derived",
  title: "計算した値を表示",
  estMinutes: 7,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>計算した値を表示</title>
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
      initial: `// 個数(count)から「合計金額」を計算して表示しよう。1個 100 円です。
function App() {
  const [count, setCount] = React.useState(1);
  // ここで count から合計金額(count に 100 を掛けた値)を計算し、total という変数に入れよう
  return (
    <div>
      <p id="count">{count}</p>
      {/* 下の p の {} の中に、計算した合計金額 total を表示しよう */}
      <p id="total"></p>
      <button id="plus" onClick={() => setCount(count + 1)}>
        1個ふやす
      </button>
    </div>
  );
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
      message: '個数を表示する id="count" の要素を表示しましょう',
    },
    {
      type: "element",
      id: "total-rendered",
      selector: "#total",
      count: 1,
      message: '合計金額を表示する id="total" の要素を表示しましょう',
    },
    {
      type: "text",
      id: "count-starts-one",
      selector: "#count",
      equals: "1",
      message: "はじめは #count に「1」が表示されるようにしましょう",
    },
    {
      type: "text",
      id: "total-starts-100",
      selector: "#total",
      equals: "100",
      message: "はじめ(1個)は #total に「100」が表示されるようにしましょう",
    },
    {
      type: "source",
      id: "derived-from-count",
      file: "app.jsx",
      pattern: "count\\s*\\*\\s*100|100\\s*\\*\\s*count",
      message: "合計金額は count から計算しましょう(例: count * 100)。別の state で二重管理しないこと",
    },
    {
      type: "custom",
      id: "total-follows-count",
      message: "「1個ふやす」を押すと count が増え、#total が count × 100 になるようにしましょう",
      run: async (ctx) => {
        const countEl = ctx.document.querySelector("#count");
        const totalEl = ctx.document.querySelector("#total");
        if (countEl === null || totalEl === null) {
          return false;
        }
        const before = Number((countEl.textContent ?? "").trim());
        if (Number.isNaN(before)) {
          return false;
        }
        ctx.fire("#plus", "click");
        await ctx.wait(60);
        const afterCount = Number((countEl.textContent ?? "").trim());
        const afterTotal = Number((totalEl.textContent ?? "").trim());
        return afterCount === before + 1 && afterTotal === afterCount * 100;
      },
    },
  ],
  hints: [
    "合計金額のように「他の state から計算で出せる値」は、state にせず描画のたびに計算します(派生値)",
    "コンポーネントの中で const total = count * 100; と書き、それを表示に使います",
    '<p id="total">{total}</p> のように、計算した total を {} で表示すれば、count が変わるたびに自動で更新されます',
  ],
  solution: {
    "app.jsx": `function App() {
  const [count, setCount] = React.useState(1);
  const total = count * 100;
  return (
    <div>
      <p id="count">{count}</p>
      <p id="total">{total}</p>
      <button id="plus" onClick={() => setCount(count + 1)}>
        1個ふやす
      </button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
`,
  },
});
