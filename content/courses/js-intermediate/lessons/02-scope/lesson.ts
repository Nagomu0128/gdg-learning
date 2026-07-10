import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-int-02-scope",
  title: "スコープを理解する",
  estMinutes: 5,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// 0 から 2 回カウントアップして、[1, 2] を返す関数
function counterDemo() {
  // ここに let を使って count を宣言し、0 を入れよう

  const results = [];

  // 1 回目のカウントアップ(お手本)
  count = count + 1;
  results.push(count);

  // ここに 2 回目のカウントアップを、お手本と同じ 2 行で書こう


  return results;
}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(counterDemo());
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-let",
      file: "script.js",
      pattern: "let\\s+count",
      message: "count は、あとから値を変えられる let で宣言しましょう",
    },
    {
      type: "fn",
      id: "counter-returns",
      name: "counterDemo",
      args: [],
      returns: [1, 2],
      message:
        "counterDemo() が [1, 2] を返すようにしましょう。count を 1 増やして results に入れる、を 2 回くり返します",
    },
    {
      type: "fn",
      id: "counter-fresh",
      name: "counterDemo",
      args: [],
      returns: [1, 2],
      message:
        "counterDemo() は、何回呼んでも同じ [1, 2] を返すようにしましょう。count が関数の外にあると、呼ぶたびに増えてしまいます",
    },
  ],
  hints: [
    "count は counterDemo の中だけで使う変数です。関数の中で宣言すると、呼び出すたびに 0 から作り直されます",
    "あとから count = count + 1 と値を変えるので、const ではなく let count = 0; と宣言します",
    "関数の最初に let count = 0; を書き、お手本の下に count = count + 1; と results.push(count); をもう 1 セット書けば完成です",
  ],
  solution: {
    "script.js": `// 0 から 2 回カウントアップして、[1, 2] を返す関数
function counterDemo() {
  let count = 0;

  const results = [];

  // 1 回目のカウントアップ(お手本)
  count = count + 1;
  results.push(count);

  // 2 回目のカウントアップ
  count = count + 1;
  results.push(count);

  return results;
}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(counterDemo());
`,
  },
});
