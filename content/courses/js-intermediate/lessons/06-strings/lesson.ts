import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-int-06-strings",
  title: "文字列を加工する",
  estMinutes: 6,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// フルネーム(例: "Taro Yamada")からイニシャル(例: "T.Y")を返す関数
function initials(fullName) {
  // 1. ここで fullName を split で 2 つの単語に分けよう

  // 2. ここで各単語の先頭の文字を取り出して、大文字にしよう

  // 3. ここでテンプレートリテラルを使って「T.Y」の形にして return しよう

}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(initials("Taro Yamada"));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-template-literal",
      file: "script.js",
      pattern: "\\$\\{",
      message: "テンプレートリテラル(バッククォートで囲む書き方)を使って文字列を組み立てましょう",
    },
    {
      type: "source",
      id: "use-split",
      file: "script.js",
      pattern: "\\.split\\(",
      message: "文字列の split メソッドで、フルネームを 2 つの単語に分けましょう",
    },
    { type: "fn", id: "initials-basic", name: "initials", args: ["Taro Yamada"], returns: "T.Y" },
    { type: "fn", id: "initials-other", name: "initials", args: ["Hanako Sato"], returns: "H.S" },
    {
      type: "fn",
      id: "initials-lowercase",
      name: "initials",
      args: ["jiro suzuki"],
      returns: "J.S",
      message: "小文字の名前でも大文字のイニシャルになるように、toUpperCase() を使いましょう",
    },
  ],
  hints: [
    'split(" ") で ["Taro", "Yamada"] のような配列にしてから、各単語の先頭 1 文字を取り出して組み立てます',
    'const parts = fullName.split(" "); と分けると、parts[0][0] が名の頭文字、parts[1][0] が姓の頭文字です。.toUpperCase() を付けて大文字にします',
    `const first = parts[0][0].toUpperCase(); と const last = parts[1][0].toUpperCase(); を作り、return \`\${first}.\${last}\`; で完成です`,
  ],
  solution: {
    "script.js": `// フルネーム(例: "Taro Yamada")からイニシャル(例: "T.Y")を返す関数
function initials(fullName) {
  const parts = fullName.split(" ");
  const first = parts[0][0].toUpperCase();
  const last = parts[1][0].toUpperCase();
  return \`\${first}.\${last}\`;
}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(initials("Taro Yamada"));
`,
  },
});
