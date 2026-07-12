import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "lib-int-07-combine-aggregate",
  title: "複数ライブラリで集計",
  estMinutes: 8,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>複数ライブラリで集計</title>
  </head>
  <body>
    <h1>売上をカテゴリ別に集計</h1>
    <p>集計月: <span id="title"></span></p>
    <p>カテゴリ別合計: <span id="byCategory"></span></p>
    <script src="/vendor/dayjs.min.js"></script>
    <script src="/vendor/lodash.min.js"></script>
    <script src="main.js"></script>
  </body>
</html>
`,
      editable: false,
    },
    "main.js": {
      initial: `// dayjs と lodash を組み合わせて、売上をカテゴリ別に集計する
const sales = [
  { date: "2026-01-05", category: "食品", amount: 300 },
  { date: "2026-01-05", category: "日用品", amount: 150 },
  { date: "2026-01-06", category: "食品", amount: 200 },
  { date: "2026-01-06", category: "食品", amount: 100 },
];
const reportMonth = dayjs("2026-01-31");

// (1) 集計月の見出しを作ろう。reportMonth を "YYYY年MM月" で整形する
const title = "";

// (2) カテゴリ別の合計金額を出そう。
//     _.groupBy でカテゴリごとにまとめ、_.mapValues の中で _.sumBy を使って金額を合計する
const byCategory = {};

document.getElementById("title").textContent = title;
document.getElementById("byCategory").textContent = JSON.stringify(byCategory);
console.log("集計月:", title);
console.log("カテゴリ別:", JSON.stringify(byCategory));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "fixed-date",
      file: "main.js",
      pattern: 'dayjs\\("2026-01-31"\\)',
      message: '判定を安定させるため、固定の日付 dayjs("2026-01-31") を使いましょう',
    },
    {
      type: "source",
      id: "use-format",
      file: "main.js",
      pattern: "\\.format\\(",
      message: "dayjs の format で集計月の見出しを整えましょう",
    },
    {
      type: "source",
      id: "use-groupby",
      file: "main.js",
      pattern: "_\\.groupBy\\(",
      message: "_.groupBy を使って sales をカテゴリごとにまとめましょう",
    },
    {
      type: "source",
      id: "use-sumby",
      file: "main.js",
      pattern: "_\\.sumBy\\(",
      message: "_.sumBy を使って各カテゴリの amount を合計しましょう",
    },
    {
      type: "text",
      id: "show-title",
      selector: "#title",
      equals: "2026年01月",
      message: '集計月が "YYYY年MM月" の書式で 2026年01月 と表示されるようにしましょう',
    },
    {
      type: "text",
      id: "show-bycategory",
      selector: "#byCategory",
      equals: '{"食品":600,"日用品":150}',
      message: 'カテゴリ別合計 {"食品":600,"日用品":150} が表示されるようにしましょう',
    },
    {
      type: "console",
      id: "log-both",
      lines: ["集計月: 2026年01月", 'カテゴリ別: {"食品":600,"日用品":150}'],
      message: "コンソールに集計月とカテゴリ別合計を出力しましょう",
    },
  ],
  hints: [
    '見出しは reportMonth.format("YYYY年MM月")、集計は _.groupBy と _.sumBy を組み合わせます',
    '_.groupBy(sales, "category") でカテゴリごとの配列にまとめ、_.mapValues で各配列を _.sumBy(items, "amount") に置きかえます',
    'byCategory は _.mapValues(_.groupBy(sales, "category"), (items) => _.sumBy(items, "amount")) です',
  ],
  solution: {
    "main.js": `const sales = [
  { date: "2026-01-05", category: "食品", amount: 300 },
  { date: "2026-01-05", category: "日用品", amount: 150 },
  { date: "2026-01-06", category: "食品", amount: 200 },
  { date: "2026-01-06", category: "食品", amount: 100 },
];
const reportMonth = dayjs("2026-01-31");

const title = reportMonth.format("YYYY年MM月");

const byCategory = _.mapValues(_.groupBy(sales, "category"), (items) => _.sumBy(items, "amount"));

document.getElementById("title").textContent = title;
document.getElementById("byCategory").textContent = JSON.stringify(byCategory);
console.log("集計月:", title);
console.log("カテゴリ別:", JSON.stringify(byCategory));
`,
  },
});
