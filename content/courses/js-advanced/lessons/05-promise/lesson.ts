import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-adv-05-promise",
  title: "Promise 入門",
  estMinutes: 7,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// 300ミリ秒後に "done" で解決する Promise を返す関数 delayedValue
function delayedValue() {
  // ここに Promise を作って return する処理を書こう
  //   1. resolve を受け取る関数を渡して、Promise を new する
  //   2. その中で、300ミリ秒後に resolve("done") を呼ぶタイマーをしかける

}

// 動作確認用(そのままでOK): 解決すると結果がコンソールに表示される
delayedValue().then((value) => {
  console.log(value);
});
`,
    },
  },
  checks: [
    {
      id: "use-new-promise",
      type: "source",
      file: "script.js",
      pattern: "new\\s+Promise",
      message: "new Promise((resolve) => { ... }) の形で Promise を作りましょう",
    },
    {
      id: "use-settimeout",
      type: "source",
      file: "script.js",
      pattern: "setTimeout",
      message: "setTimeout を使って、300ミリ秒後に resolve するようにしましょう",
    },
    {
      id: "resolves-done",
      type: "fn",
      name: "delayedValue",
      args: [],
      returns: "done",
      message: 'delayedValue() が返す Promise が "done" で解決するようにしましょう',
    },
  ],
  hints: [
    "Promise は「あとで値が届く約束」です。new Promise((resolve) => { ... }) で作り、resolve(値) が呼ばれた瞬間にその値で解決します",
    'Promise の中で setTimeout(() => { ... }, 300) を使い、300ミリ秒後に resolve("done") を呼びます',
    'return new Promise((resolve) => { setTimeout(() => { resolve("done"); }, 300); }); と書けば完成です',
  ],
  solution: {
    "script.js": `// 300ミリ秒後に "done" で解決する Promise を返す関数 delayedValue
function delayedValue() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("done");
    }, 300);
  });
}

// 動作確認用(そのままでOK): 解決すると結果がコンソールに表示される
delayedValue().then((value) => {
  console.log(value);
});
`,
  },
});
