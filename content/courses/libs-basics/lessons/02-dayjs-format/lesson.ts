import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "lib-02-dayjs-format",
  title: "dayjsで日付を整形",
  estMinutes: 5,
  runner: "dom",
  files: {
    "index.html": {
      // dayjs は読み込み済み。学習者は main.js だけを書く
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>dayjsで日付を整形</title>
  </head>
  <body>
    <h1>日付の表示</h1>
    <p>和風: <span id="jp"></span></p>
    <p>スラッシュ: <span id="slash"></span></p>
    <script src="/vendor/dayjs.min.js"></script>
    <script src="main.js"></script>
  </body>
</html>
`,
      editable: false,
    },
    "main.js": {
      initial: `// dayjs で固定の日付を整形する(現在時刻は使わない)
const day = dayjs("2026-01-01");

// day.format に書式を渡して、2 種類の文字列に整えよう
// 和風は "YYYY年MM月DD日"、スラッシュ区切りは "YYYY/MM/DD"
const jp = "";
const slash = "";

document.getElementById("jp").textContent = jp;
document.getElementById("slash").textContent = slash;
console.log(jp);
console.log(slash);
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
      pattern: "day\\.format\\(",
      message: "day.format(...) を使って日付を文字列に整えましょう",
    },
    {
      type: "text",
      id: "show-jp",
      selector: "#jp",
      equals: "2026年01月01日",
      message: '和風の表示を "YYYY年MM月DD日" の書式で 2026年01月01日 にしましょう',
    },
    {
      type: "text",
      id: "show-slash",
      selector: "#slash",
      equals: "2026/01/01",
      message: 'スラッシュ区切りの表示を "YYYY/MM/DD" の書式で 2026/01/01 にしましょう',
    },
    {
      type: "console",
      id: "log-both",
      lines: ["2026年01月01日", "2026/01/01"],
      message: "コンソールに 2026年01月01日 と 2026/01/01 を出力しましょう",
    },
  ],
  hints: [
    "dayjs で作った day に .format(書式) を呼ぶと、書式どおりの文字列が返ります",
    "YYYY は年 4 桁、MM は月 2 桁、DD は日 2 桁です。年月日やスラッシュはそのまま書けます",
    'jp は day.format("YYYY年MM月DD日")、slash は day.format("YYYY/MM/DD") にすれば完成です',
  ],
  solution: {
    "main.js": `const day = dayjs("2026-01-01");

const jp = day.format("YYYY年MM月DD日");
const slash = day.format("YYYY/MM/DD");

document.getElementById("jp").textContent = jp;
document.getElementById("slash").textContent = slash;
console.log(jp);
console.log(slash);
`,
  },
});
