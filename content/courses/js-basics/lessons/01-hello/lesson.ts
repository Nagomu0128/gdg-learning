import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-01-hello",
  title: "はじめてのJavaScript",
  estMinutes: 3,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// ここに console.log("Hello, World!"); と書いてみよう
`,
    },
  },
  checks: [
    {
      id: "hello-output",
      type: "console",
      lines: ["Hello, World!"],
    },
  ],
  hints: [
    "コンソールに文字を表示するには console.log() という命令を使います",
    "表示したい文字をダブルクォートで囲んで、console.log の ( ) の中に書きます。最後にセミコロンを付けましょう",
    'console.log("Hello, World!"); と書けば完成です',
  ],
  solution: {
    "script.js": `console.log("Hello, World!");
`,
  },
});
