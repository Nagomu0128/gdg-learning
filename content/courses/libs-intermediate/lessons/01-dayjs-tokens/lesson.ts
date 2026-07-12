import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "lib-int-01-dayjs-tokens",
  title: "dayjsの書式トークン",
  estMinutes: 6,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>dayjsの書式トークン</title>
  </head>
  <body>
    <h1>書式トークンを使い分ける</h1>
    <p>曜日: <span id="week"></span></p>
    <p>短い日付: <span id="short"></span></p>
    <p>フル表示: <span id="full"></span></p>
    <script src="/vendor/dayjs.min.js"></script>
    <script src="main.js"></script>
  </body>
</html>
`,
      editable: false,
    },
    "main.js": {
      initial: `// dayjs の書式トークンで、固定の日付をいろいろな見た目に整える
const day = dayjs("2026-01-01");

// (1) 曜日を出そう。format に "dddd" を渡す(dddd は曜日のトークン)
const week = "";

// (2) ゼロ埋めしない月日を出そう。format に "M月D日" を渡す
const short = "";

// (3) 年月日と曜日をまとめよう。format に "YYYY年MM月DD日 dddd" を渡す
const full = "";

document.getElementById("week").textContent = week;
document.getElementById("short").textContent = short;
document.getElementById("full").textContent = full;
console.log("曜日:", week);
console.log("短い日付:", short);
console.log("フル:", full);
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "fixed-date",
      file: "main.js",
      pattern: 'dayjs\\("2026-01-01"\\)',
      message: '判定を安定させるため、固定の日付 dayjs("2026-01-01") を使いましょう',
    },
    {
      type: "source",
      id: "use-format",
      file: "main.js",
      pattern: "\\.format\\(",
      message: "day.format(...) にトークンを渡して日付を整えましょう",
    },
    {
      type: "text",
      id: "show-week",
      selector: "#week",
      equals: "Thursday",
      message: 'dddd は曜日のトークンです。format("dddd") で Thursday が表示されるようにしましょう',
    },
    {
      type: "text",
      id: "show-short",
      selector: "#short",
      equals: "1月1日",
      message: 'M と D はゼロ埋めしないトークンです。format("M月D日") で 1月1日 にしましょう',
    },
    {
      type: "text",
      id: "show-full",
      selector: "#full",
      equals: "2026年01月01日 Thursday",
      message: 'トークンと文字を混ぜて "YYYY年MM月DD日 dddd" を渡し、2026年01月01日 Thursday にしましょう',
    },
    {
      type: "console",
      id: "log-all",
      lines: ["曜日: Thursday", "短い日付: 1月1日", "フル: 2026年01月01日 Thursday"],
      message: "コンソールに 3 つの整形結果を出力しましょう",
    },
  ],
  hints: [
    "format にトークンの文字列を渡すと、その形の文字列が返ります。dddd は曜日、M と D はゼロ埋めしない月・日です",
    'week は day.format("dddd")、short は day.format("M月D日") です',
    'full は day.format("YYYY年MM月DD日 dddd") のように、トークンと文字を自由に混ぜて書けます',
  ],
  solution: {
    "main.js": `const day = dayjs("2026-01-01");

const week = day.format("dddd");

const short = day.format("M月D日");

const full = day.format("YYYY年MM月DD日 dddd");

document.getElementById("week").textContent = week;
document.getElementById("short").textContent = short;
document.getElementById("full").textContent = full;
console.log("曜日:", week);
console.log("短い日付:", short);
console.log("フル:", full);
`,
  },
});
