import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "react-05-state",
  title: "useState で状態を持つ",
  estMinutes: 6,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>useState で状態を持つ</title>
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
      initial: `// Counter は「今の数」を state(状態)として持ちます
function Counter() {
  // 下の const count = 0; の行を、React.useState を使って
  // count と setCount のペアを受け取る形に書き換えよう(初期値は 0)。
  // ※ setCount は次のレッスンで使います
  const count = 0;
  return <p id="count">{count}</p>;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Counter />);
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-state",
      file: "app.jsx",
      pattern: "React\\.useState\\s*\\(\\s*0\\s*\\)",
      message: "React.useState(0) を使って state を宣言しましょう",
    },
    {
      type: "source",
      id: "destructure-state",
      file: "app.jsx",
      pattern: "const\\s*\\[\\s*count\\s*,\\s*setCount\\s*\\]",
      message: "const [count, setCount] = React.useState(0); の形で受け取りましょう",
    },
    {
      type: "element",
      id: "count-rendered",
      selector: "#count",
      count: 1,
      message: '今の数を表示する id="count" の要素を表示しましょう',
    },
    {
      type: "text",
      id: "count-text",
      selector: "#count",
      equals: "0",
      message: "はじめは #count に「0」が表示されるようにしましょう",
    },
  ],
  hints: [
    "state は「変化する値」を React に覚えてもらう仕組みです。React.useState(初期値) で作ります",
    "React.useState(0) は [今の値, 更新する関数] の2つを配列で返します。const [count, setCount] = React.useState(0); と受け取ります",
    "const count = 0; の行を const [count, setCount] = React.useState(0); に書き換えれば完成です",
  ],
  solution: {
    "app.jsx": `function Counter() {
  const [count, setCount] = React.useState(0);
  return <p id="count">{count}</p>;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Counter />);
`,
  },
});
