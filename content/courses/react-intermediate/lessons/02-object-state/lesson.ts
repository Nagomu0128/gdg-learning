import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "react-int-02-object-state",
  title: "オブジェクトの state",
  estMinutes: 7,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>オブジェクトの state</title>
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
      initial: `// 1つの state に「名前」と「年齢」をまとめて持ちます
function App() {
  const [user, setUser] = React.useState({ name: "タロウ", age: 20 });
  const birthday = () => {
    // 今の user を土台に、age だけ 1 増やした新しいオブジェクトを setUser に渡そう
    // (name は変えずに残します)
  };
  return (
    <div>
      <p id="name">{user.name}</p>
      <p id="age">{user.age}</p>
      <button id="birthday" onClick={birthday}>
        誕生日
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
      id: "name-rendered",
      selector: "#name",
      count: 1,
      message: '名前を表示する id="name" の要素を表示しましょう',
    },
    {
      type: "element",
      id: "age-rendered",
      selector: "#age",
      count: 1,
      message: '年齢を表示する id="age" の要素を表示しましょう',
    },
    {
      type: "text",
      id: "name-text",
      selector: "#name",
      equals: "タロウ",
      message: "#name には user.name(はじめは「タロウ」)を表示しましょう",
    },
    {
      type: "text",
      id: "age-text",
      selector: "#age",
      equals: "20",
      message: "#age には user.age(はじめは「20」)を表示しましょう",
    },
    {
      type: "source",
      id: "spread-update",
      file: "app.jsx",
      pattern: "\\.\\.\\.user",
      message: "更新はスプレッド構文({ ...user, age: ... })で新しいオブジェクトを作りましょう",
    },
    {
      type: "custom",
      id: "birthday-increments-age",
      message: "「誕生日」を押すと age だけ 1 増え、name はそのまま残るようにしましょう",
      run: async (ctx) => {
        const ageEl = ctx.document.querySelector("#age");
        const nameEl = ctx.document.querySelector("#name");
        if (ageEl === null || nameEl === null) {
          return false;
        }
        const beforeAge = Number((ageEl.textContent ?? "").trim());
        const beforeName = (nameEl.textContent ?? "").trim();
        if (Number.isNaN(beforeAge)) {
          return false;
        }
        ctx.fire("#birthday", "click");
        await ctx.wait(60);
        const afterAge = Number((ageEl.textContent ?? "").trim());
        const afterName = (nameEl.textContent ?? "").trim();
        return afterAge === beforeAge + 1 && afterName === beforeName;
      },
    },
  ],
  hints: [
    "オブジェクトの state は、一部だけ変えたいときも「新しいオブジェクトを作って丸ごと渡す」のが基本です",
    "今の user を広げて(スプレッド)、変えたいキーだけ上書きします。{ ...user, age: user.age + 1 } の形です",
    "setUser({ ...user, age: user.age + 1 }); と書けば、name は残したまま age だけ増えます",
  ],
  solution: {
    "app.jsx": `function App() {
  const [user, setUser] = React.useState({ name: "タロウ", age: 20 });
  const birthday = () => {
    setUser({ ...user, age: user.age + 1 });
  };
  return (
    <div>
      <p id="name">{user.name}</p>
      <p id="age">{user.age}</p>
      <button id="birthday" onClick={birthday}>
        誕生日
      </button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
`,
  },
});
