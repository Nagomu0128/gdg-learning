import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "lib-07-zod-validate",
  title: "zodで入力チェック",
  estMinutes: 7,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>zodで入力チェック</title>
  </head>
  <body>
    <h1>ニックネームの入力チェック</h1>
    <p>「たろう」: <span id="ok"></span></p>
    <p>「(空文字)」: <span id="ng"></span></p>
    <script src="/vendor/zod.js"></script>
    <script src="main.js"></script>
  </body>
</html>
`,
      editable: false,
    },
    "main.js": {
      initial: `// zod でユーザー入力が正しいかチェックする
// ニックネームは「1 文字以上の文字列」とする
const nameSchema = z.string().min(1);

// safeParse はエラーを投げず、{ success: true / false } の結果を返す
function checkName(value) {
  const result = nameSchema.safeParse(value);
  // result の中の success(true か false)を見て、OK かエラーを返そう
  return "エラー";
}

const okText = checkName("たろう");
const ngText = checkName("");

document.getElementById("ok").textContent = okText;
document.getElementById("ng").textContent = ngText;
console.log("たろう:", okText);
console.log("空文字:", ngText);
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-safeparse",
      file: "main.js",
      pattern: "\\.safeParse\\(",
      message: "safeParse を使って入力を検証しましょう",
    },
    {
      type: "source",
      id: "use-success",
      file: "main.js",
      pattern: "\\.success",
      message: "result.success を見て OK かエラーかを分岐しましょう",
    },
    {
      type: "text",
      id: "show-ok",
      selector: "#ok",
      equals: "OK",
      message: "正しい入力「たろう」は OK と表示されるようにしましょう",
    },
    {
      type: "text",
      id: "show-ng",
      selector: "#ng",
      equals: "エラー",
      message: "空文字は 1 文字以上ではないので エラー と表示されるようにしましょう",
    },
    {
      type: "console",
      id: "log-both",
      lines: ["たろう: OK", "空文字: エラー"],
      message: "コンソールに「たろう: OK」と「空文字: エラー」を出力しましょう",
    },
  ],
  hints: [
    "safeParse は parse と違ってエラーを投げず、result.success に true / false が入って返ります",
    "success が true なら正しい入力、false なら不正な入力です",
    'return result.success ? "OK" : "エラー"; のように分岐すれば完成です',
  ],
  solution: {
    "main.js": `const nameSchema = z.string().min(1);

function checkName(value) {
  const result = nameSchema.safeParse(value);
  return result.success ? "OK" : "エラー";
}

const okText = checkName("たろう");
const ngText = checkName("");

document.getElementById("ok").textContent = okText;
document.getElementById("ng").textContent = ngText;
console.log("たろう:", okText);
console.log("空文字:", ngText);
`,
  },
});
