import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "react-int-03-list-add",
  title: "リストに追加する",
  estMinutes: 7,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>リストに追加する</title>
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
      initial: `// ボタンを押すと、果物「バナナ」がリストに増えるようにしよう
function App() {
  const [items, setItems] = React.useState(["りんご", "みかん"]);
  const add = () => {
    // 今の items の末尾に "バナナ" を足した「新しい配列」を作って setItems に渡そう
  };
  return (
    <div>
      <ul id="list">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <button id="add" onClick={add}>
        追加
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
      id: "list-rendered",
      selector: "#list",
      count: 1,
      message: 'リスト全体の id="list" の要素を表示しましょう',
    },
    {
      type: "element",
      id: "items-rendered",
      selector: "#list li",
      count: 2,
      message: "はじめは #list の中に li が2つ(りんご・みかん)表示されるようにしましょう",
    },
    {
      type: "source",
      id: "spread-add",
      file: "app.jsx",
      pattern: "\\.\\.\\.items",
      message: "追加はスプレッド構文([...items, 新しい要素])で新しい配列を作りましょう",
    },
    {
      type: "custom",
      id: "add-appends-item",
      message: "「追加」を押すと li が1つ増え、末尾が「バナナ」になるようにしましょう",
      run: async (ctx) => {
        const list = ctx.document.querySelector("#list");
        if (list === null) {
          return false;
        }
        const before = list.querySelectorAll("li").length;
        ctx.fire("#add", "click");
        await ctx.wait(60);
        const after = list.querySelectorAll("li");
        if (after.length !== before + 1) {
          return false;
        }
        const last = after[after.length - 1];
        return last !== undefined && (last.textContent ?? "").trim() === "バナナ";
      },
    },
  ],
  hints: [
    "配列の state も、直接 push で足すのではなく「新しい配列を作って渡す」のが基本です",
    'スプレッド構文を使うと、今の要素を広げてから新しい要素を足せます。[...items, "バナナ"] の形です',
    'setItems([...items, "バナナ"]); と書けば、末尾に「バナナ」が増えます',
  ],
  solution: {
    "app.jsx": `function App() {
  const [items, setItems] = React.useState(["りんご", "みかん"]);
  const add = () => {
    setItems([...items, "バナナ"]);
  };
  return (
    <div>
      <ul id="list">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <button id="add" onClick={add}>
        追加
      </button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
`,
  },
});
