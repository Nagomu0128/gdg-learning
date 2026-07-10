import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "cap-03-stopwatch",
  title: "ストップウォッチ",
  estMinutes: 25,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>ストップウォッチ</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <!-- ここに id="display" の表示(はじめの文字は 0.0)を書こう -->
    <!-- ここに id="start" / id="stop" / id="reset" の3つの button を書こう -->
    <script src="script.js"></script>
  </body>
</html>
`,
    },
    "style.css": {
      initial: `/* ここは自由にデザインしよう(このレッスンの判定は CSS を見ません) */
`,
    },
    "script.js": {
      initial: `// ここにストップウォッチのプログラムを書こう(0.1秒ごとに経過時間を増やして #display に表示する)
`,
    },
  },
  checks: [
    {
      type: "element",
      id: "display-element",
      selector: "#display",
      message: '経過時間を表示する id="display" の要素を書きましょう',
    },
    {
      type: "text",
      id: "display-starts-at-zero",
      selector: "#display",
      equals: "0.0",
      message: "はじめの #display の文字は「0.0」にしましょう(判定はこの表示の形を見ます)",
    },
    {
      type: "element",
      id: "start-button",
      selector: "button#start",
      message: '時間を動かす id="start" の button を書きましょう',
    },
    {
      type: "element",
      id: "stop-button",
      selector: "button#stop",
      message: '時間を止める id="stop" の button を書きましょう',
    },
    {
      type: "element",
      id: "reset-button",
      selector: "button#reset",
      message: '表示を 0.0 に戻す id="reset" の button を書きましょう',
    },
    {
      type: "custom",
      id: "start-changes-display",
      message:
        "「スタート」を押したら時間が動き出し、0.5秒以内に #display の表示が変わるようにしましょう(0.1秒ごとの更新がおすすめです)",
      run: async (ctx) => {
        const display = ctx.document.querySelector("#display");
        if (display === null) {
          return false;
        }
        ctx.fire("#start", "click");
        await ctx.wait(500);
        return (display.textContent ?? "").trim() !== "0.0";
      },
    },
    {
      type: "custom",
      id: "stop-freezes-display",
      message: "「ストップ」を押したら時間が止まり、#display の表示が変わらなくなるようにしましょう",
      run: async (ctx) => {
        const display = ctx.document.querySelector("#display");
        if (display === null) {
          return false;
        }
        ctx.fire("#stop", "click");
        await ctx.wait(100);
        const before = (display.textContent ?? "").trim();
        await ctx.wait(400);
        return (display.textContent ?? "").trim() === before;
      },
    },
    {
      type: "custom",
      id: "reset-restores-zero",
      message: "「リセット」を押したら、#display の表示が「0.0」に戻るようにしましょう",
      run: async (ctx) => {
        const display = ctx.document.querySelector("#display");
        if (display === null) {
          return false;
        }
        ctx.fire("#reset", "click");
        await ctx.wait(100);
        return (display.textContent ?? "").trim() === "0.0";
      },
    },
  ],
  hints: [
    "覚えておく値は2つだけです。経過時間を数える変数(let tenths = 0;)と、動いているタイマーの id を入れる変数(let timerId = null;)。画面の表示は、いつも変数から書き写します",
    "スタートは timerId = setInterval(() => { ... }, 100); で 0.1秒ごとのくり返しを予約します。くり返しの中で tenths を1増やし、表示を更新します",
    "表示の書き換えは display.textContent = (tenths / 10).toFixed(1); です。toFixed(1) が「0.0」や「1.4」の形の文字列を作ってくれます",
    "ストップは clearInterval(timerId); timerId = null; です。さらにスタートの先頭に if (timerId !== null) { return; } を入れると、2回押しても速く進まず安全です",
    "リセットでやることは3つです。clearInterval でタイマーを止める・tenths を 0 に戻す・#display の表示を「0.0」に書き換える。止めてから戻すのがコツです",
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>ストップウォッチ</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div class="stopwatch">
      <h1>ストップウォッチ</h1>
      <p id="display">0.0</p>
      <div class="buttons">
        <button id="start">スタート</button>
        <button id="stop">ストップ</button>
        <button id="reset">リセット</button>
      </div>
    </div>
    <script src="script.js"></script>
  </body>
</html>
`,
    "style.css": `body {
  font-family: sans-serif;
  background-color: #f1f5f9;
  display: flex;
  justify-content: center;
  padding-top: 40px;
}

.stopwatch {
  width: 280px;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
}

#display {
  font-family: monospace;
  font-size: 48px;
  margin-top: 8px;
  margin-bottom: 16px;
}

.buttons {
  display: flex;
  justify-content: center;
  column-gap: 8px;
}

button {
  font-size: 14px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background-color: #0ea5e9;
  color: #ffffff;
  cursor: pointer;
}

button:hover {
  background-color: #0284c7;
}
`,
    "script.js": `// 経過時間(0.1秒が何回きたか)を数える変数
let tenths = 0;
// 動いているあいだだけ setInterval の id が入る変数(止まっているときは null)
let timerId = null;

const display = document.getElementById("display");

// 変数の値を「秒.1桁」の形で表示する
function render() {
  display.textContent = (tenths / 10).toFixed(1);
}

// スタート: 0.1秒ごとに数えて表示を更新する
document.getElementById("start").addEventListener("click", () => {
  if (timerId !== null) {
    return;
  }
  timerId = setInterval(() => {
    tenths = tenths + 1;
    render();
  }, 100);
});

// ストップ: タイマーを止める
document.getElementById("stop").addEventListener("click", () => {
  clearInterval(timerId);
  timerId = null;
});

// リセット: タイマーを止めて 0.0 に戻す
document.getElementById("reset").addEventListener("click", () => {
  clearInterval(timerId);
  timerId = null;
  tenths = 0;
  render();
});
`,
  },
});
