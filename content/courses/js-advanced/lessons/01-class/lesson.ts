import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-adv-01-class",
  title: "クラスを定義する",
  estMinutes: 5,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// User クラス: 名前を覚えて、あいさつできる
class User {
  constructor(name) {
    // ここに this.name = name; と書こう(受け取った名前を覚える)

  }

  greet() {
    // ここに return "こんにちは、" + this.name + "です"; と書こう

  }
}

// 動作確認・判定用(そのままでOK)
function makeGreeting(name) {
  const user = new User(name);
  return user.greet();
}

console.log(makeGreeting("タロウ"));
`,
    },
  },
  checks: [
    {
      id: "declare-class-user",
      type: "source",
      file: "script.js",
      pattern: "class\\s+User",
      message: "class User { ... } の形で User クラスを宣言しましょう",
    },
    {
      id: "greet-taro",
      type: "fn",
      name: "makeGreeting",
      args: ["タロウ"],
      returns: "こんにちは、タロウです",
    },
    {
      id: "greet-hanako",
      type: "fn",
      name: "makeGreeting",
      args: ["ハナコ"],
      returns: "こんにちは、ハナコです",
      message: "名前を変えても正しくあいさつできるようにしましょう(greet では this.name を使います)",
    },
  ],
  hints: [
    "constructor は new したときに一度だけ呼ばれる特別なメソッドです。受け取った引数は this.name = name; の形でインスタンスに覚えさせます",
    "greet メソッドでは、覚えておいた this.name を文字列と + でつなげて return します",
    'constructor には this.name = name; を、greet には return "こんにちは、" + this.name + "です"; を書けば完成です',
  ],
  solution: {
    "script.js": `// User クラス: 名前を覚えて、あいさつできる
class User {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return "こんにちは、" + this.name + "です";
  }
}

// 動作確認・判定用(そのままでOK)
function makeGreeting(name) {
  const user = new User(name);
  return user.greet();
}

console.log(makeGreeting("タロウ"));
`,
  },
});
