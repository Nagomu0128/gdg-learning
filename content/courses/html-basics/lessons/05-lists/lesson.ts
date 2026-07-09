import { defineLesson } from "@codesteps/lesson-kit";

// CURRICULUM #5(穴埋め): ul/li と ol。li の個数は element check の count(厳密一致)で判定
export default defineLesson({
  slug: "html-05-lists",
  title: "リストでならべる",
  estMinutes: 6,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>リストの練習</title>
  </head>
  <body>
    <h1>すきなくだもの</h1>
    <ul>
      <li>りんご</li>
      <!-- ここに li を2つ書き足して、くだものを3つにしよう -->
    </ul>
    <h2>あさやること</h2>
    <!-- ここに ol タグで、朝やることを2つ順番にならべよう -->
  </body>
</html>
`,
    },
  },
  checks: [
    { type: "element", id: "ul-exists", selector: "ul" },
    {
      type: "element",
      id: "ul-li-count",
      selector: "ul > li",
      count: 3,
      message: "ul の中の li を3個にしましょう",
    },
    { type: "element", id: "ol-exists", selector: "ol" },
    {
      type: "element",
      id: "ol-li-count",
      selector: "ol > li",
      count: 2,
      message: "ol の中の li を2個にしましょう",
    },
  ],
  hints: [
    "箇条書きは ul タグ、番号つきのリストは ol タグで作ります。項目は1つずつ li タグで囲んで、ul や ol の中に入れます",
    "<ul> の中に <li>項目</li> をならべます。ol も同じ形で、<ol> の中に <li>項目</li> をならべます",
    "ul の中の li を合計3個にして、<ol><li>顔をあらう</li><li>あさごはんを食べる</li></ol> のような ol を書き足せば完成です",
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>リストの練習</title>
  </head>
  <body>
    <h1>すきなくだもの</h1>
    <ul>
      <li>りんご</li>
      <li>バナナ</li>
      <li>みかん</li>
    </ul>
    <h2>あさやること</h2>
    <ol>
      <li>顔をあらう</li>
      <li>あさごはんを食べる</li>
    </ol>
  </body>
</html>
`,
  },
});
