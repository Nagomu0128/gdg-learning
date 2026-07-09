import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-12-events",
  title: "クリックに反応する",
  estMinutes: 8,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>クリックに反応する</title>
  </head>
  <body>
    <h1>クリックに反応する</h1>
    <button id="push">おす</button>
    <p id="message">まだ押されていません</p>
    <script src="script.js"></script>
  </body>
</html>
`,
      editable: false,
    },
    "script.js": {
      initial: `// ボタンの要素を取得する
const button = document.getElementById("push");

// ここに addEventListener で click イベントの処理を登録しよう
// クリックされたら、id が "message" の要素の文字を「クリックされました!」に変えよう

`,
    },
  },
  checks: [
    { type: "element", id: "button-element", selector: "button" },
    { type: "element", id: "message-element", selector: "#message" },
    {
      type: "source",
      id: "use-addeventlistener",
      file: "script.js",
      pattern: "addEventListener\\s*\\(\\s*[\"']click[\"']",
      message: 'button.addEventListener("click", 処理) の形で click イベントを登録しましょう',
    },
    {
      type: "custom",
      id: "click-changes-message",
      message:
        "ボタンをクリックしたら、id が message の要素の文字が「クリックされました!」に変わるようにしましょう",
      run: async (ctx) => {
        ctx.fire("button", "click");
        await ctx.wait(50);
        const el = ctx.document.querySelector("#message");
        if (el === null) {
          return false;
        }
        return (el.textContent ?? "").trim() === "クリックされました!";
      },
    },
  ],
  hints: [
    'クリックされたときの処理は button.addEventListener("click", 処理) の形で登録します',
    '処理の部分にはアロー関数が書けます: button.addEventListener("click", () => { ここに処理 });',
    'アロー関数の中で document.getElementById("message").textContent = "クリックされました!"; と書きましょう',
  ],
  solution: {
    "script.js": `// ボタンの要素を取得する
const button = document.getElementById("push");

// クリックされたときの処理を登録する
button.addEventListener("click", () => {
  const message = document.getElementById("message");
  message.textContent = "クリックされました!";
});
`,
  },
});
