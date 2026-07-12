import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "react-09-form-input",
  title: "入力を扱う",
  estMinutes: 8,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>入力を扱う</title>
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
      initial: `// 入力欄に打った名前が、下のあいさつにそのまま反映されるようにしよう
function NameForm() {
  const [name, setName] = React.useState("");
  return (
    <div>
      {/* onChange の中身を書き換えて、入力のたびに setName(e.target.value) を呼ぼう */}
      <input id="name-input" value={name} onChange={(e) => {}} />
      <p id="greeting">こんにちは、{name}さん</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<NameForm />);
`,
    },
  },
  checks: [
    {
      type: "element",
      id: "input-rendered",
      selector: "#name-input",
      count: 1,
      message: '入力欄 id="name-input" を表示しましょう',
    },
    {
      type: "element",
      id: "greeting-rendered",
      selector: "#greeting",
      count: 1,
      message: 'あいさつを表示する id="greeting" の要素を表示しましょう',
    },
    {
      type: "text",
      id: "greeting-empty-start",
      selector: "#greeting",
      equals: "こんにちは、さん",
      message: "はじめ(入力が空)は #greeting に「こんにちは、さん」と表示しましょう",
    },
    {
      type: "custom",
      id: "typing-updates-greeting",
      message:
        "入力欄に名前を打つと、#greeting が「こんにちは、(入力した名前)さん」に変わるようにしましょう(value と onChange をつなぎます)",
      run: async (ctx) => {
        const input = ctx.document.querySelector("#name-input") as HTMLInputElement | null;
        if (input === null) {
          return false;
        }
        // React の controlled input は value を直接書き換えても変化を検知しないため、
        // ネイティブの value セッターで値を入れてから input イベントを発火する
        const setter = Object.getOwnPropertyDescriptor(ctx.window.HTMLInputElement.prototype, "value")?.set;
        if (setter === undefined) {
          return false;
        }
        setter.call(input, "タロウ");
        ctx.fire("#name-input", "input");
        await ctx.wait(50);
        const greeting = ctx.document.querySelector("#greeting");
        if (greeting === null) {
          return false;
        }
        return (greeting.textContent ?? "").trim() === "こんにちは、タロウさん";
      },
    },
  ],
  hints: [
    "入力欄の value に state をつなぐと、画面が常に state の値を映します。あとは打つたびに state を更新します",
    "onChange は入力のたびに呼ばれ、e.target.value で今の入力文字が取れます。setName(e.target.value) で state を更新します",
    "onChange={(e) => {}} を onChange={(e) => setName(e.target.value)} に書き換えれば完成です",
  ],
  solution: {
    "app.jsx": `function NameForm() {
  const [name, setName] = React.useState("");
  return (
    <div>
      <input id="name-input" value={name} onChange={(e) => setName(e.target.value)} />
      <p id="greeting">こんにちは、{name}さん</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<NameForm />);
`,
  },
});
