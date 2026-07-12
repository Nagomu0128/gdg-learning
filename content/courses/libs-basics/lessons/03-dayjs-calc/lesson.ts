import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "lib-03-dayjs-calc",
  title: "dayjsで日付を計算",
  estMinutes: 6,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>dayjsで日付を計算</title>
  </head>
  <body>
    <h1>予定の計算</h1>
    <p>7日後: <span id="due"></span></p>
    <p>期間(日数): <span id="span"></span></p>
    <script src="/vendor/dayjs.min.js"></script>
    <script src="main.js"></script>
  </body>
</html>
`,
      editable: false,
    },
    "main.js": {
      initial: `// 基準日は固定にする(現在時刻は使わない)
const base = dayjs("2026-01-01");
const goal = dayjs("2026-03-01");

// (1) base の 7 日後を求めよう。add(7, "day") を使う
const due = base;

// (2) base から goal までの日数を求めよう。diff(base, "day") を使う
const span = 0;

document.getElementById("due").textContent = due.format("YYYY-MM-DD");
document.getElementById("span").textContent = String(span);
console.log(due.format("YYYY-MM-DD"));
console.log(span);
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "fixed-base",
      file: "main.js",
      pattern: 'dayjs\\("2026-01-01"\\)',
      message: '判定を安定させるため、基準日は固定の dayjs("2026-01-01") を使いましょう',
    },
    {
      type: "source",
      id: "use-add",
      file: "main.js",
      pattern: "\\.add\\(",
      message: "add を使って base の 7 日後を求めましょう",
    },
    {
      type: "source",
      id: "use-diff",
      file: "main.js",
      pattern: "\\.diff\\(",
      message: "diff を使って base から goal までの日数を求めましょう",
    },
    {
      type: "text",
      id: "show-due",
      selector: "#due",
      equals: "2026-01-08",
      message: '7日後が 2026-01-08 と表示されるようにしましょう(add(7, "day"))',
    },
    {
      type: "text",
      id: "show-span",
      selector: "#span",
      equals: "59",
      message: "base から goal までの日数 59 が表示されるようにしましょう(diff)",
    },
    {
      type: "console",
      id: "log-both",
      lines: ["2026-01-08", "59"],
      message: "コンソールに 2026-01-08 と 59 を出力しましょう",
    },
  ],
  hints: [
    "add は「ずらした新しい日付」を、diff は「2 つの日付の差(数値)」を返します",
    'add の単位は "day"、diff も第 2 引数に "day" を渡すと日数になります',
    'due は base.add(7, "day")、span は goal.diff(base, "day") にすれば完成です',
  ],
  solution: {
    "main.js": `const base = dayjs("2026-01-01");
const goal = dayjs("2026-03-01");

const due = base.add(7, "day");

const span = goal.diff(base, "day");

document.getElementById("due").textContent = due.format("YYYY-MM-DD");
document.getElementById("span").textContent = String(span);
console.log(due.format("YYYY-MM-DD"));
console.log(span);
`,
  },
});
