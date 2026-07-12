import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "ts-int-08-as-const",
  title: "as const とリテラル型",
  estMinutes: 7,
  runner: "worker",
  files: {
    "script.ts": {
      initial: `// as const を付けると、値が「読み取り専用のリテラル型」として扱われます。
// 配列に付けると、要素は "その文字列そのもの" の型に固定されます。
// さらに、その配列からリテラルのユニオン型を取り出せます。

// 1) LEVELS のうしろに as const を付けて、固定のリテラルにしよう(書き方はスライド参照)。
const LEVELS = ["low", "mid", "high"];

// 2) Level 型: LEVELS の要素の型(= "low" | "mid" | "high")を、ここに取り出そう。
//    typeof と、要素の型を取り出すインデックスアクセスを組み合わせる(スライド参照)。


// 3) levelScore: level に応じて 1 / 2 / 3 を返す。引数 level の型を Level にしよう。
function levelScore(level) {
  // level が "low" なら 1、"mid" なら 2、それ以外は 3 を返そう

}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(levelScore("low"));
console.log(levelScore("mid"));
console.log(levelScore("high"));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "as-const",
      file: "script.ts",
      pattern: "LEVELS\\s*=\\s*\\[[^\\]]*\\]\\s*as\\s+const\\b",
      message: 'LEVELS の配列のうしろに as const を付けましょう(["low", "mid", "high"] as const の形)',
    },
    {
      type: "source",
      id: "derive-literal",
      file: "script.ts",
      pattern: "type\\s+Level\\s*=\\s*\\(\\s*typeof\\s+LEVELS\\s*\\)\\s*\\[\\s*number\\s*\\]",
      message: "LEVELS の要素の型を取り出しましょう(type Level = (typeof LEVELS)[number]; の形)",
    },
    {
      type: "source",
      id: "annotate-param",
      file: "script.ts",
      pattern: "levelScore\\s*\\(\\s*level\\s*:\\s*Level\\s*\\)",
      message: "levelScore の引数 level の型を Level にしましょう(level: Level の形)",
    },
    {
      type: "fn",
      id: "score-low",
      name: "levelScore",
      args: ["low"],
      returns: 1,
      message: '"low" のときは 1 を返すようにしましょう',
    },
    {
      type: "fn",
      id: "score-mid",
      name: "levelScore",
      args: ["mid"],
      returns: 2,
      message: '"mid" のときは 2 を返すようにしましょう',
    },
    {
      type: "fn",
      id: "score-high",
      name: "levelScore",
      args: ["high"],
      returns: 3,
      message: '"high" のときは 3 を返すようにしましょう',
    },
  ],
  hints: [
    'as const を付けると、配列は読み取り専用になり、要素は "low" などのリテラル型に固定されます。(typeof LEVELS)[number] で「その配列の要素の型」を取り出せます',
    'const LEVELS = ["low", "mid", "high"] as const; とし、type Level = (typeof LEVELS)[number]; で "low" | "mid" | "high" が得られます。levelScore(level: Level) で使います',
    'levelScore は if (level === "low") return 1; if (level === "mid") return 2; return 3; で完成です',
  ],
  solution: {
    "script.ts": `const LEVELS = ["low", "mid", "high"] as const;

type Level = (typeof LEVELS)[number];

function levelScore(level: Level): number {
  if (level === "low") return 1;
  if (level === "mid") return 2;
  return 3;
}

console.log(levelScore("low"));
console.log(levelScore("mid"));
console.log(levelScore("high"));
`,
  },
});
