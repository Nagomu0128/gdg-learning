// course.lessons では 2 番目なのにディレクトリ接頭辞が 03(順序不一致)。slides も無い
export default {
  slug: "demo-b",
  title: "順序がずれたレッスン",
  files: { "index.html": { initial: "" } },
  checks: [{ type: "element", id: "p-exists", selector: "p" }],
  hints: ["p を書きましょう"],
  solution: { "index.html": "<p>b</p>" },
};
