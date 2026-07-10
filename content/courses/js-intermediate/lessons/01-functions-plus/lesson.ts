import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-int-01-functions-plus",
  title: "関数式とアロー関数",
  estMinutes: 4,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// n を 2 倍にして返すアロー関数をつくり、const で変数 twice に入れよう
// (書き方の形は「やってみよう」スライドにあります)


// twice を使って 2 倍を計算する関数(そのままでOK)
function double(n) {
  return twice(n);
}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(double(5));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-arrow",
      file: "script.js",
      pattern: "=>",
      message: "アロー関数(=>)を使って書いてみましょう",
    },
    {
      type: "source",
      id: "define-twice",
      file: "script.js",
      pattern: "const\\s+twice\\s*=",
      message: "2 倍にして返すアロー関数を、const で変数 twice に入れましょう",
    },
    { type: "fn", id: "double-basic", name: "double", args: [5], returns: 10 },
    { type: "fn", id: "double-second", name: "double", args: [12], returns: 24 },
  ],
  hints: [
    "アロー関数は (引数) => 式 の形で書きます。=> の右側に書いた式の結果が、そのまま返り値になります",
    "「n を 2 倍にして返す」は (n) => n * 2 と書けます。これを const twice = に代入します",
    "const twice = (n) => n * 2; の 1 行を書けば完成です",
  ],
  solution: {
    "script.js": `// n を 2 倍にして返すアロー関数を、const で変数 twice に入れる
const twice = (n) => n * 2;

// twice を使って 2 倍を計算する関数(そのままでOK)
function double(n) {
  return twice(n);
}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(double(5));
`,
  },
});
