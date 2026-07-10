import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-int-05-objects-plus",
  title: "分割代入とスプレッド",
  estMinutes: 6,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// person から取り出した name と age で、「タロウは25歳です」の形の文字列を返す関数
function introduce(person) {
  // ここで person から name と age を分割代入で取り出そう

  // ここで name と age をつないだ文字列を return しよう

}

// 2 つのオブジェクトをあわせた新しいオブジェクトを返す関数
function merge(obj1, obj2) {
  // ここでスプレッド構文を使って、obj1 と obj2 をあわせたオブジェクトを return しよう

}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(introduce({ name: "タロウ", age: 25 }));
console.log(merge({ a: 1 }, { b: 2 }));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-destructuring",
      file: "script.js",
      pattern: "const\\s*\\{",
      message: "分割代入(const のあとに波かっこ)を使って、person から name と age を取り出しましょう",
    },
    {
      type: "source",
      id: "use-spread",
      file: "script.js",
      pattern: "\\.\\.\\.",
      message: "スプレッド構文(ピリオド 3 つ)を使って書いてみましょう",
    },
    {
      type: "fn",
      id: "introduce-basic",
      name: "introduce",
      args: [{ name: "タロウ", age: 25 }],
      returns: "タロウは25歳です",
      message: "introduce は「タロウは25歳です」のような文字列を返すようにしましょう",
    },
    {
      type: "fn",
      id: "introduce-other",
      name: "introduce",
      args: [{ name: "ハナコ", age: 17 }],
      returns: "ハナコは17歳です",
      message: "introduce は、名前と年齢が変わっても動くようにしましょう(取り出した name と age を使います)",
    },
    {
      type: "fn",
      id: "merge-basic",
      name: "merge",
      args: [{ a: 1 }, { b: 2 }],
      returns: { a: 1, b: 2 },
      message: "merge は、obj1 と obj2 をあわせた新しいオブジェクトを返すようにしましょう",
    },
    {
      type: "fn",
      id: "merge-overwrite",
      name: "merge",
      args: [{ a: 1, b: 9 }, { b: 2 }],
      returns: { a: 1, b: 2 },
      message: "同じキーがあるときは obj2 の値で上書きされるように、obj1 から obj2 の順で展開しましょう",
    },
  ],
  hints: [
    "分割代入は const のあとに波かっこでキー名を並べます。スプレッドはオブジェクトの前にピリオドを 3 つ付けて、中身を展開します",
    "introduce ではまず const { name, age } = person; と取り出します。merge が返すのは { ...obj1, ...obj2 } です",
    'introduce は return name + "は" + age + "歳です"; 、merge は return { ...obj1, ...obj2 }; で完成です',
  ],
  solution: {
    "script.js": `// person から取り出した name と age で、「タロウは25歳です」の形の文字列を返す関数
function introduce(person) {
  const { name, age } = person;
  return name + "は" + age + "歳です";
}

// 2 つのオブジェクトをあわせた新しいオブジェクトを返す関数
function merge(obj1, obj2) {
  return { ...obj1, ...obj2 };
}

// 動作確認用。コンソールタブで結果を見てみよう
console.log(introduce({ name: "タロウ", age: 25 }));
console.log(merge({ a: 1 }, { b: 2 }));
`,
  },
});
