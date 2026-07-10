import { defineLesson } from "@codesteps/lesson-kit";

// CURRICULUM-2 html-intermediate #5(穴埋め): 入れ子リスト(ul ul li)と説明リスト(dl/dt/dd)
export default defineLesson({
  slug: "html-int-05-nested-lists",
  title: "入れ子リストと説明リスト",
  estMinutes: 7,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>旅のじゅんび</title>
  </head>
  <body>
    <h1>旅のじゅんび</h1>
    <h2>持ち物リスト</h2>
    <ul>
      <li>着がえ</li>
      <li>おやつ
        <!-- ここに ul タグを書いて、おやつの中身を li で2つならべよう -->
      </li>
    </ul>
    <h2>ことばの説明</h2>
    <!-- ここに dl タグを書き、dt(ことば)と dd(説明)のペアを2組ならべよう -->
  </body>
</html>
`,
    },
  },
  checks: [
    {
      type: "element",
      id: "ul-count",
      selector: "ul",
      count: 2,
      message: "ul タグを2個にしましょう(外側のリストと、入れ子のリスト)",
    },
    {
      type: "element",
      id: "nested-li-count",
      selector: "ul ul li",
      count: 2,
      message: "入れ子の ul の中に li を2個入れましょう",
    },
    { type: "element", id: "dl-exists", selector: "dl", count: 1 },
    {
      type: "element",
      id: "dt-count",
      selector: "dl dt",
      count: 2,
      message: "dl の中に dt(ことば)を2個書きましょう",
    },
    {
      type: "element",
      id: "dd-count",
      selector: "dl dd",
      count: 2,
      message: "dl の中に dd(説明)を2個書きましょう",
    },
  ],
  hints: [
    "リストの項目の中にリストを入れるときは、li の閉じタグの前に ul を書きます。ことばと説明のペアは dl で囲み、ことばを dt、説明を dd に書きます",
    "<li>おやつ<ul><li>項目</li><li>項目</li></ul></li> のように、内側の ul は li の中に入れます。dl は <dl><dt>ことば</dt><dd>説明</dd></dl> の形で、ペアを2組ならべます",
    "おやつの li の中に <ul><li>チョコレート</li><li>クッキー</li></ul> を、ことばの説明の下に <dl><dt>リュック</dt><dd>背中にせおうかばんのことです。</dd><dt>すいとう</dt><dd>飲み物を入れて持ち歩く入れ物です。</dd></dl> を書けば完成です",
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>旅のじゅんび</title>
  </head>
  <body>
    <h1>旅のじゅんび</h1>
    <h2>持ち物リスト</h2>
    <ul>
      <li>着がえ</li>
      <li>おやつ
        <ul>
          <li>チョコレート</li>
          <li>クッキー</li>
        </ul>
      </li>
    </ul>
    <h2>ことばの説明</h2>
    <dl>
      <dt>リュック</dt>
      <dd>背中にせおうかばんのことです。</dd>
      <dt>すいとう</dt>
      <dd>飲み物を入れて持ち歩く入れ物です。</dd>
    </dl>
  </body>
</html>
`,
  },
});
