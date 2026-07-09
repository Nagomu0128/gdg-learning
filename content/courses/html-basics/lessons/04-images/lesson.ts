import { defineLesson } from "@codesteps/lesson-kit";

// CURRICULUM #4(穴埋め): img タグと src / alt 属性。assets/cat.svg を同梱
export default defineLesson({
  slug: "html-04-images",
  title: "画像をのせよう",
  estMinutes: 5,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>うちのねこ</title>
  </head>
  <body>
    <h1>うちのねこ</h1>
    <!-- ここに img タグで cat.svg の画像をのせよう(alt 属性も忘れずに) -->
  </body>
</html>
`,
    },
  },
  checks: [
    { type: "element", id: "img-exists", selector: "img" },
    { type: "attribute", id: "img-src", selector: "img", name: "src", equals: "cat.svg" },
    { type: "attribute", id: "img-alt", selector: "img", name: "alt", exists: true },
  ],
  hints: [
    "画像は img タグでのせます。img には閉じタグがありません。どの画像かは src 属性にファイル名を書いて指定します",
    '<img src="ファイル名" alt="画像の説明"> の形です。今回のファイル名は cat.svg です',
    '<img src="cat.svg" alt="ねこのイラスト"> と書けば完成です',
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>うちのねこ</title>
  </head>
  <body>
    <h1>うちのねこ</h1>
    <img src="cat.svg" alt="ねこのイラスト">
  </body>
</html>
`,
  },
});
