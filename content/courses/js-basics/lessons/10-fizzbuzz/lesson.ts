import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-10-fizzbuzz",
  title: "総合: FizzBuzz",
  estMinutes: 8,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// 総合問題 FizzBuzz
// 数値 n を受け取って、次のルールで文字列を返す関数をつくろう
//   - 3 の倍数なら "Fizz"
//   - 5 の倍数なら "Buzz"
//   - 3 と 5 の両方の倍数なら "FizzBuzz"
//   - どれでもなければ、数値を文字列にして返す(例: 7 なら "7")

function fizzbuzz(n) {
  // ここに書こう
}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(fizzbuzz(3));
console.log(fizzbuzz(5));
console.log(fizzbuzz(15));
console.log(fizzbuzz(7));
`,
    },
  },
  checks: [
    { type: "fn", id: "returns-fizz", name: "fizzbuzz", args: [3], returns: "Fizz" },
    { type: "fn", id: "returns-buzz", name: "fizzbuzz", args: [5], returns: "Buzz" },
    { type: "fn", id: "returns-fizzbuzz", name: "fizzbuzz", args: [15], returns: "FizzBuzz" },
    { type: "fn", id: "returns-number-string", name: "fizzbuzz", args: [7], returns: "7" },
    { type: "fn", id: "returns-fizz-again", name: "fizzbuzz", args: [6], returns: "Fizz" },
  ],
  hints: [
    "「3 の倍数」は n % 3 === 0 で判定できます。% は割り算の余りを求める演算子でした",
    "「両方の倍数」の判定をいちばん先に書きましょう。条件を「かつ」でつなぐには && を使います(n % 3 === 0 && n % 5 === 0)",
    "どの条件にも当てはまらないときは return String(n); で数値を文字列にして返します",
  ],
  solution: {
    "script.js": `// 総合問題 FizzBuzz
function fizzbuzz(n) {
  if (n % 3 === 0 && n % 5 === 0) {
    return "FizzBuzz";
  }
  if (n % 3 === 0) {
    return "Fizz";
  }
  if (n % 5 === 0) {
    return "Buzz";
  }
  return String(n);
}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(fizzbuzz(3));
console.log(fizzbuzz(5));
console.log(fizzbuzz(15));
console.log(fizzbuzz(7));
`,
  },
});
