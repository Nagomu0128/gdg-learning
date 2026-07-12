import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "lib-int-05-zod-nested",
  title: "zodのネストしたスキーマ",
  estMinutes: 8,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>zodのネストしたスキーマ</title>
  </head>
  <body>
    <h1>入れ子のデータを検証する</h1>
    <p>顧客名: <span id="customer"></span></p>
    <p>商品点数: <span id="count"></span></p>
    <p>合計数量: <span id="qty"></span></p>
    <script src="/vendor/zod.js"></script>
    <script src="main.js"></script>
  </body>
</html>
`,
      editable: false,
    },
    "main.js": {
      initial: `// zod で「入れ子になったデータ」の形を定義して検証する
const orderSchema = z.object({
  id: z.string(),
  // (1) customer は { name: 文字列, vip: 真偽値 }。z.object をネストして埋めよう
  customer: z.object({}),
  // (2) items は { name: 文字列, qty: 数値 } の配列。z.array の中の z.object を埋めよう
  items: z.array(z.object({})),
});

const input = {
  id: "o-1",
  customer: { name: "田中", vip: true },
  items: [
    { name: "ペン", qty: 2 },
    { name: "ノート", qty: 1 },
  ],
};

const order = orderSchema.parse(input);

document.getElementById("customer").textContent = order.customer.name;
document.getElementById("count").textContent = String(order.items.length);
document.getElementById("qty").textContent = String(order.items.reduce((sum, item) => sum + item.qty, 0));
console.log("顧客:", order.customer.name);
console.log("点数:", order.items.length);
console.log("合計数量:", order.items.reduce((sum, item) => sum + item.qty, 0));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "customer-shape",
      file: "main.js",
      pattern: "vip:\\s*z\\.boolean\\(\\)",
      message: "customer の中に vip: z.boolean() を入れて、入れ子の object を完成させましょう",
    },
    {
      type: "source",
      id: "items-shape",
      file: "main.js",
      pattern: "qty:\\s*z\\.number\\(\\)",
      message: "items の要素に qty: z.number() を入れて、配列の中の object を完成させましょう",
    },
    {
      type: "text",
      id: "show-customer",
      selector: "#customer",
      equals: "田中",
      message: "検証した結果の顧客名 田中 が表示されるようにしましょう",
    },
    {
      type: "text",
      id: "show-count",
      selector: "#count",
      equals: "2",
      message: "items の点数 2 が表示されるようにしましょう",
    },
    {
      type: "text",
      id: "show-qty",
      selector: "#qty",
      equals: "3",
      message: "qty の合計 3 が表示されるようにしましょう",
    },
    {
      type: "console",
      id: "log-all",
      lines: ["顧客: 田中", "点数: 2", "合計数量: 3"],
      message: "コンソールに顧客名・点数・合計数量を出力しましょう",
    },
  ],
  hints: [
    "z.object の中に、さらに z.object や z.array を入れられます。データの入れ子と同じ形にスキーマも入れ子にします",
    "customer は z.object({ name: z.string(), vip: z.boolean() })、items は z.array(z.object({ name: z.string(), qty: z.number() })) です",
    "スキーマを正しく埋めれば、order.customer.name や order.items.length がそのまま使えます",
  ],
  solution: {
    "main.js": `const orderSchema = z.object({
  id: z.string(),
  customer: z.object({ name: z.string(), vip: z.boolean() }),
  items: z.array(z.object({ name: z.string(), qty: z.number() })),
});

const input = {
  id: "o-1",
  customer: { name: "田中", vip: true },
  items: [
    { name: "ペン", qty: 2 },
    { name: "ノート", qty: 1 },
  ],
};

const order = orderSchema.parse(input);

document.getElementById("customer").textContent = order.customer.name;
document.getElementById("count").textContent = String(order.items.length);
document.getElementById("qty").textContent = String(order.items.reduce((sum, item) => sum + item.qty, 0));
console.log("顧客:", order.customer.name);
console.log("点数:", order.items.length);
console.log("合計数量:", order.items.reduce((sum, item) => sum + item.qty, 0));
`,
  },
});
