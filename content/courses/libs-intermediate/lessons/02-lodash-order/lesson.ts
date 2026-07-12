import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "lib-int-02-lodash-order",
  title: "lodashで並べ替え",
  estMinutes: 7,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>lodashで並べ替え</title>
  </head>
  <body>
    <h1>メンバーを並べ替える</h1>
    <p>年齢が若い順: <span id="byAge"></span></p>
    <p>成績ランキング: <span id="byRank"></span></p>
    <script src="/vendor/lodash.min.js"></script>
    <script src="main.js"></script>
  </body>
</html>
`,
      editable: false,
    },
    "main.js": {
      initial: `// lodash で配列を並べ替える(元の配列は変わらず、新しい配列が返る)
const members = [
  { name: "佐藤", age: 28, score: 90 },
  { name: "鈴木", age: 34, score: 90 },
  { name: "田中", age: 22, score: 85 },
];

// (1) age が小さい順に並べ、名前だけの配列にしよう。_.sortBy を使う
const byAge = [];

// (2) score が高い順、同点なら age が小さい順に並べ、名前だけにしよう。_.orderBy を使う
const byRank = [];

document.getElementById("byAge").textContent = JSON.stringify(byAge);
document.getElementById("byRank").textContent = JSON.stringify(byRank);
console.log("年齢順:", JSON.stringify(byAge));
console.log("ランキング:", JSON.stringify(byRank));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-sortby",
      file: "main.js",
      pattern: "_\\.sortBy\\(",
      message: "_.sortBy を使って age の小さい順に並べましょう",
    },
    {
      type: "source",
      id: "use-orderby",
      file: "main.js",
      pattern: "_\\.orderBy\\(",
      message: "_.orderBy を使って score と age の 2 条件で並べましょう",
    },
    {
      type: "text",
      id: "show-byage",
      selector: "#byAge",
      equals: '["田中","佐藤","鈴木"]',
      message: "年齢が若い順 [田中, 佐藤, 鈴木] の名前配列が表示されるようにしましょう",
    },
    {
      type: "text",
      id: "show-byrank",
      selector: "#byRank",
      equals: '["佐藤","鈴木","田中"]',
      message: "成績が高い順(同点は年齢が若い順)[佐藤, 鈴木, 田中] にしましょう",
    },
    {
      type: "console",
      id: "log-both",
      lines: ['年齢順: ["田中","佐藤","鈴木"]', 'ランキング: ["佐藤","鈴木","田中"]'],
      message: "コンソールに 2 つの並べ替え結果を出力しましょう",
    },
  ],
  hints: [
    '_.sortBy(配列, "キー") はそのキーの小さい順に並べます。並べたあと .map で名前だけ取り出します',
    '複数条件は _.orderBy(配列, ["キー1", "キー2"], ["desc", "asc"]) のように、キーと向きを配列で指定します',
    'byAge は _.sortBy(members, "age").map((m) => m.name)、byRank は _.orderBy(members, ["score", "age"], ["desc", "asc"]).map((m) => m.name) です',
  ],
  solution: {
    "main.js": `const members = [
  { name: "佐藤", age: 28, score: 90 },
  { name: "鈴木", age: 34, score: 90 },
  { name: "田中", age: 22, score: 85 },
];

const byAge = _.sortBy(members, "age").map((m) => m.name);

const byRank = _.orderBy(members, ["score", "age"], ["desc", "asc"]).map((m) => m.name);

document.getElementById("byAge").textContent = JSON.stringify(byAge);
document.getElementById("byRank").textContent = JSON.stringify(byRank);
console.log("年齢順:", JSON.stringify(byAge));
console.log("ランキング:", JSON.stringify(byRank));
`,
  },
});
