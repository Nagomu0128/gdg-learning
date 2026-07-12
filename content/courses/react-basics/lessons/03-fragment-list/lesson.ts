import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "react-03-fragment-list",
  title: "複数要素をまとめる",
  estMinutes: 6,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>複数要素をまとめる</title>
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
      initial: `// Menu コンポーネント。<> </>(フラグメント)は複数の要素を1つにまとめます
function Menu() {
  return (
    <>
      <h2>本日のメニュー</h2>
      {/* ここに <> </> の中のもう1つの要素として
          <p>本日のおすすめはコーヒーです</p> を追加しよう */}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Menu />);
`,
    },
  },
  checks: [
    {
      type: "element",
      id: "h2-rendered",
      selector: "#root h2",
      count: 1,
      message: "<h2> の見出しが表示されるようにしましょう",
    },
    {
      type: "text",
      id: "h2-text",
      selector: "#root h2",
      equals: "本日のメニュー",
      message: "<h2> の中身を「本日のメニュー」にしましょう",
    },
    {
      type: "element",
      id: "p-rendered",
      selector: "#root p",
      count: 1,
      message: "<> </> の中に、もう1つの要素として <p> を追加しましょう",
    },
    {
      type: "text",
      id: "p-text",
      selector: "#root p",
      equals: "本日のおすすめはコーヒーです",
      message: "<p> の中身を「本日のおすすめはコーヒーです」にしましょう",
    },
  ],
  hints: [
    "コンポーネントが return できる要素は「1つ」だけです。複数並べたいときは <> と </> で囲んでまとめます",
    "すでにある <h2> のすぐ下、<> </> の内側に <p>本日のおすすめはコーヒーです</p> を書き足します",
    "<> の中に <h2>本日のメニュー</h2> と <p>本日のおすすめはコーヒーです</p> の2つを並べれば完成です",
  ],
  solution: {
    "app.jsx": `function Menu() {
  return (
    <>
      <h2>本日のメニュー</h2>
      <p>本日のおすすめはコーヒーです</p>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Menu />);
`,
  },
});
