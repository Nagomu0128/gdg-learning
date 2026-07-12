import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "lib-04-lodash-array",
  title: "lodashの配列ユーティリティ",
  estMinutes: 6,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>lodashの配列ユーティリティ</title>
  </head>
  <body>
    <h1>配列の加工</h1>
    <p>2個ずつに分割: <span id="chunked"></span></p>
    <p>重複を除去: <span id="uniq"></span></p>
    <script src="/vendor/lodash.min.js"></script>
    <script src="main.js"></script>
  </body>
</html>
`,
      editable: false,
    },
    "main.js": {
      initial: `// lodash(グローバル _)で配列を加工する
const numbers = [1, 2, 3, 4, 5];
const scores = [80, 80, 90, 100, 100, 100];

// (1) numbers を 2 個ずつのまとまりに分けよう。_.chunk を使う
const chunked = numbers;

// (2) scores から重複を取り除こう。_.uniq を使う
const unique = scores;

document.getElementById("chunked").textContent = JSON.stringify(chunked);
document.getElementById("uniq").textContent = JSON.stringify(unique);
console.log(JSON.stringify(chunked));
console.log(JSON.stringify(unique));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-chunk",
      file: "main.js",
      pattern: "_\\.chunk\\(",
      message: "_.chunk を使って numbers を 2 個ずつに分けましょう",
    },
    {
      type: "source",
      id: "use-uniq",
      file: "main.js",
      pattern: "_\\.uniq\\(",
      message: "_.uniq を使って scores の重複を取り除きましょう",
    },
    {
      type: "text",
      id: "show-chunked",
      selector: "#chunked",
      equals: "[[1,2],[3,4],[5]]",
      message: "2 個ずつに分けた [[1,2],[3,4],[5]] が表示されるようにしましょう",
    },
    {
      type: "text",
      id: "show-uniq",
      selector: "#uniq",
      equals: "[80,90,100]",
      message: "重複を除いた [80,90,100] が表示されるようにしましょう",
    },
    {
      type: "console",
      id: "log-both",
      lines: ["[[1,2],[3,4],[5]]", "[80,90,100]"],
      message: "コンソールに [[1,2],[3,4],[5]] と [80,90,100] を出力しましょう",
    },
  ],
  hints: [
    "lodash のユーティリティはすべて _ から呼び出します(例: _.chunk(...))",
    "_.chunk(配列, 個数) は指定した個数ごとの配列に分け、_.uniq(配列) は重複を 1 つにまとめます",
    "chunked は _.chunk(numbers, 2)、unique は _.uniq(scores) にすれば完成です",
  ],
  solution: {
    "main.js": `const numbers = [1, 2, 3, 4, 5];
const scores = [80, 80, 90, 100, 100, 100];

const chunked = _.chunk(numbers, 2);

const unique = _.uniq(scores);

document.getElementById("chunked").textContent = JSON.stringify(chunked);
document.getElementById("uniq").textContent = JSON.stringify(unique);
console.log(JSON.stringify(chunked));
console.log(JSON.stringify(unique));
`,
  },
});
