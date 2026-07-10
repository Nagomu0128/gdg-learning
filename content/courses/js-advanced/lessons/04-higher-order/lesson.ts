import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-adv-04-higher-order",
  title: "高階関数",
  estMinutes: 6,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// 高階関数 applyTwice: 関数 fn と値 x を受け取り、fn を2回続けて適用する
function applyTwice(fn, x) {
  // ここに、x に fn を2回続けて適用した結果を return しよう

}

// 動作確認・判定用(そのままでOK): 2倍にする関数 double を渡して使う
function twiceDemo(x) {
  function double(n) {
    return n * 2;
  }
  return applyTwice(double, x);
}

console.log(twiceDemo(5));
`,
    },
  },
  checks: [
    {
      id: "declare-apply-twice",
      type: "source",
      file: "script.js",
      pattern: "function\\s+applyTwice",
      message: "applyTwice という名前の関数を function で宣言しましょう",
    },
    {
      id: "call-fn",
      type: "source",
      file: "script.js",
      pattern: "fn\\s*\\(",
      message: "applyTwice の中で、引数で受け取った関数 fn を呼び出しましょう(fn(値) の形で呼べます)",
    },
    {
      id: "twice-five",
      type: "fn",
      name: "twiceDemo",
      args: [5],
      returns: 20,
    },
    {
      id: "twice-three",
      type: "fn",
      name: "twiceDemo",
      args: [3],
      returns: 12,
    },
  ],
  hints: [
    "引数 fn には関数そのものが入っています。ふつうの関数と同じように fn(値) の形で呼び出せます",
    "まず fn(x) で1回目の結果を作り、その結果をもう一度 fn に渡します",
    "return fn(fn(x)); と1行書けば完成です",
  ],
  solution: {
    "script.js": `// 高階関数 applyTwice: 関数 fn と値 x を受け取り、fn を2回続けて適用する
function applyTwice(fn, x) {
  return fn(fn(x));
}

// 動作確認・判定用(そのままでOK): 2倍にする関数 double を渡して使う
function twiceDemo(x) {
  function double(n) {
    return n * 2;
  }
  return applyTwice(double, x);
}

console.log(twiceDemo(5));
`,
  },
});
