import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "ts-int-01-union-discriminated",
  title: "判別可能なユニオン型",
  estMinutes: 7,
  runner: "worker",
  files: {
    "script.ts": {
      initial: `// 「判別可能なユニオン型」は、共通のタグ(ここでは kind)を持つ型を | でまとめたものです。
// タグを見れば「今どの形か」が分かるので、安全に分岐できます。

// Circle と Rectangle はすでに定義してあります(どちらも kind というタグを持ちます)。
type Circle = { kind: "circle"; radius: number };
type Rectangle = { kind: "rectangle"; width: number; height: number };

// 1) この2つをまとめたユニオン型 Shape をここに定義しよう(書き方はスライド参照)


// 2) area: Shape を受け取り、面積(number)を返す関数。
//    引数 shape に型を付け、kind の値で分岐して
//    円なら Math.floor(Math.PI * radius * radius)、長方形なら width * height を返そう。
function area(shape) {
  // ここで kind を調べて分岐しよう(switch の書き方はスライド参照)

}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(area({ kind: "circle", radius: 10 }));
console.log(area({ kind: "rectangle", width: 3, height: 4 }));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "define-union",
      file: "script.ts",
      pattern: "type\\s+Shape\\s*=\\s*Circle\\s*\\|\\s*Rectangle\\b",
      message:
        "Circle と Rectangle をまとめたユニオン型を定義しましょう(type Shape = Circle | Rectangle; の形)",
    },
    {
      type: "source",
      id: "annotate-param",
      file: "script.ts",
      pattern: "function\\s+area\\s*\\(\\s*shape\\s*:\\s*Shape\\s*\\)\\s*:\\s*number\\b",
      message: "area に型を付けましょう(function area(shape: Shape): number の形)",
    },
    {
      type: "source",
      id: "use-switch",
      file: "script.ts",
      pattern: "switch\\s*\\(\\s*shape\\.kind\\s*\\)",
      message: "shape.kind で switch して、円と長方形の場合に分けましょう",
    },
    {
      type: "fn",
      id: "area-circle",
      name: "area",
      args: [{ kind: "circle", radius: 10 }],
      returns: 314,
      message: "円のときは Math.floor(Math.PI * radius * radius) を返すようにしましょう(radius 10 なら 314)",
    },
    {
      type: "fn",
      id: "area-rectangle",
      name: "area",
      args: [{ kind: "rectangle", width: 3, height: 4 }],
      returns: 12,
      message: "長方形のときは width * height を返すようにしましょう(3 × 4 なら 12)",
    },
    {
      type: "fn",
      id: "area-circle-2",
      name: "area",
      args: [{ kind: "circle", radius: 5 }],
      returns: 78,
      message: "radius が変わっても円の面積を返せるようにしましょう(radius 5 なら 78)",
    },
  ],
  hints: [
    "共通のタグ(kind)を持つ型は | でつなげてユニオン型にできます。使うときは kind の値を switch で調べ、場合ごとに処理を分けます",
    'type Shape = Circle | Rectangle; を定義し、area(shape: Shape): number の中で switch (shape.kind) { case "circle": ... case "rectangle": ... } と書きます',
    'switch (shape.kind) { case "circle": return Math.floor(Math.PI * shape.radius * shape.radius); case "rectangle": return shape.width * shape.height; } で完成です',
  ],
  solution: {
    "script.ts": `type Circle = { kind: "circle"; radius: number };
type Rectangle = { kind: "rectangle"; width: number; height: number };

type Shape = Circle | Rectangle;

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.floor(Math.PI * shape.radius * shape.radius);
    case "rectangle":
      return shape.width * shape.height;
  }
}

console.log(area({ kind: "circle", radius: 10 }));
console.log(area({ kind: "rectangle", width: 3, height: 4 }));
`,
  },
});
