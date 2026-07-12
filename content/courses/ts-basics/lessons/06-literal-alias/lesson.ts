import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "ts-06-literal-alias",
  title: "リテラル型と型エイリアス",
  estMinutes: 6,
  runner: "worker",
  files: {
    "script.ts": {
      initial: `// リテラル型は "up" のように「特定の値そのもの」を型にしたものです。
// 型エイリアスは type 名前 = ... で「型に名前をつける」しくみです。

// 1) 型エイリアス Dir を定義しよう。値は "up" か "down" のどちらか。
//    type Dir = "up" | "down"; の形で書きます。
// ここに type Dir を書こう

// 2) move: Dir を受け取って、
//    "up" なら "上に移動"、"down" なら "下に移動" を返す関数。
//    引数 dir は Dir、戻り値は string。
function move(dir) {
  // ここで dir が "up" かどうかで分岐して返そう

}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(move("up"));
console.log(move("down"));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "define-alias",
      file: "script.ts",
      pattern: "type\\s+Dir\\s*=\\s*[\"']up[\"']\\s*\\|\\s*[\"']down[\"']",
      message: 'type Dir = "up" | "down"; の形で型エイリアスを定義しましょう',
    },
    {
      type: "source",
      id: "annotate-param",
      file: "script.ts",
      pattern: "dir\\s*:\\s*Dir",
      message: "move の引数 dir に : Dir の型を付けましょう",
    },
    {
      type: "source",
      id: "annotate-return",
      file: "script.ts",
      pattern: "function\\s+move\\s*\\([^)]*\\)\\s*:\\s*string",
      message: "move の戻り値に : string を付けましょう",
    },
    {
      type: "fn",
      id: "move-up",
      name: "move",
      args: ["up"],
      returns: "上に移動",
      message: 'move("up") は "上に移動" を返すようにしましょう',
    },
    {
      type: "fn",
      id: "move-down",
      name: "move",
      args: ["down"],
      returns: "下に移動",
      message: 'move("down") は "下に移動" を返すようにしましょう(else 側の分岐)',
    },
  ],
  hints: [
    'リテラル型は "up" のように値そのものを型にします。type Dir = "up" | "down"; と書くと、Dir は「up か down だけ」を表す型になります',
    'move の引数に : Dir、戻り値に : string を付けます。中身は if (dir === "up") で分けます',
    'type Dir = "up" | "down"; を書き、move は if (dir === "up") { return "上に移動"; } のあとに return "下に移動"; で完成です',
  ],
  solution: {
    "script.ts": `type Dir = "up" | "down";

function move(dir: Dir): string {
  if (dir === "up") {
    return "上に移動";
  }
  return "下に移動";
}

console.log(move("up"));
console.log(move("down"));
`,
  },
});
