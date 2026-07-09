// course.lessons に載っていないレッスン
export default {
  slug: "demo-extra",
  title: "余分なレッスン",
  files: { "index.html": { initial: "" } },
  checks: [{ type: "element", id: "p-exists", selector: "p" }],
  hints: ["p を書きましょう"],
  solution: { "index.html": "<p>extra</p>" },
};
