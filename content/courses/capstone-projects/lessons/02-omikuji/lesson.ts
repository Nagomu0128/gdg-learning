import { defineLesson } from "@codesteps/lesson-kit";

// 判定が受け入れる結果の候補(スライドの要件で「この一覧から選ぶ」と契約している)
const OMIKUJI_RESULTS = ["大吉", "中吉", "小吉", "吉", "末吉", "凶", "大凶"];

export default defineLesson({
  slug: "cap-02-omikuji",
  title: "おみくじ",
  estMinutes: 20,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>おみくじ</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <!-- ここに id="draw" の button と、結果を出す id="result" の要素を書こう -->
    <!-- 判定が見るのは #draw と #result だけ。見出しやかざりは自由! -->
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
      initial: `// ここにおみくじのプログラムを書こう(候補の配列からランダムに1つ選んで #result に表示する)
`,
    },
  },
  checks: [
    {
      type: "element",
      id: "draw-button",
      selector: "button#draw",
      message: 'おみくじを引く id="draw" の button を書きましょう',
    },
    {
      type: "element",
      id: "result-area",
      selector: "#result",
      message: '結果を表示する id="result" の要素を書きましょう',
    },
    {
      type: "custom",
      id: "draw-shows-result",
      message:
        "ボタンを押したら、#result の文字が候補(大吉・中吉・小吉・凶 など)のどれかになるようにしましょう",
      run: async (ctx) => {
        ctx.fire("#draw", "click");
        await ctx.wait(50);
        const result = ctx.document.querySelector("#result");
        if (result === null) {
          return false;
        }
        return OMIKUJI_RESULTS.includes((result.textContent ?? "").trim());
      },
    },
    {
      type: "custom",
      id: "redraw-stays-in-set",
      message:
        "何回押しても、#result には結果の文字列だけが入るようにしましょう(前後に文字を足さず、そのまま表示します)",
      run: async (ctx) => {
        const result = ctx.document.querySelector("#result");
        if (result === null) {
          return false;
        }
        ctx.fire("#draw", "click");
        await ctx.wait(50);
        if (!OMIKUJI_RESULTS.includes((result.textContent ?? "").trim())) {
          return false;
        }
        ctx.fire("#draw", "click");
        await ctx.wait(50);
        return OMIKUJI_RESULTS.includes((result.textContent ?? "").trim());
      },
    },
  ],
  hints: [
    'まず結果の候補を const results = ["大吉", "中吉", "小吉", "凶"]; のように配列で持ちましょう。部品は「候補の配列」「クリック処理」「#result への表示」の3つです',
    "ランダムな番号は Math.floor(Math.random() * results.length) で作れます。Math.random() は 0 以上 1 未満の小数を返すので、配列の長さをかけて切り捨てると 0〜(長さ-1) になります",
    'document.getElementById("draw").addEventListener("click", () => { ... }) の形でクリック処理を登録します(JavaScript中級で学んだイベントと同じ形です)',
    "クリック処理の中身は2行です。const index = Math.floor(Math.random() * results.length); で番号を選び、result.textContent = results[index]; で表示します",
    "見た目は #result の font-size を大きくし、button に padding と background-color と border-radius を付けると、ぐっとおみくじらしくなります",
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>おみくじ</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div class="omikuji">
      <h1>今日の運勢</h1>
      <p id="result">？</p>
      <button id="draw">おみくじを引く</button>
    </div>
    <script src="script.js"></script>
  </body>
</html>
`,
    "style.css": `body {
  font-family: sans-serif;
  background-color: #fef3c7;
  display: flex;
  justify-content: center;
  padding-top: 40px;
}

.omikuji {
  width: 260px;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
}

#result {
  font-size: 48px;
  margin-top: 16px;
  margin-bottom: 16px;
  color: #b45309;
}

#draw {
  font-size: 16px;
  padding: 10px 24px;
  border: none;
  border-radius: 999px;
  background-color: #f59e0b;
  color: #ffffff;
  cursor: pointer;
}

#draw:hover {
  background-color: #d97706;
}
`,
    "script.js": `// 結果の候補を配列で持つ
const results = ["大吉", "中吉", "小吉", "凶"];

// ボタンと表示欄の要素を取得する
const button = document.getElementById("draw");
const result = document.getElementById("result");

// 押すたびに、候補からランダムに1つ選んで表示する
button.addEventListener("click", () => {
  const index = Math.floor(Math.random() * results.length);
  result.textContent = results[index];
});
`,
  },
});
