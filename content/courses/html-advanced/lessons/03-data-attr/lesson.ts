import { defineLesson } from "@codesteps/lesson-kit";

// CURRICULUM-2 html-adv #3(穴埋め): data-* 属性と dataset 読み取り(script.js は編集不可)
export default defineLesson({
  slug: "html-adv-03-data-attr",
  title: "data-* 属性",
  estMinutes: 5,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>カフェメニュー</title>
  </head>
  <body>
    <h1>カフェメニュー</h1>
    <ul id="menu">
      <li data-price="150">コーヒー</li>
      <!-- 下の2つの li にも data-price 属性を付けよう(紅茶は 200、ケーキは 300) -->
      <li>紅茶</li>
      <li>ケーキ</li>
    </ul>
    <p id="total">合計: 0円</p>
    <script src="script.js"></script>
  </body>
</html>
`,
    },
    "script.js": {
      initial: `// このファイルは編集できません
// 各 li の data-price 属性を dataset.price で読み取り、合計金額を表示する
const items = document.querySelectorAll("#menu li");
let total = 0;
for (const item of items) {
  if (item.dataset.price !== undefined) {
    total += Number(item.dataset.price);
  }
}
document.getElementById("total").textContent = "合計: " + total + "円";
`,
      editable: false,
    },
  },
  checks: [
    {
      type: "element",
      id: "menu-items",
      selector: "#menu li",
      count: 3,
      message: "メニューの li は3個(コーヒー・紅茶・ケーキ)のままにしておきましょう",
    },
    {
      type: "attribute",
      id: "coffee-price",
      selector: "#menu li:nth-child(1)",
      name: "data-price",
      equals: "150",
      message: '1つ目の li(コーヒー)には、見本の data-price="150" をそのまま残しておきましょう',
    },
    {
      type: "attribute",
      id: "tea-price",
      selector: "#menu li:nth-child(2)",
      name: "data-price",
      equals: "200",
      message: '2つ目の li(紅茶)に data-price="200" を付けましょう',
    },
    {
      type: "attribute",
      id: "cake-price",
      selector: "#menu li:nth-child(3)",
      name: "data-price",
      equals: "300",
      message: '3つ目の li(ケーキ)に data-price="300" を付けましょう',
    },
    {
      type: "text",
      id: "total-text",
      selector: "#total",
      equals: "合計: 650円",
      message:
        "3つの data-price が正しく付くと、合計の表示が「合計: 650円」になります。属性の値を見直してみましょう",
    },
  ],
  hints: [
    'data- で始まる属性は、タグに自由な情報をメモしておける特別な属性です。1つ目の li に付いている data-price="150" が見本です',
    '<li data-price="200">紅茶</li> のように、開始タグの中に属性として書きます',
    '紅茶の li に data-price="200"、ケーキの li に data-price="300" を付ければ完成です',
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>カフェメニュー</title>
  </head>
  <body>
    <h1>カフェメニュー</h1>
    <ul id="menu">
      <li data-price="150">コーヒー</li>
      <li data-price="200">紅茶</li>
      <li data-price="300">ケーキ</li>
    </ul>
    <p id="total">合計: 0円</p>
    <script src="script.js"></script>
  </body>
</html>
`,
  },
});
