import { defineLesson } from "@codesteps/lesson-kit";

// CURRICULUM-2 html-intermediate #4(穴埋め): figure / figcaption / img。assets/graph.svg を同梱
export default defineLesson({
  slug: "html-int-04-figure",
  title: "図版と説明",
  estMinutes: 6,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>気温レポート</title>
  </head>
  <body>
    <h1>今週の気温レポート</h1>
    <p>今週は少しずつあたたかくなりました。グラフで見てみましょう。</p>
    <!-- ここに figure タグを書き、中に img(graph.svg)と figcaption を入れよう -->
  </body>
</html>
`,
    },
  },
  checks: [
    { type: "element", id: "figure-exists", selector: "figure", count: 1 },
    {
      type: "element",
      id: "figure-img",
      selector: "figure > img",
      message: "figure の中に img タグを入れましょう",
    },
    {
      type: "attribute",
      id: "img-src",
      selector: "figure > img",
      name: "src",
      equals: "graph.svg",
      message: "img の src 属性を「graph.svg」にしましょう",
    },
    {
      type: "attribute",
      id: "img-alt",
      selector: "figure > img",
      name: "alt",
      exists: true,
      message: "img に alt 属性(画像の内容の説明)を付けましょう",
    },
    {
      type: "text",
      id: "figcaption-text",
      selector: "figcaption",
      contains: "図1",
      message: "figcaption に「図1」ではじまる説明文を書きましょう(例: 図1: 今週の気温の変化)",
    },
  ],
  hints: [
    "図やグラフは figure タグで囲み、キャプション(説明文)は figcaption タグで書きます。img には画像の内容を説明する alt 属性も付けます",
    '<figure><img src="ファイル名" alt="画像の説明"><figcaption>図1: キャプション</figcaption></figure> の形です。今回のファイル名は graph.svg です',
    '<figure><img src="graph.svg" alt="気温の変化を表す折れ線グラフ"><figcaption>図1: 今週の気温の変化</figcaption></figure> と書けば完成です',
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>気温レポート</title>
  </head>
  <body>
    <h1>今週の気温レポート</h1>
    <p>今週は少しずつあたたかくなりました。グラフで見てみましょう。</p>
    <figure>
      <img src="graph.svg" alt="気温の変化を表す折れ線グラフ">
      <figcaption>図1: 今週の気温の変化</figcaption>
    </figure>
  </body>
</html>
`,
  },
});
