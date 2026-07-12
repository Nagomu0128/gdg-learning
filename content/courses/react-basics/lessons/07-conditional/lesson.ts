import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "react-07-conditional",
  title: "条件で表示を変える",
  estMinutes: 7,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>条件で表示を変える</title>
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
      initial: `// ボタンを押すたびに「オン」と「オフ」が切り替わるようにしよう
function Toggle() {
  const [on, setOn] = React.useState(false);
  return (
    <div>
      <button id="toggle" onClick={() => setOn(!on)}>
        切り替え
      </button>
      {/* 下の "オフ" を、on の値で表示を変える三項演算子に書き換えよう:
          on ? "オン" : "オフ" */}
      <p id="status">オフ</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Toggle />);
`,
    },
  },
  checks: [
    {
      type: "element",
      id: "status-rendered",
      selector: "#status",
      count: 1,
      message: '状態を表示する id="status" の要素を表示しましょう',
    },
    {
      type: "text",
      id: "status-starts-off",
      selector: "#status",
      equals: "オフ",
      message: "はじめ(on が false)は #status に「オフ」と表示しましょう",
    },
    {
      type: "custom",
      id: "toggle-switches-text",
      message: "「切り替え」ボタンを押すと、#status が「オン」と「オフ」で切り替わるようにしましょう",
      run: async (ctx) => {
        const status = ctx.document.querySelector("#status");
        if (status === null) {
          return false;
        }
        ctx.fire("#toggle", "click");
        await ctx.wait(50);
        if ((status.textContent ?? "").trim() !== "オン") {
          return false;
        }
        ctx.fire("#toggle", "click");
        await ctx.wait(50);
        return (status.textContent ?? "").trim() === "オフ";
      },
    },
  ],
  hints: [
    "三項演算子は 条件 ? 真のとき : 偽のとき の形です。JSX の中では { } で囲んで使います",
    '{on ? "オン" : "オフ"} と書くと、on が true なら「オン」、false なら「オフ」が表示されます',
    '<p id="status">オフ</p> を <p id="status">{on ? "オン" : "オフ"}</p> に書き換えれば完成です',
  ],
  solution: {
    "app.jsx": `function Toggle() {
  const [on, setOn] = React.useState(false);
  return (
    <div>
      <button id="toggle" onClick={() => setOn(!on)}>
        切り替え
      </button>
      <p id="status">{on ? "オン" : "オフ"}</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Toggle />);
`,
  },
});
