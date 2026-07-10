import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-int-11-timers",
  title: "タイマーで動かす",
  estMinutes: 7,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>タイマーで動かす</title>
  </head>
  <body>
    <h1>カップラーメンタイマー</h1>
    <button id="start">スタート</button>
    <p id="message">ボタンを押してスタート</p>
    <script src="script.js"></script>
  </body>
</html>
`,
      editable: false,
    },
    "script.js": {
      initial: `// ボタンとメッセージの要素を取得する
const button = document.getElementById("start");
const message = document.getElementById("message");

// ここに click イベントの処理を登録しよう
// 1. まず message の文字を「はかっています」に変える
// 2. setTimeout で 300 ミリ秒後に「できあがり!」に変える

`,
    },
  },
  checks: [
    {
      type: "text",
      id: "message-initial-text",
      selector: "#message",
      equals: "ボタンを押してスタート",
      message: "読み込み直後は #message の文字を変えないでおきましょう(変えるのはボタンが押されてからです)",
    },
    {
      type: "source",
      id: "use-click-event",
      file: "script.js",
      pattern: "addEventListener\\s*\\(\\s*[\"']click[\"']",
      message: 'button.addEventListener("click", 処理) の形で click イベントを登録しましょう',
    },
    {
      type: "source",
      id: "use-settimeout",
      file: "script.js",
      pattern: "setTimeout\\s*\\(",
      message: "setTimeout(処理, 300) で「あとで実行する処理」を予約しましょう",
    },
    {
      type: "custom",
      id: "click-shows-measuring",
      message: "ボタンを押したら、すぐに #message の文字を「はかっています」に変えましょう",
      run: async (ctx) => {
        ctx.fire("#start", "click");
        await ctx.wait(50);
        const message = ctx.document.querySelector("#message");
        if (message === null) {
          return false;
        }
        return (message.textContent ?? "").trim() === "はかっています";
      },
    },
    {
      type: "custom",
      id: "timer-shows-done",
      message:
        "ボタンを押してから 300 ミリ秒後に、#message の文字が「できあがり!」に変わるようにしましょう(setTimeout の待ち時間は 300 にします)",
      run: async (ctx) => {
        ctx.fire("#start", "click");
        await ctx.wait(400);
        const message = ctx.document.querySelector("#message");
        if (message === null) {
          return false;
        }
        return (message.textContent ?? "").trim() === "できあがり!";
      },
    },
  ],
  hints: [
    'まず button.addEventListener("click", () => { ... }) の形を作り、その中の1行目で message.textContent を「はかっています」に変えます',
    "setTimeout(あとで実行する処理, 待ち時間ミリ秒) で処理を予約できます。処理にはアロー関数が書けます: setTimeout(() => { ... }, 300);",
    'クリック処理の中で message.textContent = "はかっています"; と書いたあと、setTimeout(() => { message.textContent = "できあがり!"; }, 300); と書きましょう',
  ],
  solution: {
    "script.js": `// ボタンとメッセージの要素を取得する
const button = document.getElementById("start");
const message = document.getElementById("message");

// クリックでタイマーを開始する
button.addEventListener("click", () => {
  // すぐに表示を変える
  message.textContent = "はかっています";

  // 300ミリ秒(0.3秒)後に実行する処理を予約する
  setTimeout(() => {
    message.textContent = "できあがり!";
  }, 300);
});
`,
  },
});
