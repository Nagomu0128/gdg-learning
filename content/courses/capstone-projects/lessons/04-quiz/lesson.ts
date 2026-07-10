import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "cap-04-quiz",
  title: "3問クイズ",
  estMinutes: 20,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>3問クイズ</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <!-- ここに自由にクイズの画面を作ろう。判定が見る名前は次の3つだけ:
      - 問題文を表示する要素: id="question"
      - 選択肢のボタン: class="choice"
      - 点数の表示: id="score"(全問答えたら半角数字入りで表示。最初は空)
    -->
    <script src="script.js"></script>
  </body>
</html>
`,
    },
    "style.css": {
      initial: `/* 自由にデザインしよう(判定は CSS を見ません) */
`,
    },
    "script.js": {
      initial: `// ここにクイズのプログラムを書こう(問題データは questions という名前の配列で持つこと)

`,
    },
  },
  checks: [
    {
      type: "source",
      id: "questions-array",
      file: "script.js",
      pattern: "(?:const|let|var)\\s+questions\\s*=\\s*\\[",
      message:
        "問題データは script.js の中で questions という名前の配列にまとめましょう(例: const questions = [ ... ])",
    },
    {
      type: "custom",
      id: "choice-advances",
      message:
        '選択肢(class="choice")をクリックしたら、#question の問題文がすぐ次の問題に切り替わるようにしましょう',
      run: async (ctx) => {
        const question = ctx.document.querySelector("#question");
        if (question === null || ctx.document.querySelector(".choice") === null) {
          return false;
        }
        const before = (question.textContent ?? "").trim();
        ctx.fire(".choice", "click");
        await ctx.wait(200);
        const after = (ctx.document.querySelector("#question")?.textContent ?? "").trim();
        const score = ctx.document.querySelector("#score")?.textContent ?? "";
        // 次の問題に進む(問題文が変わる)か、最終問題後なら点数表示でもよい
        return (after !== "" && after !== before) || /\d/.test(score);
      },
    },
    {
      type: "custom",
      id: "score-displayed",
      message:
        '3問すべてに答えたら、id="score" の要素に半角数字入りで点数を表示しましょう(例: 3問中 2問 正解!)',
      run: async (ctx) => {
        const hasScore = () => /\d/.test(ctx.document.querySelector("#score")?.textContent ?? "");
        // 前の check の続きから、点数が出るまで選択肢をクリックしていく
        for (let i = 0; i < 5; i++) {
          if (hasScore()) {
            return true;
          }
          if (ctx.document.querySelector(".choice") === null) {
            break;
          }
          ctx.fire(".choice", "click");
          await ctx.wait(150);
        }
        return hasScore();
      },
    },
  ],
  hints: [
    "まず設計から。「いま何問目か」を let current = 0、正解数を let score = 0 の変数で持ち、「current 番目の問題を画面に描く render 関数」を作ります。あとは『答え合わせして current を進めて描き直す』の繰り返しです",
    `問題データの形の例: const questions = [{ text: "問題文", choices: ["A", "B", "C"], answer: 0 }, ...] のように、問題文・選択肢の配列・正解の番号をオブジェクトにして3つ並べます`,
    'render 関数では questions[current] を取り出し、document.getElementById("question").textContent に問題文を入れます。選択肢は forEach で createElement("button") し、button.className = "choice" と button.textContent を設定して、選択肢の置き場に appendChild します',
    '選択肢ボタンを作るときに button.addEventListener("click", () => { answer(index); }); を付けます。answer 関数では、index === questions[current].answer なら score を1増やし、current を1進めて、current < questions.length なら render()、そうでなければ結果表示に進みます',
    `結果表示では、選択肢の置き場を空にして(例: choicesEl.innerHTML = "")、document.getElementById("score").textContent = \`3問中 \${score}問 正解!\`; のように半角数字入りで点数を出します`,
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>3問クイズ</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <main class="quiz">
      <h1>3問クイズ</h1>
      <p id="question"></p>
      <div id="choices"></div>
      <p id="score"></p>
    </main>
    <script src="script.js"></script>
  </body>
</html>
`,
    "style.css": `body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: sans-serif;
  background-color: #eef2ff;
}

.quiz {
  width: 360px;
  padding: 28px;
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 10px 30px rgba(49, 46, 129, 0.15);
}

h1 {
  margin-top: 0;
  font-size: 22px;
  color: #312e81;
}

#question {
  font-size: 16px;
  min-height: 48px;
}

.choice {
  display: block;
  width: 100%;
  margin-top: 8px;
  padding: 10px 14px;
  font-size: 15px;
  text-align: left;
  border: 2px solid #c7d2fe;
  border-radius: 8px;
  background-color: #ffffff;
  cursor: pointer;
}

.choice:hover {
  background-color: #eef2ff;
  border-color: #6366f1;
}

#score {
  font-size: 20px;
  font-weight: bold;
  color: #4338ca;
}
`,
    "script.js": `// 問題データ(3問)。text: 問題文 / choices: 選択肢 / answer: 正解の番号(0 はじまり)
const questions = [
  {
    text: "HTML で一番大きな見出しを作るタグはどれ?",
    choices: ["<h1>", "<p>", "<a>"],
    answer: 0,
  },
  {
    text: "CSS で文字の色を変えるプロパティはどれ?",
    choices: ["font-size", "color", "width"],
    answer: 1,
  },
  {
    text: "JavaScript で変数を宣言するキーワードはどれ?",
    choices: ["const", "class", "for"],
    answer: 0,
  },
];

let current = 0; // いま何問目か
let score = 0; // 正解した数

const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const scoreEl = document.getElementById("score");

// いまの問題を画面に描画する
function render() {
  const q = questions[current];
  questionEl.textContent = \`Q\${current + 1}. \${q.text}\`;
  choicesEl.innerHTML = "";
  q.choices.forEach((choiceText, index) => {
    const button = document.createElement("button");
    button.className = "choice";
    button.textContent = choiceText;
    button.addEventListener("click", () => {
      answer(index);
    });
    choicesEl.appendChild(button);
  });
}

// 回答を受け取り、次の問題か結果表示へ進む
function answer(index) {
  if (index === questions[current].answer) {
    score = score + 1;
  }
  current = current + 1;
  if (current < questions.length) {
    render();
  } else {
    showResult();
  }
}

// 全問終わったら点数を表示する
function showResult() {
  questionEl.textContent = "クイズ終了! おつかれさまでした";
  choicesEl.innerHTML = "";
  scoreEl.textContent = \`3問中 \${score}問 正解!\`;
}

render();
`,
  },
});
