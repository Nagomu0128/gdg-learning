import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-int-03-filter-find",
  title: "filter と find",
  estMinutes: 6,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// age が 20 以上(20 を含む)の人だけの配列を返す関数
function adults(people) {
  // ここで people.filter を使って、age が 20 以上の人だけを集めて return しよう

}

// name が一致する最初の人を返す関数
function findUser(users, name) {
  // ここで users.find を使って、name が一致する人を探して return しよう

}

// 動作確認用。コンソールタブで結果を見てみよう
const users = [
  { name: "タロウ", age: 25 },
  { name: "ハナコ", age: 17 },
  { name: "ジロウ", age: 20 },
];
console.log(adults(users));
console.log(findUser(users, "ハナコ"));
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-filter",
      file: "script.js",
      pattern: "\\.filter\\(",
      message: "配列の filter メソッドを使って書いてみましょう",
    },
    {
      type: "source",
      id: "use-find",
      file: "script.js",
      pattern: "\\.find\\(",
      message: "配列の find メソッドを使って書いてみましょう",
    },
    {
      type: "fn",
      id: "adults-basic",
      name: "adults",
      args: [
        [
          { name: "タロウ", age: 25 },
          { name: "ハナコ", age: 17 },
          { name: "ジロウ", age: 20 },
        ],
      ],
      returns: [
        { name: "タロウ", age: 25 },
        { name: "ジロウ", age: 20 },
      ],
      message:
        "adults は、age が 20 以上の人だけを集めた配列を返すようにしましょう(20 ちょうどの人も含みます)",
    },
    {
      type: "fn",
      id: "adults-empty",
      name: "adults",
      args: [[{ name: "ハナコ", age: 17 }]],
      returns: [],
      message: "20 歳以上の人がいないときは、空の配列が返るようにしましょう(filter なら自動でそうなります)",
    },
    {
      type: "fn",
      id: "finduser-basic",
      name: "findUser",
      args: [
        [
          { name: "タロウ", age: 25 },
          { name: "ハナコ", age: 17 },
        ],
        "ハナコ",
      ],
      returns: { name: "ハナコ", age: 17 },
      message: "findUser は、name が一致する人のオブジェクトを 1 つ返すようにしましょう",
    },
    {
      type: "fn",
      id: "finduser-other",
      name: "findUser",
      args: [
        [
          { name: "タロウ", age: 25 },
          { name: "ハナコ", age: 17 },
        ],
        "タロウ",
      ],
      returns: { name: "タロウ", age: 25 },
      message:
        "findUser は、探す名前が変わっても動くようにしましょう(名前を直接書かず、引数 name と比べます)",
    },
  ],
  hints: [
    "filter も find も、アロー関数で「残す条件」を渡します。filter は当てはまる全員の配列を、find は最初の 1 人だけを返します",
    "「20 歳以上」の条件は (person) => person.age >= 20、「名前が一致」は (user) => user.name === name と書きます",
    "adults は return people.filter((person) => person.age >= 20); 、findUser は return users.find((user) => user.name === name); で完成です",
  ],
  solution: {
    "script.js": `// age が 20 以上(20 を含む)の人だけの配列を返す関数
function adults(people) {
  return people.filter((person) => person.age >= 20);
}

// name が一致する最初の人を返す関数
function findUser(users, name) {
  return users.find((user) => user.name === name);
}

// 動作確認用。コンソールタブで結果を見てみよう
const users = [
  { name: "タロウ", age: 25 },
  { name: "ハナコ", age: 17 },
  { name: "ジロウ", age: 20 },
];
console.log(adults(users));
console.log(findUser(users, "ハナコ"));
`,
  },
});
