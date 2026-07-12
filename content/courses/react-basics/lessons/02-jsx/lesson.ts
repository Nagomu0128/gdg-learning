import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "react-02-jsx",
  title: "JSXで書く",
  estMinutes: 5,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>JSXで書く</title>
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
      initial: `// Greeting コンポーネントを完成させよう
function Greeting() {
  const name = "タロウ";
  // return の中で { } を使って name を埋め込み、
  // <h1>こんにちは、タロウさん!</h1> と表示されるようにしよう
  return null;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Greeting />);
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "embed-expression",
      file: "app.jsx",
      pattern: "\\{\\s*name\\s*\\}",
      message: "JSX の中では { } で変数を埋め込めます。{name} と書いてみましょう",
    },
    {
      type: "element",
      id: "h1-rendered",
      selector: "#root h1",
      count: 1,
      message: "画面(#root の中)に <h1> が表示されるようにしましょう",
    },
    {
      type: "text",
      id: "h1-text",
      selector: "#root h1",
      equals: "こんにちは、タロウさん!",
      message: "<h1> に「こんにちは、タロウさん!」と表示されるようにしましょう",
    },
  ],
  hints: [
    "JSX の中で { } を書くと、その中身は JavaScript の式として扱われます。文字列と混ぜて書けます",
    "<h1>こんにちは、{name}さん!</h1> のように、固定の文字と {name} を並べて書きます",
    "return <h1>こんにちは、{name}さん!</h1>; と書き換えれば完成です",
  ],
  solution: {
    "app.jsx": `function Greeting() {
  const name = "タロウ";
  return <h1>こんにちは、{name}さん!</h1>;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Greeting />);
`,
  },
});
