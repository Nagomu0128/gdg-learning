import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "lib-int-03-lodash-keyby",
  title: "lodashでデータ変換",
  estMinutes: 7,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>lodashでデータ変換</title>
  </head>
  <body>
    <h1>配列を引きやすい形に変える</h1>
    <p>a1 の名前: <span id="found"></span></p>
    <p>id と価格の表: <span id="prices"></span></p>
    <script src="/vendor/lodash.min.js"></script>
    <script src="main.js"></script>
  </body>
</html>
`,
      editable: false,
    },
    "main.js": {
      initial: `// lodash で「配列」を「id で引ける表」に変換する
const products = [
  { id: "a1", name: "りんご", price: 120 },
  { id: "b2", name: "みかん", price: 80 },
];

// (1) products を id で引ける形に変換しよう。_.keyBy を使う
const byId = {};

// (2) byId から「id と価格だけ」の表を作ろう。_.mapValues を使う
const priceById = {};

// byId["a1"] のように、id から商品を取り出せるようになる
const found = byId["a1"] ? byId["a1"].name : "";

document.getElementById("found").textContent = found;
document.getElementById("prices").textContent = JSON.stringify(priceById);
console.log("a1の名前:", found);
console.log("価格表:", JSON.stringify(priceById));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-keyby",
      file: "main.js",
      pattern: "_\\.keyBy\\(",
      message: "_.keyBy を使って products を id で引ける形にしましょう",
    },
    {
      type: "source",
      id: "use-mapvalues",
      file: "main.js",
      pattern: "_\\.mapValues\\(",
      message: "_.mapValues を使って id と価格だけの表を作りましょう",
    },
    {
      type: "text",
      id: "show-found",
      selector: "#found",
      equals: "りんご",
      message: 'byId["a1"] で取り出した名前 りんご が表示されるようにしましょう',
    },
    {
      type: "text",
      id: "show-prices",
      selector: "#prices",
      equals: '{"a1":120,"b2":80}',
      message: 'id をキー、価格を値にした {"a1":120,"b2":80} が表示されるようにしましょう',
    },
    {
      type: "console",
      id: "log-both",
      lines: ["a1の名前: りんご", '価格表: {"a1":120,"b2":80}'],
      message: "コンソールに名前と価格表を出力しましょう",
    },
  ],
  hints: [
    '_.keyBy(配列, "id") は配列を { id の値: 要素 } の形のオブジェクトに変換します',
    '_.mapValues(オブジェクト, "price") は、各値を price だけに置きかえた新しいオブジェクトを返します',
    'byId は _.keyBy(products, "id")、priceById は _.mapValues(byId, "price") です',
  ],
  solution: {
    "main.js": `const products = [
  { id: "a1", name: "りんご", price: 120 },
  { id: "b2", name: "みかん", price: 80 },
];

const byId = _.keyBy(products, "id");

const priceById = _.mapValues(byId, "price");

const found = byId["a1"] ? byId["a1"].name : "";

document.getElementById("found").textContent = found;
document.getElementById("prices").textContent = JSON.stringify(priceById);
console.log("a1の名前:", found);
console.log("価格表:", JSON.stringify(priceById));
`,
  },
});
