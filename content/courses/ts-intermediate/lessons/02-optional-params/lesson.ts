import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "ts-int-02-optional-params",
  title: "オプション引数とデフォルト",
  estMinutes: 6,
  runner: "worker",
  files: {
    "script.ts": {
      initial: `// 関数の引数には「省略できる」印や「省略したときの初期値」を付けられます。
//   ・引数名のうしろに ? を付けると「省略してもよい」引数になる
//   ・引数名のうしろに = 値 を付けると「省略したときの初期値」になる

// 1) makeLabel: text は文字列。count は省略してもよい数値にしよう。
//    count があれば "text (count)"、なければ text だけを返す。
function makeLabel(text, count) {
  // count があるか(省略された = undefined か)で分けて返そう

}

// 2) repeat: text を times 回くり返して返す。times は省略時に 2 になるようにしよう。
function repeat(text, times) {
  // text.repeat(times) を返そう

}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(makeLabel("箱"));
console.log(makeLabel("箱", 3));
console.log(repeat("ア"));
console.log(repeat("ア", 3));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "optional-param",
      file: "script.ts",
      pattern: "makeLabel\\s*\\(\\s*text\\s*:\\s*string\\s*,\\s*count\\s*\\?\\s*:\\s*number\\s*\\)",
      message:
        "makeLabel の count を省略可能にしましょう(makeLabel(text: string, count?: number) の形。? は引数名のうしろに付けます)",
    },
    {
      type: "source",
      id: "default-param",
      file: "script.ts",
      pattern: "repeat\\s*\\(\\s*text\\s*:\\s*string\\s*,\\s*times\\s*:\\s*number\\s*=\\s*2\\s*\\)",
      message: "repeat の times に初期値 2 を付けましょう(repeat(text: string, times: number = 2) の形)",
    },
    {
      type: "fn",
      id: "label-without-count",
      name: "makeLabel",
      args: ["箱"],
      returns: "箱",
      message: "count を省略したときは text だけを返すようにしましょう(count === undefined のとき)",
    },
    {
      type: "fn",
      id: "label-with-count",
      name: "makeLabel",
      args: ["箱", 3],
      returns: "箱 (3)",
      message: 'count があるときは "text (count)" の形で返しましょう(例: 箱 (3))',
    },
    {
      type: "fn",
      id: "repeat-default",
      name: "repeat",
      args: ["ア"],
      returns: "アア",
      message: "times を省略したときは 2 回くり返すようにしましょう(初期値 2)",
    },
    {
      type: "fn",
      id: "repeat-explicit",
      name: "repeat",
      args: ["ア", 3],
      returns: "アアア",
      message: "times を渡したときはその回数だけくり返すようにしましょう",
    },
  ],
  hints: [
    "引数名のうしろに ? を付けると省略可能に、= 値 を付けると省略時の初期値になります。省略された引数は undefined になります",
    "makeLabel(text: string, count?: number) とし、中では if (count === undefined) で分けます。repeat(text: string, times: number = 2) とすれば times は省略時 2 です",
    'makeLabel は if (count === undefined) { return text; } のあと return text + " (" + count + ")";、repeat は return text.repeat(times); で完成です',
  ],
  solution: {
    "script.ts": `function makeLabel(text: string, count?: number): string {
  if (count === undefined) {
    return text;
  }
  return text + " (" + count + ")";
}

function repeat(text: string, times: number = 2): string {
  return text.repeat(times);
}

console.log(makeLabel("箱"));
console.log(makeLabel("箱", 3));
console.log(repeat("ア"));
console.log(repeat("ア", 3));
`,
  },
});
