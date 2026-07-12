import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "react-int-07-ref",
  title: "useRef で DOM 参照",
  estMinutes: 7,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>useRef で DOM 参照</title>
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
      initial: `// ボタンを押したら、入力欄(#target)にカーソル(フォーカス)が移るようにしよう
function App() {
  // ここで参照(ref)を作り、下の input に ref でつなごう(参照フックを使います)
  const focusInput = () => {
    // ここで、つないだ input にフォーカスを当てよう(current.focus())
  };
  return (
    <div>
      <input id="target" />
      <button id="focus-btn" onClick={focusInput}>
        入力欄にフォーカス
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
      id: "input-rendered",
      selector: "#target",
      count: 1,
      message: '入力欄 id="target" を表示しましょう',
    },
    {
      type: "element",
      id: "button-rendered",
      selector: "#focus-btn",
      count: 1,
      message: 'ボタン id="focus-btn" を表示しましょう',
    },
    {
      type: "source",
      id: "use-ref",
      file: "app.jsx",
      pattern: "useRef\\s*\\(",
      message: "React.useRef(null) で参照を作りましょう",
    },
    {
      type: "custom",
      id: "button-focuses-input",
      message: "ボタンを押すと入力欄(#target)にフォーカスが移るようにしましょう",
      run: async (ctx) => {
        const input = ctx.document.querySelector("#target");
        if (input === null) {
          return false;
        }
        ctx.fire("#focus-btn", "click");
        await ctx.wait(60);
        return ctx.document.activeElement === input;
      },
    },
  ],
  hints: [
    "画面の DOM 要素そのものを操作したいときは、参照(ref)を使います。ref は React.useRef で作ります",
    "const inputRef = React.useRef(null); で作り、<input ref={inputRef} /> のように ref でつなぎます。つないだ要素は inputRef.current で取れます",
    "focusInput の中で inputRef.current.focus(); を呼び、input に ref={inputRef} を付ければ完成です",
  ],
  solution: {
    "app.jsx": `function App() {
  const inputRef = React.useRef(null);
  const focusInput = () => {
    inputRef.current.focus();
  };
  return (
    <div>
      <input id="target" ref={inputRef} />
      <button id="focus-btn" onClick={focusInput}>
        入力欄にフォーカス
      </button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
`,
  },
});
