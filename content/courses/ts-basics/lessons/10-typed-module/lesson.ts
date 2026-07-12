import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "ts-10-typed-module",
  title: "総合: 型付きモジュール",
  estMinutes: 8,
  runner: "worker",
  files: {
    "script.ts": {
      initial: `// 総合演習です。これまでに学んだ
//   interface / 関数の型 / ユニオン型(リテラル型)
// を組み合わせて、小さな「型付きモジュール」を完成させます。

// 1) interface Item を定義しよう
//    name: string
//    price: number

// 2) 型エイリアス Tax を定義しよう
//    "in"(税込み)か "out"(税抜き)のユニオン型
//    type Tax = "in" | "out";

// 3) priceOf を完成させよう
//    引数 item は Item、mode は Tax、戻り値は number。
//    mode が "in" なら price を 1.1 倍して小数を切り捨てた数、
//    "out" なら price をそのまま返す。
function priceOf(item, mode) {
  // ここに型注釈と処理を書こう

}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(priceOf({ name: "ペン", price: 100 }, "in"));
console.log(priceOf({ name: "ペン", price: 100 }, "out"));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "define-interface",
      file: "script.ts",
      pattern:
        "interface\\s+Item\\s*\\{\\s*name\\s*:\\s*string\\s*[;,]?\\s*price\\s*:\\s*number\\s*[;,]?\\s*\\}",
      message:
        "interface Item に name: string と price: number を定義しましょう(interface Item { name: string; price: number } の形)",
    },
    {
      type: "source",
      id: "define-tax",
      file: "script.ts",
      pattern: "type\\s+Tax\\s*=\\s*[\"']in[\"']\\s*\\|\\s*[\"']out[\"']",
      message: 'type Tax = "in" | "out"; のユニオン型を定義しましょう',
    },
    {
      type: "source",
      id: "annotate-signature",
      file: "script.ts",
      pattern:
        "function\\s+priceOf\\s*\\(\\s*item\\s*:\\s*Item\\s*,\\s*mode\\s*:\\s*Tax\\s*\\)\\s*:\\s*number",
      message: "priceOf に型を付けましょう(function priceOf(item: Item, mode: Tax): number の形)",
    },
    {
      type: "fn",
      id: "price-in",
      name: "priceOf",
      args: [{ name: "ペン", price: 100 }, "in"],
      returns: 110,
      message: '"in"(税込み)のときは price を 1.1 倍して小数を切り捨てた数を返しましょう(100 なら 110)',
    },
    {
      type: "fn",
      id: "price-out",
      name: "priceOf",
      args: [{ name: "ペン", price: 100 }, "out"],
      returns: 100,
      message: '"out"(税抜き)のときは price をそのまま返しましょう(100 なら 100)',
    },
    {
      type: "fn",
      id: "price-in-large",
      name: "priceOf",
      args: [{ name: "本", price: 1500 }, "in"],
      returns: 1650,
      message: "price が変わっても税込み計算ができるようにしましょう(1500 なら 1650)",
    },
  ],
  hints: [
    "3 つを組み合わせます。interface Item で name と price の形を、type Tax でユニオン型を、priceOf で関数の型をつくります",
    'interface Item { name: string; price: number }、type Tax = "in" | "out";、function priceOf(item: Item, mode: Tax): number の 3 つを書きます',
    'priceOf は if (mode === "in") { return Math.floor(item.price * 1.1); } のあと return item.price; で完成です(1.1 倍で出る小数は Math.floor で整数にします)',
  ],
  solution: {
    "script.ts": `interface Item {
  name: string;
  price: number;
}

type Tax = "in" | "out";

function priceOf(item: Item, mode: Tax): number {
  if (mode === "in") {
    return Math.floor(item.price * 1.1);
  }
  return item.price;
}

console.log(priceOf({ name: "ペン", price: 100 }, "in"));
console.log(priceOf({ name: "ペン", price: 100 }, "out"));
`,
  },
});
