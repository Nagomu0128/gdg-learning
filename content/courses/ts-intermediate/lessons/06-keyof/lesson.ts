import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "ts-int-06-keyof",
  title: "keyof とインデックスアクセス",
  estMinutes: 7,
  runner: "worker",
  files: {
    "script.ts": {
      initial: `// keyof は「ある型のプロパティ名すべて」を表す型を作ります。
// インデックスアクセス型は「そのキーの値の型」を表します。
// この2つを組み合わせると、「オブジェクトから、存在するキーの値を安全に取り出す」関数が書けます。

// getProp: オブジェクト obj から、キー key の値を取り出す関数。
//   ・型変数 K に「obj のキーのどれか」という制約を付けよう(keyof を使う。スライド参照)
//   ・戻り値の型を「そのキー K の値の型」にしよう(インデックスアクセス型)
function getProp(obj, key) {
  // obj[key] を返そう

}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(getProp({ name: "ペン", price: 100 }, "name"));
console.log(getProp({ name: "ペン", price: 100 }, "price"));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "keyof-constraint",
      file: "script.ts",
      pattern: "<\\s*T\\s*,\\s*K\\s+extends\\s+keyof\\s+T\\s*>",
      message: "型変数を <T, K extends keyof T> にしましょう(K は T のキーのどれか、という制約です)",
    },
    {
      type: "source",
      id: "indexed-access",
      file: "script.ts",
      pattern: "\\)\\s*:\\s*T\\s*\\[\\s*K\\s*\\]",
      message: "戻り値の型をインデックスアクセス型 T[K] にしましょう((key: K): T[K] の形)",
    },
    {
      type: "fn",
      id: "get-name",
      name: "getProp",
      args: [{ name: "ペン", price: 100 }, "name"],
      returns: "ペン",
      message: 'getProp は obj[key] を返すようにしましょう("name" を渡すと "ペン")',
    },
    {
      type: "fn",
      id: "get-price",
      name: "getProp",
      args: [{ name: "ペン", price: 100 }, "price"],
      returns: 100,
      message: 'キーを変えても値を取り出せるようにしましょう("price" を渡すと 100)',
    },
  ],
  hints: [
    "keyof T は「T のプロパティ名の集まり」を表します。K extends keyof T とすると、K は必ず T に存在するキーになります。T[K] は「そのキーの値の型」です",
    "function getProp<T, K extends keyof T>(obj: T, key: K): T[K] と書くと、存在するキーだけを渡せて、その値の型が正しく返ります。中身は obj[key] を返すだけです",
    "function getProp<T, K extends keyof T>(obj: T, key: K): T[K] { return obj[key]; } で完成です",
  ],
  solution: {
    "script.ts": `function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

console.log(getProp({ name: "ペン", price: 100 }, "name"));
console.log(getProp({ name: "ペン", price: 100 }, "price"));
`,
  },
});
