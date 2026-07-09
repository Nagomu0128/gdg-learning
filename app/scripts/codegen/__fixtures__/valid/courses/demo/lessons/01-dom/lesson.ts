export default {
  slug: "demo-01-dom",
  title: "見出しをつくる",
  estMinutes: 3,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>demo</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
  </body>
</html>
`,
    },
    "style.css": { initial: "/* h1 を赤にしよう */\n" },
  },
  checks: [
    { type: "element", id: "h1-exists", selector: "h1" },
    { type: "style", id: "h1-color", selector: "h1", property: "color", equals: "red" },
  ],
  hints: ["h1 タグを書きましょう"],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>demo</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>デモ</h1>
  </body>
</html>
`,
    "style.css": "h1 {\n  color: red;\n}\n",
  },
};
