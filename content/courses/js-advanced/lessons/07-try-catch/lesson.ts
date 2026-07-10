import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-adv-07-try-catch",
  title: "エラーに備える",
  estMinutes: 6,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// JSON の文字列をオブジェクトに変換する関数
// ただし、変換に失敗したら null を返す
function safeParse(text) {
  // ここに try...catch を書こう
  //   うまくいく場合: JSON.parse(text) の結果を return する
  //   失敗した場合: null を return する
}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(safeParse('{"a":1}'));
console.log(safeParse("これはJSONではない"));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "uses-try-catch",
      file: "script.js",
      pattern: "try\\s*\\{",
      message: "try { ... } catch (error) { ... } の形で、エラーが起きるかもしれない処理を囲みましょう",
    },
    {
      type: "fn",
      id: "parses-valid-json",
      name: "safeParse",
      args: ['{"a":1}'],
      returns: { a: 1 },
      message:
        "正しい JSON の文字列を渡したら、JSON.parse で変換したオブジェクトが返るようにしましょう(try の中で return します)",
    },
    {
      type: "fn",
      id: "returns-null-on-invalid",
      name: "safeParse",
      args: ["×"],
      returns: null,
      message:
        "JSON に変換できない文字列を渡したときは null が返るようにしましょう(catch の中で return null します)",
    },
  ],
  hints: [
    "エラーが起きそうな処理(今回は JSON.parse)を try のブロックに、失敗したときの処理を catch のブロックに書きます。エラーが起きた瞬間に catch へ飛びます",
    "try の中は return JSON.parse(text); の1行だけです。成功すれば、この値がそのまま関数の戻り値になります",
    "全体はこうなります: try { return JSON.parse(text); } catch (error) { return null; }",
  ],
  solution: {
    "script.js": `// JSON の文字列をオブジェクトに変換する関数
// ただし、変換に失敗したら null を返す
function safeParse(text) {
  try {
    // 成功すれば、変換したオブジェクトがそのまま戻り値になる
    return JSON.parse(text);
  } catch (error) {
    // JSON.parse が失敗すると、ここに飛んでくる
    return null;
  }
}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(safeParse('{"a":1}'));
console.log(safeParse("これはJSONではない"));
`,
  },
});
