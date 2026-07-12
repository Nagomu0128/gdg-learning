import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "react-int-10-todo",
  title: "総合: Todo アプリ",
  estMinutes: 15,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>総合: Todo アプリ</title>
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
      initial: `// 総合演習: Todo アプリを作ろう!
//
// 判定が見る「契約」(この id / class を使ってください):
//   - 入力欄:         id="todo-input"
//   - 追加ボタン:      id="add"
//   - リスト:          id="list" の ul。各タスクは その中の li
//   - 完了切替ボタン:   各 li の中の class="toggle"
//   - 削除ボタン:       各 li の中の class="remove"
//   - 完了した li:      className に "done" を含める
//
// 要件: 追加できる / 完了を切り替えられる(done クラス)/ 削除できる
function App() {
  // ここに state(入力文字・todo 配列)と、追加・完了切替・削除の処理を書こう
  return (
    <div>
      {/* 入力欄・追加ボタン・リストをここに組み立てよう */}
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
      selector: "#todo-input",
      count: 1,
      message: '入力欄 id="todo-input" を表示しましょう',
    },
    {
      type: "element",
      id: "add-rendered",
      selector: "#add",
      count: 1,
      message: '追加ボタン id="add" を表示しましょう',
    },
    {
      type: "element",
      id: "list-rendered",
      selector: "#list",
      count: 1,
      message: 'リスト id="list" の ul を表示しましょう',
    },
    {
      type: "custom",
      id: "add-appends-todo",
      message: "入力して「追加」を押すと、その内容の li が1つ増えるようにしましょう",
      run: async (ctx) => {
        const list = ctx.document.querySelector("#list");
        const input = ctx.document.querySelector("#todo-input") as HTMLInputElement | null;
        if (list === null || input === null) {
          return false;
        }
        const setter = Object.getOwnPropertyDescriptor(ctx.window.HTMLInputElement.prototype, "value")?.set;
        if (setter === undefined) {
          return false;
        }
        const before = list.querySelectorAll("li").length;
        setter.call(input, "牛乳を買う");
        ctx.fire("#todo-input", "input");
        await ctx.wait(60);
        ctx.fire("#add", "click");
        await ctx.wait(80);
        const items = list.querySelectorAll("li");
        if (items.length !== before + 1) {
          return false;
        }
        const last = items[items.length - 1];
        return last !== undefined && (last.textContent ?? "").includes("牛乳を買う");
      },
    },
    {
      type: "custom",
      id: "toggle-marks-done",
      message:
        "タスクの「完了」ボタンを押すと、その li の className に done が付く(切り替わる)ようにしましょう",
      run: async (ctx) => {
        const list = ctx.document.querySelector("#list");
        const input = ctx.document.querySelector("#todo-input") as HTMLInputElement | null;
        if (list === null || input === null) {
          return false;
        }
        const setter = Object.getOwnPropertyDescriptor(ctx.window.HTMLInputElement.prototype, "value")?.set;
        if (setter === undefined) {
          return false;
        }
        // このチェック単独でも動くよう、対象が無ければ1つ追加する
        if (list.querySelector("li") === null) {
          setter.call(input, "本を読む");
          ctx.fire("#todo-input", "input");
          await ctx.wait(60);
          ctx.fire("#add", "click");
          await ctx.wait(80);
        }
        const first = list.querySelector("li");
        if (first === null || first.querySelector(".toggle") === null) {
          return false;
        }
        const wasDone = first.classList.contains("done");
        ctx.fire(".toggle", "click");
        await ctx.wait(80);
        const firstAfter = list.querySelector("li");
        return firstAfter !== null && firstAfter.classList.contains("done") !== wasDone;
      },
    },
    {
      type: "custom",
      id: "remove-deletes-todo",
      message: "タスクの「削除」ボタンを押すと、その li が消えて数が1つ減るようにしましょう",
      run: async (ctx) => {
        const list = ctx.document.querySelector("#list");
        const input = ctx.document.querySelector("#todo-input") as HTMLInputElement | null;
        if (list === null || input === null) {
          return false;
        }
        const setter = Object.getOwnPropertyDescriptor(ctx.window.HTMLInputElement.prototype, "value")?.set;
        if (setter === undefined) {
          return false;
        }
        // 消す対象を1つ用意する
        setter.call(input, "消すタスク");
        ctx.fire("#todo-input", "input");
        await ctx.wait(60);
        ctx.fire("#add", "click");
        await ctx.wait(80);
        const before = list.querySelectorAll("li").length;
        if (before === 0 || list.querySelector(".remove") === null) {
          return false;
        }
        ctx.fire(".remove", "click");
        await ctx.wait(80);
        return list.querySelectorAll("li").length === before - 1;
      },
    },
  ],
  hints: [
    "state は2つ用意します。入力中の文字(text)と、タスクの配列(todos)です。各タスクは { id, title, done } のオブジェクトにすると扱いやすいです",
    "追加はスプレッドで [...todos, 新しいタスク]、削除は filter で id 違いだけ残す、完了切替は map で該当 id だけ done を反転(! で反転)します。id は React.useRef のカウンターで一意にできます",
    '各 li は className={t.done ? "done" : ""} にし、完了ボタン(class="toggle")と削除ボタン(class="remove")にそれぞれ onClick を付けます。入力欄は value={text} と onChange で state につなぎます',
  ],
  solution: {
    "app.jsx": `function App() {
  const [text, setText] = React.useState("");
  const [todos, setTodos] = React.useState([]);
  const nextId = React.useRef(1);
  const add = () => {
    if (text === "") {
      return;
    }
    setTodos([...todos, { id: nextId.current++, title: text, done: false }]);
    setText("");
  };
  const toggle = (id) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };
  const remove = (id) => {
    setTodos(todos.filter((t) => t.id !== id));
  };
  return (
    <div>
      <input id="todo-input" value={text} onChange={(e) => setText(e.target.value)} />
      <button id="add" onClick={add}>
        追加
      </button>
      <ul id="list">
        {todos.map((t) => (
          <li key={t.id} className={t.done ? "done" : ""}>
            <span className="title">{t.title}</span>
            <button className="toggle" onClick={() => toggle(t.id)}>
              完了
            </button>
            <button className="remove" onClick={() => remove(t.id)}>
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
`,
  },
});
