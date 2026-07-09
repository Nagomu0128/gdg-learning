import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "html-09-id-class",
  title: "idとclass",
  estMinutes: 6,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>おすすめの本</title>
  </head>
  <body>
    <!-- この h1 に id="main-title" を付けよう -->
    <h1>おすすめの本</h1>
    <!-- この p に class="intro" を付けよう -->
    <p>わたしのすきな本をしょうかいします。</p>
    <ul>
      <!-- 3つの li すべてに class="item" を付けよう -->
      <li>ハリー・ポッター</li>
      <li>ナルニア国物語</li>
      <li>モモ</li>
    </ul>
  </body>
</html>
`,
    },
  },
  checks: [
    { id: "h1-id", type: "attribute", selector: "h1", name: "id", equals: "main-title" },
    {
      id: "intro-class",
      type: "element",
      selector: "p.intro",
      message: 'p タグに class="intro" を付けましょう',
    },
    {
      id: "item-count",
      type: "element",
      selector: ".item",
      count: 3,
      message: '3つの li すべてに class="item" を付けましょう',
    },
  ],
  hints: [
    "id と class は、開始タグの中に書く「名前」の属性です。id はページに1つだけ、class は同じ名前を何回でも使えます",
    'id は <h1 id="main-title">、class は <p class="intro"> のように、タグ名のあとに半角スペースを入れて書きます',
    'li は3つとも <li class="item">本の名前</li> の形にします',
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>おすすめの本</title>
  </head>
  <body>
    <h1 id="main-title">おすすめの本</h1>
    <p class="intro">わたしのすきな本をしょうかいします。</p>
    <ul>
      <li class="item">ハリー・ポッター</li>
      <li class="item">ナルニア国物語</li>
      <li class="item">モモ</li>
    </ul>
  </body>
</html>
`,
  },
});
