import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "lib-08-combine",
  title: "総合: 複数ライブラリ",
  estMinutes: 8,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>総合: 複数ライブラリ</title>
  </head>
  <body>
    <h1>タスクのまとめ</h1>
    <p>締め切り: <span id="deadline"></span></p>
    <p>合計ポイント: <span id="points"></span></p>
    <script src="/vendor/dayjs.min.js"></script>
    <script src="/vendor/lodash.min.js"></script>
    <script src="main.js"></script>
  </body>
</html>
`,
      editable: false,
    },
    "main.js": {
      initial: `// dayjs と lodash を組み合わせて、タスクのまとめを表示しよう
const deadlineDate = dayjs("2026-04-01");
const tasks = [
  { title: "資料作成", points: 3 },
  { title: "レビュー", points: 2 },
  { title: "公開", points: 5 },
];

// (1) deadlineDate を "2026年04月01日" の形にして deadline に入れよう
const deadline = "";

// (2) tasks の points の合計を total に入れよう
const total = 0;

document.getElementById("deadline").textContent = deadline;
document.getElementById("points").textContent = String(total);
console.log("締め切り:", deadline);
console.log("合計ポイント:", total);
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "fixed-date",
      file: "main.js",
      pattern: 'dayjs\\("2026-04-01"\\)',
      message: '判定を安定させるため、締め切りは固定の dayjs("2026-04-01") を使いましょう',
    },
    {
      type: "source",
      id: "use-format",
      file: "main.js",
      pattern: "\\.format\\(",
      message: "dayjs の format を使って締め切りを整形しましょう",
    },
    {
      type: "source",
      id: "use-sumby",
      file: "main.js",
      pattern: "_\\.sumBy\\(",
      message: "lodash の _.sumBy を使って points の合計を求めましょう",
    },
    {
      type: "text",
      id: "show-deadline",
      selector: "#deadline",
      equals: "2026年04月01日",
      message: "締め切りが 2026年04月01日 と表示されるようにしましょう",
    },
    {
      type: "text",
      id: "show-points",
      selector: "#points",
      equals: "10",
      message: "points の合計 10 が表示されるようにしましょう",
    },
    {
      type: "console",
      id: "log-both",
      lines: ["締め切り: 2026年04月01日", "合計ポイント: 10"],
      message: "コンソールに「締め切り: 2026年04月01日」と「合計ポイント: 10」を出力しましょう",
    },
  ],
  hints: [
    "2 つのライブラリはどちらも読み込み済みです。dayjs の format と lodash の _.sumBy を思い出しましょう",
    'format には書式 "YYYY年MM月DD日" を渡します。_.sumBy には配列と合計するキー "points" を渡します',
    'deadline は deadlineDate.format("YYYY年MM月DD日")、total は _.sumBy(tasks, "points") にすれば完成です',
  ],
  solution: {
    "main.js": `const deadlineDate = dayjs("2026-04-01");
const tasks = [
  { title: "資料作成", points: 3 },
  { title: "レビュー", points: 2 },
  { title: "公開", points: 5 },
];

const deadline = deadlineDate.format("YYYY年MM月DD日");

const total = _.sumBy(tasks, "points");

document.getElementById("deadline").textContent = deadline;
document.getElementById("points").textContent = String(total);
console.log("締め切り:", deadline);
console.log("合計ポイント:", total);
`,
  },
});
