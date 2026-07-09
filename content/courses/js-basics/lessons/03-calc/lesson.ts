import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-03-calc",
  title: "計算してみよう",
  estMinutes: 5,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// りんご1個の値段と、買う個数
const price = 100;
const count = 3;

// 合計金額(price かける count)を計算して表示しよう
console.log();

// 10 たす 5 の計算結果も表示しよう
console.log();
`,
    },
  },
  checks: [
    {
      id: "use-multiply",
      type: "source",
      file: "script.js",
      pattern: "\\*",
      message: "かけ算の記号「*」を使って計算しましょう",
    },
    {
      id: "use-plus",
      type: "source",
      file: "script.js",
      pattern: "\\+",
      message: "たし算の記号「+」を使って計算しましょう",
    },
    {
      id: "total-output",
      type: "console",
      lines: ["300"],
    },
    {
      id: "sum-output",
      type: "console",
      lines: ["15"],
    },
  ],
  hints: [
    "かけ算は * 、たし算は + の記号を使います。console.log(2 * 3) のように ( ) の中で計算できます",
    "変数どうしも計算できます。1つ目の console.log の ( ) の中には price * count と書きます",
    "console.log(price * count); と console.log(10 + 5); の2行にすれば完成です",
  ],
  solution: {
    "script.js": `const price = 100;
const count = 3;

console.log(price * count);

console.log(10 + 5);
`,
  },
});
