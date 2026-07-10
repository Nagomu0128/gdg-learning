import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-adv-09-regex",
  title: "正規表現入門",
  estMinutes: 6,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// 郵便番号の形(数字3桁-数字4桁。例: 123-4567)かどうかを判定する関数
function isPostalCode(text) {
  // ここに「数字3桁、ハイフン、数字4桁」の正規表現を書いて、
  // .test(text) の結果を return しよう
  // ちょうどこの形だけを true にする(^ と $ を忘れずに)
}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(isPostalCode("123-4567"));
console.log(isPostalCode("1234567"));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "postal-pattern-written",
      file: "script.js",
      pattern: "(\\\\d|\\[0-9\\])\\{3\\}-(\\\\d|\\[0-9\\])\\{4\\}",
      message: "「数字3桁、ハイフン、数字4桁」を表す \\d{3}-\\d{4} のパターンをコードに書きましょう",
    },
    {
      type: "fn",
      id: "accepts-valid-postal",
      name: "isPostalCode",
      args: ["123-4567"],
      returns: true,
    },
    {
      type: "fn",
      id: "rejects-missing-hyphen",
      name: "isPostalCode",
      args: ["1234567"],
      returns: false,
      message: "ハイフンのない「1234567」は郵便番号の形ではないので、false を返すようにしましょう",
    },
    {
      type: "fn",
      id: "rejects-wrong-shape",
      name: "isPostalCode",
      args: ["12-3456"],
      returns: false,
      message:
        "「12-3456」のように桁数が違うものは false を返すようにしましょう({3} と {4} で桁数を指定します)",
    },
  ],
  hints: [
    "正規表現は /パターン/ の形で書き、パターン.test(文字列) は「形が合っていれば true」を返します",
    "数字1文字は \\d、直前の3回くり返しは {3} です。「数字3桁、ハイフン、数字4桁」は \\d{3}-\\d{4} になります",
    "前後に ^(最初)と $(最後)を付けて、return /^\\d{3}-\\d{4}$/.test(text); と書きましょう",
  ],
  solution: {
    "script.js": `// 郵便番号の形(数字3桁-数字4桁。例: 123-4567)かどうかを判定する関数
function isPostalCode(text) {
  // ^ と $ で「最初から最後までちょうどこの形」だけを合格にする
  return /^\\d{3}-\\d{4}$/.test(text);
}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(isPostalCode("123-4567"));
console.log(isPostalCode("1234567"));
`,
  },
});
