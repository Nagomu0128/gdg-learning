import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-09-array-methods",
  title: "配列をまとめて処理",
  estMinutes: 6,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// すべての要素を 2 倍にした新しい配列を返す関数
function doubleAll(numbers) {
  // ここで numbers.map を使って、2 倍にした配列を return しよう
}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(doubleAll([1, 2, 3]));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-map",
      file: "script.js",
      pattern: "\\.map\\(",
      message: "配列の map メソッドを使って書いてみましょう",
    },
    { type: "fn", id: "double-all-basic", name: "doubleAll", args: [[1, 2, 3]], returns: [2, 4, 6] },
    { type: "fn", id: "double-all-mixed", name: "doubleAll", args: [[5, 0, -3]], returns: [10, 0, -6] },
  ],
  hints: [
    "map は「配列のすべての要素に同じ処理をして、新しい配列を返す」メソッドです",
    "numbers.map((n) => n * 2) と書くと、各要素 n を 2 倍にした新しい配列ができます",
    "doubleAll の中身は return numbers.map((n) => n * 2); の 1 行です",
  ],
  solution: {
    "script.js": `// すべての要素を 2 倍にした新しい配列を返す関数
function doubleAll(numbers) {
  return numbers.map((n) => n * 2);
}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(doubleAll([1, 2, 3]));
`,
  },
});
