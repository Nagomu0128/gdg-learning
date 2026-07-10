import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>まいにちニュース</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>まいにちニュース</h1>
    <div class="layout">
      <main class="main">メイン記事: 駅前に新しい図書館がオープンしました。</main>
      <aside class="side">サイドメニュー</aside>
    </div>
    <h2>今日のトピック</h2>
    <ul class="topics">
      <li>料理</li>
      <li>旅行</li>
      <li class="pickup">特集</li>
      <li>音楽</li>
      <li>スポーツ</li>
      <li>映画</li>
    </ul>
  </body>
</html>
`;

const initialCss = `body {
  font-family: sans-serif;
}

.layout {
  display: flex;
  column-gap: 16px;
}

.main {
  background-color: #e0f2fe;
  border-radius: 8px;
  padding-top: 16px;
  padding-right: 16px;
  padding-bottom: 16px;
  padding-left: 16px;
  /* ここに flex-grow: 1; を書いて、あまった幅をメイン記事に引き受けさせよう */
}

.side {
  background-color: #f1f5f9;
  border-radius: 8px;
  padding-top: 16px;
  padding-right: 16px;
  padding-bottom: 16px;
  padding-left: 16px;
  /* ここに flex-basis を書いて、幅の基準を 200px にしよう */
}

.topics {
  display: flex;
  column-gap: 8px;
  row-gap: 8px;
  list-style: none;
  padding-left: 0;
  /* ここに flex-wrap を書いて、入りきらないトピックを次の行に折り返そう */
}

.topics li {
  width: 160px;
  background-color: #fef9c3;
  border-radius: 8px;
  padding-top: 8px;
  padding-bottom: 8px;
  text-align: center;
}

.topics .pickup {
  background-color: #fde68a;
  font-weight: bold;
  /* ここに order: -1; を書いて、「特集」をいちばん前に動かそう */
}
`;

const solutionCss = `body {
  font-family: sans-serif;
}

.layout {
  display: flex;
  column-gap: 16px;
}

.main {
  background-color: #e0f2fe;
  border-radius: 8px;
  padding-top: 16px;
  padding-right: 16px;
  padding-bottom: 16px;
  padding-left: 16px;
  flex-grow: 1;
}

.side {
  background-color: #f1f5f9;
  border-radius: 8px;
  padding-top: 16px;
  padding-right: 16px;
  padding-bottom: 16px;
  padding-left: 16px;
  flex-basis: 200px;
}

.topics {
  display: flex;
  column-gap: 8px;
  row-gap: 8px;
  list-style: none;
  padding-left: 0;
  flex-wrap: wrap;
}

.topics li {
  width: 160px;
  background-color: #fef9c3;
  border-radius: 8px;
  padding-top: 8px;
  padding-bottom: 8px;
  text-align: center;
}

.topics .pickup {
  background-color: #fde68a;
  font-weight: bold;
  order: -1;
}
`;

// すべて longhand で書かせる(flex shorthand は SHORTHAND_BLOCKLIST — 教材でも使わない)。
// 判定ビューポート 800x600 では li(160px)が6個 + gap で1行に入りきらず、wrap で2行になる。
export default defineLesson({
  slug: "css-int-05-flex-plus",
  title: "Flexbox 応用",
  estMinutes: 7,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "main-grow",
      type: "style",
      selector: ".main",
      property: "flex-grow",
      equals: "1",
      message: ".main に flex-grow: 1 を書いて、あまった幅を引き受けさせましょう",
    },
    {
      id: "side-basis",
      type: "style",
      selector: ".side",
      property: "flex-basis",
      equals: "200px",
      message: ".side に flex-basis: 200px を書いて、幅の基準を決めましょう",
    },
    {
      id: "topics-wrap",
      type: "style",
      selector: ".topics",
      property: "flex-wrap",
      equals: "wrap",
      message: ".topics に flex-wrap: wrap を書いて、入りきらないトピックを折り返しましょう",
    },
    {
      id: "pickup-order",
      type: "style",
      selector: ".pickup",
      property: "order",
      equals: "-1",
      message: "「特集」(.pickup)に order: -1 を書いて、いちばん前に動かしましょう",
    },
  ],
  hints: [
    "flex-grow(あまった幅の引き受け方)と flex-basis(幅の基準)は子に、flex-wrap(折り返し)は親に、order(ならび順)は動かしたい子に書きます",
    "書く場所は4か所です。.main に flex-grow を、.side に flex-basis を、.topics に flex-wrap を、.topics .pickup に order を追加します",
    ".main { flex-grow: 1; }、.side { flex-basis: 200px; }、.topics { flex-wrap: wrap; }、.topics .pickup { order: -1; } を書けば完成です",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
