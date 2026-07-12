import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "react-int-04-list-remove",
  title: "リストから削除する",
  estMinutes: 7,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>リストから削除する</title>
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
      initial: `// 各行の「削除」ボタンで、その果物だけをリストから消せるようにしよう
function App() {
  const [items, setItems] = React.useState(["りんご", "みかん", "バナナ"]);
  const remove = (target) => {
    // filter を使って、target と一致しない要素だけの新しい配列を作り setItems に渡そう
  };
  return (
    <ul id="list">
      {items.map((item, i) => (
        <li key={i}>
          <span>{item}</span>
          <button className="remove" onClick={() => remove(item)}>
            削除
          </button>
        </li>
      ))}
    </ul>
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
      id: "items-rendered",
      selector: "#list li",
      count: 3,
      message: "はじめは #list の中に li が3つ表示されるようにしましょう",
    },
    {
      type: "source",
      id: "use-filter",
      file: "app.jsx",
      pattern: "\\.filter\\s*\\(",
      message: "削除は filter で「残す要素だけ」の新しい配列を作りましょう",
    },
    {
      type: "custom",
      id: "remove-deletes-item",
      message: "「削除」を押すと、その行の li が消えて数が1つ減るようにしましょう",
      run: async (ctx) => {
        const list = ctx.document.querySelector("#list");
        if (list === null) {
          return false;
        }
        const before = list.querySelectorAll("li").length;
        if (before === 0) {
          return false;
        }
        ctx.fire(".remove", "click");
        await ctx.wait(60);
        return list.querySelectorAll("li").length === before - 1;
      },
    },
  ],
  hints: [
    "削除は「消したい要素を抜く」のではなく「残す要素だけを集める」と考えます。ここで使うのが filter です",
    "filter は条件が true の要素だけを集めた新しい配列を返します。target 以外を残すには item !== target を条件にします",
    "setItems(items.filter((item) => item !== target)); と書けば、押した行だけが消えます",
  ],
  solution: {
    "app.jsx": `function App() {
  const [items, setItems] = React.useState(["りんご", "みかん", "バナナ"]);
  const remove = (target) => {
    setItems(items.filter((item) => item !== target));
  };
  return (
    <ul id="list">
      {items.map((item, i) => (
        <li key={i}>
          <span>{item}</span>
          <button className="remove" onClick={() => remove(item)}>
            削除
          </button>
        </li>
      ))}
    </ul>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
`,
  },
});
