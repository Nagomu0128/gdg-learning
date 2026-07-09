import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-07-array",
  title: "配列",
  estMinutes: 5,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// くだものが入った配列
const fruits = ["りんご", "みかん", "ぶどう"];

// ここに console.log で fruits の長さを出力しよう


// 配列の最初の要素を返す関数
function firstItem(items) {
  // ここに items の最初の要素を return しよう
}
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-length",
      file: "script.js",
      pattern: "fruits\\s*\\.\\s*length",
      message: "fruits.length で配列の長さを取り出しましょう",
    },
    {
      type: "console",
      id: "log-length",
      lines: ["3"],
      message: "console.log(fruits.length) で配列の長さ 3 を出力しましょう",
    },
    { type: "fn", id: "first-item-strings", name: "firstItem", args: [["a", "b"]], returns: "a" },
    { type: "fn", id: "first-item-numbers", name: "firstItem", args: [[10, 20, 30]], returns: 10 },
  ],
  hints: [
    "配列の長さは fruits.length で取り出せます。console.log の丸カッコの中に書きましょう",
    "配列の要素は番号で取り出します。番号は 0 から始まるので、最初の要素は items[0] です",
    "firstItem の中身は return items[0]; の 1 行です",
  ],
  solution: {
    "script.js": `// くだものが入った配列
const fruits = ["りんご", "みかん", "ぶどう"];

// 配列の長さを出力する
console.log(fruits.length);

// 配列の最初の要素を返す関数
function firstItem(items) {
  return items[0];
}
`,
  },
});
