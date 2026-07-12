import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "lib-06-zod-schema",
  title: "zodでデータ検証",
  estMinutes: 7,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>zodでデータ検証</title>
  </head>
  <body>
    <h1>ユーザー情報の検証</h1>
    <p>名前: <span id="name"></span></p>
    <p>年齢: <span id="age"></span></p>
    <script src="/vendor/zod.js"></script>
    <script src="main.js"></script>
  </body>
</html>
`,
      editable: false,
    },
    "main.js": {
      initial: `// zod(グローバル z)でデータの「形」を定義して検証する
const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const input = { name: "田中", age: 28 };

// userSchema で input を検証しよう(parse を使う)
// 形が正しければ、検証済みの値がそのまま返る
const user = { name: "", age: 0 };

document.getElementById("name").textContent = user.name;
document.getElementById("age").textContent = String(user.age);
console.log("名前:", user.name);
console.log("年齢:", user.age);
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-object",
      file: "main.js",
      pattern: "z\\.object\\(",
      message: "z.object({ ... }) でデータの形(スキーマ)を定義しましょう",
    },
    {
      type: "source",
      id: "use-parse",
      file: "main.js",
      pattern: "\\.parse\\(",
      message: "userSchema.parse(input) で input を検証しましょう",
    },
    {
      type: "text",
      id: "show-name",
      selector: "#name",
      equals: "田中",
      message: "検証した結果の名前 田中 が表示されるようにしましょう",
    },
    {
      type: "text",
      id: "show-age",
      selector: "#age",
      equals: "28",
      message: "検証した結果の年齢 28 が表示されるようにしましょう",
    },
    {
      type: "console",
      id: "log-both",
      lines: ["名前: 田中", "年齢: 28"],
      message: "コンソールに「名前: 田中」と「年齢: 28」を出力しましょう",
    },
  ],
  hints: [
    "z.object でスキーマを作り、そのスキーマの parse に検証したい値を渡します",
    "parse は形が正しければ検証済みの値を返し、間違っていればエラーを投げます",
    "const user = userSchema.parse(input); にすれば、user から name と age が取り出せます",
  ],
  solution: {
    "main.js": `const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const input = { name: "田中", age: 28 };

const user = userSchema.parse(input);

document.getElementById("name").textContent = user.name;
document.getElementById("age").textContent = String(user.age);
console.log("名前:", user.name);
console.log("年齢:", user.age);
`,
  },
});
