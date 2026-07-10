export default {
  slug: "demo2-01-worker",
  title: "レベル付きコースのレッスン",
  estMinutes: 3,
  files: {
    "script.js": { initial: "// ok と出力しよう\n" },
  },
  checks: [{ type: "console", id: "ok-output", lines: ["ok"] }],
  hints: ["console.log を使いましょう"],
  solution: {
    "script.js": 'console.log("ok");\n',
  },
};
