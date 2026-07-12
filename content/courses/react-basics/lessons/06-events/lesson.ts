import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "react-06-events",
  title: "クリックに反応する",
  estMinutes: 7,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>クリックに反応する</title>
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
      initial: `// ボタンを押すと数が1増えるカウンターを完成させよう
function Counter() {
  const [count, setCount] = React.useState(0);
  return (
    <div>
      <p id="count">{count}</p>
      {/* onClick の中身を書き換えて、押すたびに setCount(count + 1) を呼ぼう */}
      <button id="plus" onClick={() => {}}>
        +1
      </button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Counter />);
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
      type: "text",
      id: "count-starts-zero",
      selector: "#count",
      equals: "0",
      message: "はじめは #count に「0」が表示されるようにしましょう",
    },
    {
      type: "custom",
      id: "click-increments",
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
  ],
  hints: [
    "ボタンには onClick={関数} を付けると、押したときにその関数が呼ばれます",
    "数を1増やすには、更新関数 setCount に新しい値を渡します。setCount(count + 1) と書きます",
    "onClick={() => {}} を onClick={() => setCount(count + 1)} に書き換えれば完成です",
  ],
  solution: {
    "app.jsx": `function Counter() {
  const [count, setCount] = React.useState(0);
  return (
    <div>
      <p id="count">{count}</p>
      <button id="plus" onClick={() => setCount(count + 1)}>
        +1
      </button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Counter />);
`,
  },
});
