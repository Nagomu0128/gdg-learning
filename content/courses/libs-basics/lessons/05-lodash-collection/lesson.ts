import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "lib-05-lodash-collection",
  title: "lodashでデータ集計",
  estMinutes: 7,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>lodashでデータ集計</title>
  </head>
  <body>
    <h1>買い物データの集計</h1>
    <p>フルーツの数: <span id="fruits"></span></p>
    <p>合計金額: <span id="total"></span></p>
    <script src="/vendor/lodash.min.js"></script>
    <script src="main.js"></script>
  </body>
</html>
`,
      editable: false,
    },
    "main.js": {
      initial: `// lodash でデータを集計する
const items = [
  { name: "りんご", type: "fruit", price: 120 },
  { name: "にんじん", type: "veg", price: 80 },
  { name: "みかん", type: "fruit", price: 100 },
  { name: "なす", type: "veg", price: 90 },
];

// (1) type ごとにグループ分けしよう。_.groupBy を使う
const grouped = {};

// (2) price の合計を求めよう。_.sumBy を使う
const total = 0;

const fruitCount = (grouped.fruit || []).length;
document.getElementById("fruits").textContent = String(fruitCount);
document.getElementById("total").textContent = String(total);
console.log("フルーツ:", fruitCount);
console.log("合計:", total);
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-groupby",
      file: "main.js",
      pattern: "_\\.groupBy\\(",
      message: "_.groupBy を使って items を type ごとに分けましょう",
    },
    {
      type: "source",
      id: "use-sumby",
      file: "main.js",
      pattern: "_\\.sumBy\\(",
      message: "_.sumBy を使って price の合計を求めましょう",
    },
    {
      type: "text",
      id: "show-fruits",
      selector: "#fruits",
      equals: "2",
      message: "フルーツ(type が fruit)の数 2 が表示されるようにしましょう",
    },
    {
      type: "text",
      id: "show-total",
      selector: "#total",
      equals: "390",
      message: "price の合計 390 が表示されるようにしましょう",
    },
    {
      type: "console",
      id: "log-both",
      lines: ["フルーツ: 2", "合計: 390"],
      message: "コンソールに「フルーツ: 2」と「合計: 390」を出力しましょう",
    },
  ],
  hints: [
    "_.groupBy(配列, キー名) は、同じキーの値ごとにまとめたオブジェクトを返します",
    '_.groupBy(items, "type") の結果は { fruit: [...], veg: [...] } の形になります。grouped.fruit がフルーツの配列です',
    'grouped は _.groupBy(items, "type")、total は _.sumBy(items, "price") にすれば完成です',
  ],
  solution: {
    "main.js": `const items = [
  { name: "りんご", type: "fruit", price: 120 },
  { name: "にんじん", type: "veg", price: 80 },
  { name: "みかん", type: "fruit", price: 100 },
  { name: "なす", type: "veg", price: 90 },
];

const grouped = _.groupBy(items, "type");

const total = _.sumBy(items, "price");

const fruitCount = (grouped.fruit || []).length;
document.getElementById("fruits").textContent = String(fruitCount);
document.getElementById("total").textContent = String(total);
console.log("フルーツ:", fruitCount);
console.log("合計:", total);
`,
  },
});
