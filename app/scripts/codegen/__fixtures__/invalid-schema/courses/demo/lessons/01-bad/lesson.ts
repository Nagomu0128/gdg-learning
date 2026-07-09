// わざと壊れている教材: editable ファイルが solution に無い / style check が shorthand / check id 重複
export default {
  slug: "demo-01-bad",
  title: "壊れた教材",
  files: {
    "index.html": { initial: "<p>x</p>" },
  },
  checks: [
    { type: "element", id: "dup", selector: "p" },
    { type: "element", id: "dup", selector: "p" },
    { type: "style", id: "shorthand", selector: "p", property: "margin", equals: "8px" },
    { type: "source", id: "missing-file", file: "nope.css", pattern: "x" },
  ],
  hints: ["ヒント"],
  solution: {},
};
