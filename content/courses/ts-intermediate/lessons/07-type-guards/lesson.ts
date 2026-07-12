import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "ts-int-07-type-guards",
  title: "型ガード",
  estMinutes: 7,
  runner: "worker",
  files: {
    "script.ts": {
      initial: `// 「型ガード」は、値がどの型かを実行時に判定し、その先で型を絞り込ませる関数です。
// 戻り値の型を「引数 is 型」という特別な書き方にすると、その関数は型ガードになります。

interface Fish {
  swim: string;
}
interface Bird {
  fly: string;
}
type Pet = Fish | Bird;

// 1) isFish: pet が Fish かどうかを返す型ガード。
//    戻り値の型を、pet が Fish であることを表す特別な形にしよう(書き方はスライド参照)。
//    中身は、キー swim を持つかどうかで判定する。
function isFish(pet) {
  // swim というキーを持つかどうかを返そう

}

// 2) move: pet が Fish なら "泳ぐ: ...", Bird なら "飛ぶ: ..." を返す。
//    上で作った型ガードで絞り込んでから、それぞれのプロパティを使おう。
function move(pet) {
  // 型ガードで Fish と Bird に分けよう

}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(move({ swim: "スイスイ" }));
console.log(move({ fly: "パタパタ" }));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "guard-predicate",
      file: "script.ts",
      pattern: "function\\s+isFish\\s*\\(\\s*pet\\s*:\\s*Pet\\s*\\)\\s*:\\s*pet\\s+is\\s+Fish\\b",
      message:
        "isFish を型ガードにしましょう(function isFish(pet: Pet): pet is Fish の形。戻り値の型に pet is Fish と書きます)",
    },
    {
      type: "source",
      id: "use-guard",
      file: "script.ts",
      pattern: "if\\s*\\(\\s*isFish\\s*\\(\\s*pet\\s*\\)\\s*\\)",
      message: "move の中で if (isFish(pet)) と書いて、型を絞り込みましょう",
    },
    {
      type: "fn",
      id: "guard-true",
      name: "isFish",
      args: [{ swim: "スイスイ" }],
      returns: true,
      message: "isFish は swim を持つとき true を返すようにしましょう",
    },
    {
      type: "fn",
      id: "guard-false",
      name: "isFish",
      args: [{ fly: "パタパタ" }],
      returns: false,
      message: "isFish は swim を持たないとき false を返すようにしましょう",
    },
    {
      type: "fn",
      id: "move-fish",
      name: "move",
      args: [{ swim: "スイスイ" }],
      returns: "泳ぐ: スイスイ",
      message: 'Fish のときは "泳ぐ: " + pet.swim を返すようにしましょう',
    },
    {
      type: "fn",
      id: "move-bird",
      name: "move",
      args: [{ fly: "パタパタ" }],
      returns: "飛ぶ: パタパタ",
      message: 'Bird のときは "飛ぶ: " + pet.fly を返すようにしましょう',
    },
  ],
  hints: [
    "戻り値の型を「引数名 is 型」と書くと型ガードになります。isFish(pet: Pet): pet is Fish なら、true を返したとき呼び出し側で pet が Fish に絞り込まれます",
    'isFish の中身は "swim" in pet を返します。move では if (isFish(pet)) { ... } の中で pet.swim が、その外で pet.fly が使えます',
    'function isFish(pet: Pet): pet is Fish { return "swim" in pet; } とし、move では if (isFish(pet)) { return "泳ぐ: " + pet.swim; } のあと return "飛ぶ: " + pet.fly; を置けば完成です',
  ],
  solution: {
    "script.ts": `interface Fish {
  swim: string;
}
interface Bird {
  fly: string;
}
type Pet = Fish | Bird;

function isFish(pet: Pet): pet is Fish {
  return "swim" in pet;
}

function move(pet: Pet): string {
  if (isFish(pet)) {
    return "泳ぐ: " + pet.swim;
  }
  return "飛ぶ: " + pet.fly;
}

console.log(move({ swim: "スイスイ" }));
console.log(move({ fly: "パタパタ" }));
`,
  },
});
