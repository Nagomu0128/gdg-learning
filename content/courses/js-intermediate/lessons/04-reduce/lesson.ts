import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-int-04-reduce",
  title: "reduce で集計",
  estMinutes: 6,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// 配列の合計を返す関数
function total(numbers) {
  // ここで numbers.reduce を使って、合計を return しよう(初期値は 0)

}

// 配列の平均を返す関数
function average(numbers) {
  // ここで total と numbers.length を使って、平均を return しよう

}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(total([100, 200, 300]));
console.log(average([10, 20, 30]));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-reduce",
      file: "script.js",
      pattern: "\\.reduce\\(",
      message: "配列の reduce メソッドを使って書いてみましょう",
    },
    { type: "fn", id: "total-basic", name: "total", args: [[100, 200, 300]], returns: 600 },
    {
      type: "fn",
      id: "total-empty",
      name: "total",
      args: [[]],
      returns: 0,
      message: "空の配列のときは 0 を返すようにしましょう(reduce の 2 つ目の引数に初期値 0 を渡します)",
    },
    { type: "fn", id: "average-basic", name: "average", args: [[10, 20, 30]], returns: 20 },
    { type: "fn", id: "average-larger", name: "average", args: [[100, 200, 300, 400]], returns: 250 },
  ],
  hints: [
    "reduce には「(累計, 要素) => 次の累計」のアロー関数と、累計のスタート値(初期値)を渡します",
    "合計は numbers.reduce((sum, n) => sum + n, 0) の形です。平均は「合計 ÷ 個数」なので、total(numbers) を numbers.length で割ります",
    "total は return numbers.reduce((sum, n) => sum + n, 0); 、average は return total(numbers) / numbers.length; で完成です",
  ],
  solution: {
    "script.js": `// 配列の合計を返す関数
function total(numbers) {
  return numbers.reduce((sum, n) => sum + n, 0);
}

// 配列の平均を返す関数
function average(numbers) {
  return total(numbers) / numbers.length;
}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(total([100, 200, 300]));
console.log(average([10, 20, 30]));
`,
  },
});
