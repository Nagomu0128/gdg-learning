import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "react-int-01-effect",
  title: "useEffect で副作用",
  estMinutes: 6,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>useEffect で副作用</title>
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
      initial: `// 画面が最初に表示されたとき(マウント時)に、状態メッセージを出そう
function App() {
  const [message, setMessage] = React.useState("");
  // ここに「マウント時に一度だけ動く副作用」を書いて、message を "読み込み完了" にしよう
  // (副作用フックを使い、依存配列は空 [] にします)
  return <p id="status">{message}</p>;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-effect",
      file: "app.jsx",
      pattern: "useEffect\\s*\\(",
      message: "React.useEffect(...) を使って副作用を書きましょう",
    },
    {
      type: "element",
      id: "status-rendered",
      selector: "#status",
      count: 1,
      message: 'メッセージを表示する id="status" の要素を表示しましょう',
    },
    {
      type: "custom",
      id: "effect-sets-message",
      message: "マウント時に useEffect で #status を「読み込み完了」に変えましょう",
      run: async (ctx) => {
        // 副作用(useEffect)はレンダー後に走るので、少し待ってから確認する
        await ctx.wait(100);
        const status = ctx.document.querySelector("#status");
        if (status === null) {
          return false;
        }
        return (status.textContent ?? "").trim() === "読み込み完了";
      },
    },
  ],
  hints: [
    "副作用(データの読み込みやメッセージ表示など、描画のついでに起こしたい処理)は React.useEffect で書きます",
    "React.useEffect(() => { ... }, []) と書くと、中の処理はマウント時に一度だけ動きます。第2引数の [] が「最初の一度だけ」の合図です",
    'React.useEffect(() => { setMessage("読み込み完了"); }, []); と書けば完成です',
  ],
  solution: {
    "app.jsx": `function App() {
  const [message, setMessage] = React.useState("");
  React.useEffect(() => {
    setMessage("読み込み完了");
  }, []);
  return <p id="status">{message}</p>;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
`,
  },
});
