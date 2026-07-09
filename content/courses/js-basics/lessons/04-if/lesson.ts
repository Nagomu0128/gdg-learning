import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-04-if",
  title: "条件分岐 if",
  estMinutes: 6,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// 年齢(age)が 18 以上なら true、そうでなければ false を返す関数
function canEnter(age) {
  // ここに if 文を書こう
  //   age が 18 以上なら true を、そうでなければ false を返す

}

// 動作確認用(この2行はそのままでOK)
console.log(canEnter(20));
console.log(canEnter(15));
`,
    },
  },
  checks: [
    {
      id: "declare-canenter",
      type: "source",
      file: "script.js",
      pattern: "function\\s+canEnter",
      message: "canEnter という名前の関数を function で宣言しましょう",
    },
    {
      id: "use-if",
      type: "source",
      file: "script.js",
      pattern: "if\\s*\\(",
      message: "if 文を使って条件分岐しましょう",
    },
    {
      id: "adult-can-enter",
      type: "fn",
      name: "canEnter",
      args: [20],
      returns: true,
    },
    {
      id: "child-cannot-enter",
      type: "fn",
      name: "canEnter",
      args: [15],
      returns: false,
    },
  ],
  hints: [
    "if (条件) { 条件が正しいときの処理 } else { そうでないときの処理 } という形で処理を分けられます",
    "「18 以上」という条件は age >= 18 と書きます。条件が正しいときは return true; で true を返します",
    "関数の中に if (age >= 18) { return true; } else { return false; } と書けば完成です",
  ],
  solution: {
    "script.js": `function canEnter(age) {
  if (age >= 18) {
    return true;
  } else {
    return false;
  }
}

console.log(canEnter(20));
console.log(canEnter(15));
`,
  },
});
