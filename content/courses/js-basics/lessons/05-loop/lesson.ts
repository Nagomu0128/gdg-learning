import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-05-loop",
  title: "くり返し for",
  estMinutes: 5,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// 1 から 5 までの数字を順番に表示しよう
for (let i = 1; i <= 5; i++) {
  // ここに、変数 i を表示する1行を書こう

}
`,
    },
  },
  checks: [
    {
      id: "use-for",
      type: "source",
      file: "script.js",
      pattern: "for\\s*\\(",
      message: "for 文を使ってくり返しましょう",
    },
    {
      id: "count-output",
      type: "console",
      lines: ["1", "2", "3", "4", "5"],
      ordered: true,
      message: "1 から 5 までの数字を順番にコンソールに出力しましょう",
    },
  ],
  hints: [
    "くり返したい処理は、for 文の波かっこの中に書きます",
    "くり返しのたびに、変数 i の中身は 1, 2, 3, 4, 5 と変わっていきます。console.log(i) で i の中身を表示できます",
    "for 文の中に console.log(i); と1行書けば完成です",
  ],
  solution: {
    "script.js": `for (let i = 1; i <= 5; i++) {
  console.log(i);
}
`,
  },
});
