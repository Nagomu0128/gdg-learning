import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-adv-08-map-set",
  title: "Map と Set",
  estMinutes: 6,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// 1) 配列の「重複を除いた種類の数」を返す関数
function uniqueCount(items) {
  // ここに Set を使って書こう(重複が自動で消える)
  // 個数は .size で取れる
}

// 2) 教科名を渡すと点数を返す関数
//    点数表: 算数は 90、国語は 75、理科は 60
function scoreOf(subject) {
  // ここに Map を作って書こう
  //   set("教科名", 点数) で登録し、get(subject) の結果を return する
}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(uniqueCount([1, 1, 2]));
console.log(scoreOf("算数"));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "uses-set",
      file: "script.js",
      pattern: "new\\s+Set\\s*\\(",
      message: "new Set(...) で Set を作りましょう(配列を渡すと重複が消えます)",
    },
    {
      type: "fn",
      id: "unique-count-numbers",
      name: "uniqueCount",
      args: [[1, 1, 2]],
      returns: 2,
    },
    {
      type: "fn",
      id: "unique-count-words",
      name: "uniqueCount",
      args: [["a", "b", "a", "c"]],
      returns: 3,
    },
    {
      type: "source",
      id: "uses-map",
      file: "script.js",
      pattern: "new\\s+Map\\s*\\(",
      message: "new Map() で Map(キーと値の対応表)を作りましょう",
    },
    {
      type: "fn",
      id: "score-of-math",
      name: "scoreOf",
      args: ["算数"],
      returns: 90,
    },
    {
      type: "fn",
      id: "score-of-japanese",
      name: "scoreOf",
      args: ["国語"],
      returns: 75,
    },
  ],
  hints: [
    "Set は new Set(配列) で作れて、重複した値は1つにまとまります。要素の個数は .size プロパティで取れます(( ) は付けません)",
    "uniqueCount の中身は return new Set(items).size; の1行で書けます",
    'scoreOf は const scores = new Map(); を作り、scores.set("算数", 90); scores.set("国語", 75); scores.set("理科", 60); と登録してから、return scores.get(subject); です',
  ],
  solution: {
    "script.js": `// 1) 配列の「重複を除いた種類の数」を返す関数
function uniqueCount(items) {
  // Set に入れると、重複した値は1つにまとまる
  const unique = new Set(items);
  return unique.size;
}

// 2) 教科名を渡すと点数を返す関数
function scoreOf(subject) {
  // 教科名 → 点数 の対応表を Map で持つ
  const scores = new Map();
  scores.set("算数", 90);
  scores.set("国語", 75);
  scores.set("理科", 60);
  return scores.get(subject);
}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(uniqueCount([1, 1, 2]));
console.log(scoreOf("算数"));
`,
  },
});
