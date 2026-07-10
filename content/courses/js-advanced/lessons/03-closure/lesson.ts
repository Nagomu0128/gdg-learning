import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-adv-03-closure",
  title: "クロージャ",
  estMinutes: 7,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// カウンターを作る関数 makeCounter
// 呼び出すたびに 1, 2, 3, ... と数える関数を返す
function makeCounter() {
  let count = 0;
  // ここに「呼ばれるたびに count を1増やして、その値を返す関数」を
  // return function () { ... }; の形で書こう

}

// 動作確認・判定用(そのままでOK)
function makeCounterResult() {
  const counter = makeCounter();
  return [counter(), counter(), counter()];
}

// 判定用: 2つのカウンターが独立して数えることを確かめる(そのままでOK)
function twoCountersResult() {
  const counterA = makeCounter();
  const counterB = makeCounter();
  return [counterA(), counterA(), counterB()];
}

console.log(makeCounterResult());
`,
    },
  },
  checks: [
    {
      id: "declare-make-counter",
      type: "source",
      file: "script.js",
      pattern: "function\\s+makeCounter",
      message: "makeCounter という名前の関数を function で宣言しましょう",
    },
    {
      id: "counter-counts-up",
      type: "fn",
      name: "makeCounterResult",
      args: [],
      returns: [1, 2, 3],
      message: "makeCounter() が返す関数は、呼ばれるたびに 1, 2, 3 と数えるようにしましょう",
    },
    {
      id: "counters-independent",
      type: "fn",
      name: "twoCountersResult",
      args: [],
      returns: [1, 2, 1],
      message:
        "カウンターは1つずつ独立して数えるようにしましょう(count は makeCounter の中で宣言したままにします)",
    },
  ],
  hints: [
    "関数の中で新しい関数を作って return できます。返された関数は、外側の変数 count を覚え続けます(これがクロージャです)",
    "return function () { ... }; の形です。中では count を1増やしてから return count; します",
    "return function () { count = count + 1; return count; }; と書けば完成です",
  ],
  solution: {
    "script.js": `// カウンターを作る関数 makeCounter
// 呼び出すたびに 1, 2, 3, ... と数える関数を返す
function makeCounter() {
  let count = 0;
  return function () {
    count = count + 1;
    return count;
  };
}

// 動作確認・判定用(そのままでOK)
function makeCounterResult() {
  const counter = makeCounter();
  return [counter(), counter(), counter()];
}

// 判定用: 2つのカウンターが独立して数えることを確かめる(そのままでOK)
function twoCountersResult() {
  const counterA = makeCounter();
  const counterB = makeCounter();
  return [counterA(), counterA(), counterB()];
}

console.log(makeCounterResult());
`,
  },
});
