import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-02-variables",
  title: "変数に入れる",
  estMinutes: 4,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// 名前を変数 myName に入れています
const myName = "タロウ";

// ここに console.log("ぼくの名前は" + myName); と書いてみよう
`,
    },
  },
  checks: [
    {
      id: "use-const",
      type: "source",
      file: "script.js",
      pattern: "const\\s+",
      message: "const を使って変数を宣言しましょう",
    },
    {
      id: "greeting-output",
      type: "console",
      lines: ["ぼくの名前はタロウ"],
    },
  ],
  hints: [
    "変数の中身は、myName のように変数の名前を書くだけで取り出せます",
    '文字列と変数は + でつなげられます。"ぼくの名前は" + myName の形です',
    'console.log("ぼくの名前は" + myName); と書けば完成です',
  ],
  solution: {
    "script.js": `const myName = "タロウ";

console.log("ぼくの名前は" + myName);
`,
  },
});
