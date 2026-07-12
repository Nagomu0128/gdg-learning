import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "react-int-09-reducer",
  title: "useReducer で状態管理",
  estMinutes: 9,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>useReducer で状態管理</title>
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
      initial: `// useReducer で +1 / -1 できるカウンターを作ろう。
// reducer は「今の状態(state)とアクション(action)」から「次の状態」を返す関数です。
function reducer(state, action) {
  // action.type が "increment" のときは今より1大きい値、
  // "decrement" のときは1小さい値を返そう。それ以外はそのまま state を返します。
  return state;
}

function App() {
  const [count, dispatch] = React.useReducer(reducer, 0);
  return (
    <div>
      <p id="count">{count}</p>
      <button id="inc" onClick={() => dispatch({ type: "increment" })}>
        +1
      </button>
      <button id="dec" onClick={() => dispatch({ type: "decrement" })}>
        -1
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
      message: '今の数を表示する id="count" の要素を表示しましょう',
    },
    {
      type: "element",
      id: "inc-rendered",
      selector: "button#inc",
      count: 1,
      message: '+1する id="inc" の button を表示しましょう',
    },
    {
      type: "element",
      id: "dec-rendered",
      selector: "button#dec",
      count: 1,
      message: '-1する id="dec" の button を表示しましょう',
    },
    {
      type: "text",
      id: "count-starts-zero",
      selector: "#count",
      equals: "0",
      message: "はじめは #count に「0」が表示されるようにしましょう",
    },
    {
      type: "source",
      id: "use-reducer",
      file: "app.jsx",
      pattern: "useReducer\\s*\\(",
      message: "状態管理には React.useReducer(...) を使いましょう(useState では作り替えないこと)",
    },
    {
      type: "custom",
      id: "increment-action",
      message: '"increment" アクションで #count が1増えるように reducer を書きましょう',
      run: async (ctx) => {
        const count = ctx.document.querySelector("#count");
        if (count === null) {
          return false;
        }
        const before = Number((count.textContent ?? "").trim());
        if (Number.isNaN(before)) {
          return false;
        }
        ctx.fire("#inc", "click");
        await ctx.wait(60);
        return Number((count.textContent ?? "").trim()) === before + 1;
      },
    },
    {
      type: "custom",
      id: "decrement-action",
      message: '"decrement" アクションで #count が1減るように reducer を書きましょう',
      run: async (ctx) => {
        const count = ctx.document.querySelector("#count");
        if (count === null) {
          return false;
        }
        const before = Number((count.textContent ?? "").trim());
        if (Number.isNaN(before)) {
          return false;
        }
        ctx.fire("#dec", "click");
        await ctx.wait(60);
        return Number((count.textContent ?? "").trim()) === before - 1;
      },
    },
  ],
  hints: [
    "useReducer は「状態の更新ルール」を reducer 関数にまとめる仕組みです。dispatch でアクションを送り、reducer が次の状態を返します",
    'reducer の中で action.type を見て分岐します。"increment" なら state + 1、"decrement" なら state - 1 を返します',
    'if (action.type === "increment") return state + 1; と if (action.type === "decrement") return state - 1; を書き、最後に return state; を残せば完成です',
  ],
  solution: {
    "app.jsx": `function reducer(state, action) {
  if (action.type === "increment") {
    return state + 1;
  }
  if (action.type === "decrement") {
    return state - 1;
  }
  return state;
}

function App() {
  const [count, dispatch] = React.useReducer(reducer, 0);
  return (
    <div>
      <p id="count">{count}</p>
      <button id="inc" onClick={() => dispatch({ type: "increment" })}>
        +1
      </button>
      <button id="dec" onClick={() => dispatch({ type: "decrement" })}>
        -1
      </button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
`,
  },
});
