import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-06-function",
  title: "関数をつくる",
  estMinutes: 5,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// 2つの数 a と b を受け取って、たした答えを返す関数 add をつくろう
function add(a, b) {
  // ここに、a と b をたした答えを返す1行を書こう

}

// 動作確認用(この2行はそのままでOK)
console.log(add(1, 2));
console.log(add(10, -5));
`,
    },
  },
  checks: [
    {
      id: "declare-add",
      type: "source",
      file: "script.js",
      pattern: "function\\s+add",
      message: "add という名前の関数を function で宣言しましょう",
    },
    {
      id: "use-return",
      type: "source",
      file: "script.js",
      pattern: "return",
      message: "return を使って答えを返しましょう",
    },
    {
      id: "add-basic",
      type: "fn",
      name: "add",
      args: [1, 2],
      returns: 3,
    },
    {
      id: "add-negative",
      type: "fn",
      name: "add",
      args: [10, -5],
      returns: 5,
    },
  ],
  hints: [
    "関数の中で return を使うと、計算した答えを呼び出し元に返せます",
    "a と b をたした答えは a + b と書きます。return a + b; の形で返します",
    "関数の波かっこの中に return a + b; と1行書けば完成です",
  ],
  solution: {
    "script.js": `function add(a, b) {
  return a + b;
}

console.log(add(1, 2));
console.log(add(10, -5));
`,
  },
});
