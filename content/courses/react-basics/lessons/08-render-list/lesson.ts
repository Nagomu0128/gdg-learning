import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "react-08-render-list",
  title: "配列からリスト描画",
  estMinutes: 7,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>配列からリスト描画</title>
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
      initial: `// 配列 fruits から <li> を3つ作って表示しよう
function FruitList() {
  const fruits = ["りんご", "ばなな", "みかん"];
  return (
    <ul id="fruits">
      {/* 配列を map で1つずつ <li> に変換し、それぞれに key を付けよう(key には果物の名前を使う) */}
    </ul>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<FruitList />);
`,
    },
  },
  checks: [
    {
      type: "element",
      id: "li-count",
      selector: "#fruits li",
      count: 3,
      message: "配列 fruits から <li> が3つ表示されるようにしましょう",
    },
    {
      type: "text",
      id: "first-item",
      selector: "#fruits li:first-child",
      equals: "りんご",
      message: "最初の <li> に「りんご」が表示されるようにしましょう",
    },
    {
      type: "text",
      id: "last-item",
      selector: "#fruits li:last-child",
      equals: "みかん",
      message: "最後の <li> に「みかん」が表示されるようにしましょう",
    },
    {
      type: "source",
      id: "use-map",
      file: "app.jsx",
      pattern: "fruits\\.map\\s*\\(",
      message: "配列から要素を作るには fruits.map(...) を使いましょう",
    },
    {
      type: "source",
      id: "use-key",
      file: "app.jsx",
      pattern: "key\\s*=\\s*\\{",
      message: "map で作る <li> には key={fruit} を付けましょう",
    },
  ],
  hints: [
    "配列の map は、1要素ずつ別のものに変換して新しい配列を作ります。ここでは文字列を <li> に変換します",
    "fruits.map((fruit) => <li key={fruit}>{fruit}</li>) と書くと、果物ごとの <li> が並びます",
    '<ul id="fruits"> の中に {fruits.map((fruit) => <li key={fruit}>{fruit}</li>)} を書けば完成です',
  ],
  solution: {
    "app.jsx": `function FruitList() {
  const fruits = ["りんご", "ばなな", "みかん"];
  return (
    <ul id="fruits">
      {fruits.map((fruit) => (
        <li key={fruit}>{fruit}</li>
      ))}
    </ul>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<FruitList />);
`,
  },
});
