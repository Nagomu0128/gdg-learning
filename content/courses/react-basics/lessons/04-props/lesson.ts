import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "react-04-props",
  title: "props でデータを渡す",
  estMinutes: 6,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>props でデータを渡す</title>
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
      initial: `// Card は親から渡された props.name を受け取って表示します
function Card(props) {
  // props.name には親から渡された "タロウ" が入っています。
  // 下の「さん」の前に、中かっこで props.name を差し込んで
  // 「ようこそ、タロウさん!」になるようにしよう
  return <h2>ようこそ、さん!</h2>;
}

// App は Card に name="タロウ" を渡しています(そのままでOK)
function App() {
  return <Card name="タロウ" />;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "read-props",
      file: "app.jsx",
      pattern: "\\{\\s*props\\.name\\s*\\}",
      message: "受け取ったデータは {props.name} と書いて表示します",
    },
    {
      type: "element",
      id: "h2-rendered",
      selector: "#root h2",
      count: 1,
      message: "<h2> が表示されるようにしましょう",
    },
    {
      type: "text",
      id: "h2-text",
      selector: "#root h2",
      equals: "ようこそ、タロウさん!",
      message: "<h2> に「ようこそ、タロウさん!」と表示されるようにしましょう",
    },
  ],
  hints: [
    "コンポーネントは props という入れ物で親からデータを受け取ります。渡された name は props.name で読めます",
    "<h2>ようこそ、{props.name}さん!</h2> のように、「さん」の前に {props.name} を差し込みます",
    "return <h2>ようこそ、{props.name}さん!</h2>; と書き換えれば完成です",
  ],
  solution: {
    "app.jsx": `function Card(props) {
  return <h2>ようこそ、{props.name}さん!</h2>;
}

function App() {
  return <Card name="タロウ" />;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
`,
  },
});
