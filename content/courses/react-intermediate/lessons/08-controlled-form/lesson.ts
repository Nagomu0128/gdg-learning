import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "react-int-08-controlled-form",
  title: "複数フィールドのフォーム",
  estMinutes: 9,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>複数フィールドのフォーム</title>
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
      initial: `// 名前とメール、2つの入力を1つの state(オブジェクト)で管理しよう
function App() {
  const [form, setForm] = React.useState({ name: "", email: "" });
  const handleChange = (e) => {
    // 今の form を土台に、変更された入力の項目だけを新しい値に上書きして setForm に渡そう
    // どの項目かは、入力の name 属性(e.target.name)で見分けます
  };
  return (
    <div>
      <input id="name" name="name" value={form.name} onChange={handleChange} />
      <input id="email" name="email" value={form.email} onChange={handleChange} />
      <p id="preview">{form.name} {form.email}</p>
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
      id: "name-input-rendered",
      selector: "#name",
      count: 1,
      message: '名前の入力欄 id="name" を表示しましょう',
    },
    {
      type: "element",
      id: "email-input-rendered",
      selector: "#email",
      count: 1,
      message: 'メールの入力欄 id="email" を表示しましょう',
    },
    {
      type: "element",
      id: "preview-rendered",
      selector: "#preview",
      count: 1,
      message: '入力内容を映す id="preview" の要素を表示しましょう',
    },
    {
      type: "source",
      id: "computed-key",
      file: "app.jsx",
      pattern: "\\[\\s*e\\.target\\.name\\s*\\]",
      message: "[e.target.name] の形(計算されたキー)で、変更された項目だけを更新しましょう",
    },
    {
      type: "custom",
      id: "both-fields-update",
      message: "名前・メールのどちらを入力しても、#preview に両方が反映されるようにしましょう",
      run: async (ctx) => {
        const nameInput = ctx.document.querySelector("#name") as HTMLInputElement | null;
        const emailInput = ctx.document.querySelector("#email") as HTMLInputElement | null;
        const preview = ctx.document.querySelector("#preview");
        if (nameInput === null || emailInput === null || preview === null) {
          return false;
        }
        const setter = Object.getOwnPropertyDescriptor(ctx.window.HTMLInputElement.prototype, "value")?.set;
        if (setter === undefined) {
          return false;
        }
        setter.call(nameInput, "タロウ");
        ctx.fire("#name", "input");
        await ctx.wait(60);
        setter.call(emailInput, "hana@example.com");
        ctx.fire("#email", "input");
        await ctx.wait(60);
        return (preview.textContent ?? "").trim() === "タロウ hana@example.com";
      },
    },
  ],
  hints: [
    "入力が増えても state を1つずつ増やすと大変です。関連する入力は1つのオブジェクト state にまとめます",
    "入力に name 属性を付けておくと、handleChange の中で e.target.name でどの項目かが分かります。値は e.target.value です",
    "setForm({ ...form, [e.target.name]: e.target.value }); と書けば、name 属性に合わせた項目だけが更新されます",
  ],
  solution: {
    "app.jsx": `function App() {
  const [form, setForm] = React.useState({ name: "", email: "" });
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  return (
    <div>
      <input id="name" name="name" value={form.name} onChange={handleChange} />
      <input id="email" name="email" value={form.email} onChange={handleChange} />
      <p id="preview">{form.name} {form.email}</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
`,
  },
});
