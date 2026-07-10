import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-adv-02-inheritance",
  title: "クラスの継承",
  estMinutes: 6,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// 親クラス Animal(そのままでOK)
class Animal {
  constructor(name) {
    this.name = name;
  }

  introduce() {
    return "わたしは" + this.name + "です";
  }
}

// Animal を継承した Dog クラスをつくろう
//   - extends を使って Animal を継承する
//   - bark メソッドを追加して "ワンワン" を返す
// ここに Dog クラスを書こう


// 動作確認・判定用(そのままでOK)
function describeDog() {
  const dog = new Dog("ポチ");
  return [dog.introduce(), dog.bark()];
}

console.log(describeDog());
`,
    },
  },
  checks: [
    {
      id: "extends-animal",
      type: "source",
      file: "script.js",
      pattern: "class\\s+Dog\\s+extends\\s+Animal",
      message: "class Dog extends Animal の形で、Animal を継承した Dog クラスを宣言しましょう",
    },
    {
      id: "dog-bark-method",
      type: "source",
      file: "script.js",
      pattern: "bark\\s*\\(\\s*\\)\\s*\\{",
      message: "Dog クラスに bark メソッドを追加しましょう",
    },
    {
      id: "describe-dog",
      type: "fn",
      name: "describeDog",
      args: [],
      returns: ["わたしはポチです", "ワンワン"],
      message:
        'describeDog() が ["わたしはポチです", "ワンワン"] を返すようにしましょう(introduce は Animal から引き継ぎます)',
    },
  ],
  hints: [
    "class Dog extends Animal と書くと、Dog は Animal の constructor と introduce をそのまま引き継ぎます",
    "constructor は書かなくてOKです。Dog の波かっこの中には、bark メソッドだけを書きます",
    'class Dog extends Animal { bark() { return "ワンワン"; } } と書けば完成です',
  ],
  solution: {
    "script.js": `// 親クラス Animal(そのままでOK)
class Animal {
  constructor(name) {
    this.name = name;
  }

  introduce() {
    return "わたしは" + this.name + "です";
  }
}

// Animal を継承した Dog クラス
class Dog extends Animal {
  bark() {
    return "ワンワン";
  }
}

// 動作確認・判定用(そのままでOK)
function describeDog() {
  const dog = new Dog("ポチ");
  return [dog.introduce(), dog.bark()];
}

console.log(describeDog());
`,
  },
});
