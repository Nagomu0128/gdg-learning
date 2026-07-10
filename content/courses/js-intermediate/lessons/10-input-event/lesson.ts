import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-int-10-input-event",
  title: "入力に反応する",
  estMinutes: 7,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>入力に反応する</title>
  </head>
  <body>
    <h1>あいさつメーカー</h1>
    <input id="name-input" placeholder="名前を入力してね">
    <p id="preview">ここにあいさつが表示されます</p>
    <script src="script.js"></script>
  </body>
</html>
`,
      editable: false,
    },
    "script.js": {
      initial: `// 入力欄と表示欄の要素を取得する
const input = document.getElementById("name-input");
const preview = document.getElementById("preview");

// ここに input イベントの処理を登録して、
// preview の文字を「こんにちは、(入力した名前)さん!」に更新しよう

`,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-input-event",
      file: "script.js",
      pattern: "addEventListener\\s*\\(\\s*[\"']input[\"']",
      message: 'input.addEventListener("input", 処理) の形で input イベントを登録しましょう',
    },
    {
      type: "custom",
      id: "typing-updates-preview",
      message:
        "名前を入力すると、#preview の文字が「こんにちは、(入力した名前)さん!」に変わるようにしましょう",
      run: async (ctx) => {
        const input = ctx.document.querySelector("#name-input") as HTMLInputElement | null;
        if (input === null) {
          return false;
        }
        input.value = "タロウ";
        ctx.fire("#name-input", "input");
        await ctx.wait(50);
        const preview = ctx.document.querySelector("#preview");
        if (preview === null) {
          return false;
        }
        return (preview.textContent ?? "").trim() === "こんにちは、タロウさん!";
      },
    },
    {
      type: "custom",
      id: "typing-updates-preview-again",
      message:
        "入力しなおすたびに表示も新しい名前に変わるようにしましょう(input イベントは入力のたびに起きます)",
      run: async (ctx) => {
        const input = ctx.document.querySelector("#name-input") as HTMLInputElement | null;
        if (input === null) {
          return false;
        }
        input.value = "ハナコ";
        ctx.fire("#name-input", "input");
        await ctx.wait(50);
        const preview = ctx.document.querySelector("#preview");
        if (preview === null) {
          return false;
        }
        return (preview.textContent ?? "").trim() === "こんにちは、ハナコさん!";
      },
    },
  ],
  hints: [
    '入力欄は、文字がタイプされるたびに "input" イベントが起きます。click と同じように addEventListener で登録できます',
    "入力欄に今入っている文字は input.value で取り出せます。イベントの処理の中で読むと、そのときの最新の文字が手に入ります",
    `処理の中に preview.textContent = \`こんにちは、\${input.value}さん!\`; と書きましょう(テンプレートリテラルを使います)`,
  ],
  solution: {
    "script.js": `// 入力欄と表示欄の要素を取得する
const input = document.getElementById("name-input");
const preview = document.getElementById("preview");

// 入力されるたびに表示を更新する
input.addEventListener("input", () => {
  preview.textContent = \`こんにちは、\${input.value}さん!\`;
});
`,
  },
});
