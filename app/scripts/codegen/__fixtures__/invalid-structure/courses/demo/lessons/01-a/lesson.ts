export default {
  slug: "demo-a",
  title: "正常なレッスン",
  files: { "index.html": { initial: "" } },
  checks: [{ type: "element", id: "p-exists", selector: "p" }],
  hints: ["p を書きましょう"],
  solution: { "index.html": "<p>a</p>" },
};
