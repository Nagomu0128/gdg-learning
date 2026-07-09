export default {
  slug: "demo-02-worker",
  title: "関数と出力",
  estMinutes: 4,
  files: {
    "script.js": { initial: "// add をつくって hello を出力しよう\n" },
  },
  checks: [
    { type: "console", id: "hello-output", lines: ["hello"] },
    { type: "fn", id: "add-works", name: "add", args: [1, 2], returns: 3 },
  ],
  hints: ["console.log を使いましょう", "function add(a, b) の形で宣言します"],
  solution: {
    "script.js": 'function add(a, b) {\n  return a + b;\n}\nconsole.log("hello");\n',
  },
};
