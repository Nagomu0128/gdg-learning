import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "react-int-05-callback-props",
  title: "関数を子に渡す",
  estMinutes: 8,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>関数を子に渡す</title>
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
      initial: `// 子 AddButton は「押されたら props.onAdd を呼ぶ」だけ(このままでOK)
function AddButton(props) {
  return (
    <button id="child-btn" onClick={props.onAdd}>
      ポイント追加
    </button>
  );
}

// 親 App がポイントを管理します
function App() {
  const [points, setPoints] = React.useState(0);
  return (
    <div>
      <p id="points">{points}</p>
      {/* AddButton に、props の名前を onAdd にして「points を1増やす関数」を渡そう */}
      <AddButton />
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
      id: "points-rendered",
      selector: "#points",
      count: 1,
      message: 'ポイントを表示する id="points" の要素を表示しましょう',
    },
    {
      type: "element",
      id: "child-button-rendered",
      selector: "#child-btn",
      count: 1,
      message: "子コンポーネントのボタン(#child-btn)が表示されるようにしましょう",
    },
    {
      type: "text",
      id: "points-starts-zero",
      selector: "#points",
      equals: "0",
      message: "はじめは #points に「0」が表示されるようにしましょう",
    },
    {
      type: "source",
      id: "pass-callback",
      file: "app.jsx",
      pattern: "onAdd\\s*=\\s*\\{",
      message: "AddButton に onAdd={...} の形で関数を渡しましょう",
    },
    {
      type: "custom",
      id: "child-click-updates-parent",
      message: "子ボタン(#child-btn)を押すと、親の #points が1増えるようにしましょう",
      run: async (ctx) => {
        const points = ctx.document.querySelector("#points");
        if (points === null) {
          return false;
        }
        const before = Number((points.textContent ?? "").trim());
        if (Number.isNaN(before)) {
          return false;
        }
        ctx.fire("#child-btn", "click");
        await ctx.wait(60);
        return Number((points.textContent ?? "").trim()) === before + 1;
      },
    },
  ],
  hints: [
    "親から子へは props でデータだけでなく「関数」も渡せます。子はその関数を呼ぶことで、親に処理を頼めます",
    "AddButton に onAdd という名前の props を付け、そこへ points を増やす関数を渡します。子側は props.onAdd を onClick で呼びます(こちらは用意済み)",
    "<AddButton onAdd={() => setPoints(points + 1)} /> と書けば、子ボタンで親の points が増えます",
  ],
  solution: {
    "app.jsx": `function AddButton(props) {
  return (
    <button id="child-btn" onClick={props.onAdd}>
      ポイント追加
    </button>
  );
}

function App() {
  const [points, setPoints] = React.useState(0);
  return (
    <div>
      <p id="points">{points}</p>
      <AddButton onAdd={() => setPoints(points + 1)} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
`,
  },
});
