import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-08-object",
  title: "オブジェクト",
  estMinutes: 5,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// ユーザーの情報をまとめたオブジェクト
const user = { name: "タロウ", age: 12 };

// ここに console.log で user の name を出力しよう


// person の name を返す関数
function getName(person) {
  // ここに person の name を return しよう
}
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-dot-name",
      file: "script.js",
      pattern: "user\\s*\\.\\s*name",
      message: "user.name のように「オブジェクト名.プロパティ名」の形で値を取り出しましょう",
    },
    {
      type: "console",
      id: "log-name",
      lines: ["タロウ"],
      message: "console.log(user.name) で「タロウ」を出力しましょう",
    },
    {
      type: "fn",
      id: "get-name-taro",
      name: "getName",
      args: [{ name: "タロウ", age: 12 }],
      returns: "タロウ",
    },
    {
      type: "fn",
      id: "get-name-hanako",
      name: "getName",
      args: [{ name: "ハナコ", age: 8 }],
      returns: "ハナコ",
    },
  ],
  hints: [
    "オブジェクトの値は「オブジェクト名.プロパティ名」で取り出せます。user の name なら user.name です",
    "console.log(user.name) と書くと「タロウ」が出力されます",
    "getName の中身は return person.name; の 1 行です",
  ],
  solution: {
    "script.js": `// ユーザーの情報をまとめたオブジェクト
const user = { name: "タロウ", age: 12 };

// user の name を出力する
console.log(user.name);

// person の name を返す関数
function getName(person) {
  return person.name;
}
`,
  },
});
