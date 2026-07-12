import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "lib-int-08-mini-app",
  title: "総合: データ処理",
  estMinutes: 10,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>総合: データ処理</title>
  </head>
  <body>
    <h1>学習ログの集計</h1>
    <p>対象月: <span id="period"></span></p>
    <p>合計時間(分): <span id="total"></span></p>
    <p>科目別合計: <span id="bySubject"></span></p>
    <p>最長科目: <span id="top"></span></p>
    <script src="/vendor/dayjs.min.js"></script>
    <script src="/vendor/lodash.min.js"></script>
    <script src="main.js"></script>
  </body>
</html>
`,
      editable: false,
    },
    "main.js": {
      initial: `// 総合演習: 学習ログを dayjs と lodash で集計する
const logs = [
  { subject: "数学", date: "2026-02-10", minutes: 40 },
  { subject: "英語", date: "2026-02-11", minutes: 30 },
  { subject: "数学", date: "2026-02-12", minutes: 50 },
  { subject: "国語", date: "2026-02-13", minutes: 60 },
];
const month = dayjs("2026-02-01");

// (0) 対象月の見出し。month を "YYYY年MM月" で整形する
const period = "";

// (1) 合計学習時間(分)。_.sumBy を使う
const total = 0;

// (2) 科目ごとの合計時間。_.groupBy でまとめ、_.mapValues の中で _.sumBy を使う
//     期待する形: {"数学":90,"英語":30,"国語":60}
const bySubject = {};

// (3) 最も長く学習した科目名。bySubject を並べ替えて先頭を取る
const topSubject = "";

document.getElementById("period").textContent = period;
document.getElementById("total").textContent = String(total);
document.getElementById("bySubject").textContent = JSON.stringify(bySubject);
document.getElementById("top").textContent = topSubject;
console.log("対象月:", period);
console.log("合計時間:", total);
console.log("科目別:", JSON.stringify(bySubject));
console.log("最長科目:", topSubject);
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "fixed-date",
      file: "main.js",
      pattern: 'dayjs\\("2026-02-01"\\)',
      message: '判定を安定させるため、固定の日付 dayjs("2026-02-01") を使いましょう',
    },
    {
      type: "source",
      id: "use-format",
      file: "main.js",
      pattern: "\\.format\\(",
      message: "dayjs の format で対象月の見出しを整えましょう",
    },
    {
      type: "source",
      id: "use-sumby",
      file: "main.js",
      pattern: "_\\.sumBy\\(",
      message: "_.sumBy を使って合計時間や科目別の合計を求めましょう",
    },
    {
      type: "source",
      id: "use-groupby",
      file: "main.js",
      pattern: "_\\.groupBy\\(",
      message: "_.groupBy を使って科目ごとにまとめましょう",
    },
    {
      type: "text",
      id: "show-period",
      selector: "#period",
      equals: "2026年02月",
      message: "対象月が 2026年02月 と表示されるようにしましょう",
    },
    {
      type: "text",
      id: "show-total",
      selector: "#total",
      equals: "180",
      message: "合計学習時間 180 が表示されるようにしましょう",
    },
    {
      type: "text",
      id: "show-bysubject",
      selector: "#bySubject",
      equals: '{"数学":90,"英語":30,"国語":60}',
      message: '科目別合計 {"数学":90,"英語":30,"国語":60} が表示されるようにしましょう',
    },
    {
      type: "text",
      id: "show-top",
      selector: "#top",
      equals: "数学",
      message: "最も長く学習した科目 数学 が表示されるようにしましょう",
    },
    {
      type: "console",
      id: "log-all",
      lines: [
        "対象月: 2026年02月",
        "合計時間: 180",
        '科目別: {"数学":90,"英語":30,"国語":60}',
        "最長科目: 数学",
      ],
      message: "コンソールに 4 つの集計結果を出力しましょう",
    },
  ],
  hints: [
    "使う道具は 3 つです: dayjs の format(見出し)、_.sumBy(合計)、_.groupBy と _.mapValues(科目別の合計)",
    '科目別は _.mapValues(_.groupBy(logs, "subject"), (items) => _.sumBy(items, "minutes")) の形が定番です',
    '最長科目は bySubject を Object.entries で配列にし、_.orderBy(..., ["minutes"], ["desc"]) で並べて先頭の科目名を取ります',
  ],
  solution: {
    "main.js": `const logs = [
  { subject: "数学", date: "2026-02-10", minutes: 40 },
  { subject: "英語", date: "2026-02-11", minutes: 30 },
  { subject: "数学", date: "2026-02-12", minutes: 50 },
  { subject: "国語", date: "2026-02-13", minutes: 60 },
];
const month = dayjs("2026-02-01");

const period = month.format("YYYY年MM月");

const total = _.sumBy(logs, "minutes");

const bySubject = _.mapValues(_.groupBy(logs, "subject"), (items) => _.sumBy(items, "minutes"));

const topSubject = _.orderBy(
  Object.entries(bySubject).map(([subject, minutes]) => ({ subject, minutes })),
  ["minutes"],
  ["desc"],
)[0].subject;

document.getElementById("period").textContent = period;
document.getElementById("total").textContent = String(total);
document.getElementById("bySubject").textContent = JSON.stringify(bySubject);
document.getElementById("top").textContent = topSubject;
console.log("対象月:", period);
console.log("合計時間:", total);
console.log("科目別:", JSON.stringify(bySubject));
console.log("最長科目:", topSubject);
`,
  },
});
