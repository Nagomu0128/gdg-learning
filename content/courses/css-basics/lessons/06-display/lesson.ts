import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>カフェ こもれび</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>カフェ こもれび</h1>
    <ul class="menu">
      <li>ホーム</li>
      <li>メニュー</li>
      <li>アクセス</li>
    </ul>
    <p class="hidden">ただいまサイトを準備中です</p>
    <p>自家焙煎のコーヒーと手作りスイーツのお店です。</p>
  </body>
</html>
`;

const initialCss = `body {
  font-family: sans-serif;
  background-color: #fffbeb;
}

h1 {
  color: #92400e;
}

.menu {
  list-style: none;
  padding-left: 0;
}

li {
  background-color: #fde68a;
  padding: 8px 16px;
  /* ここに display を書いて、メニューを横にならべよう */
}

.hidden {
  /* ここに display を書いて、準備中のお知らせを消そう */
}
`;

const solutionCss = `body {
  font-family: sans-serif;
  background-color: #fffbeb;
}

h1 {
  color: #92400e;
}

.menu {
  list-style: none;
  padding-left: 0;
}

li {
  background-color: #fde68a;
  padding: 8px 16px;
  display: inline-block;
}

.hidden {
  display: none;
}
`;

export default defineLesson({
  slug: "css-06-display",
  title: "並べ方を変える display",
  estMinutes: 6,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "li-inline-block",
      type: "style",
      selector: "li",
      property: "display",
      equals: "inline-block",
    },
    {
      id: "hidden-none",
      type: "style",
      selector: ".hidden",
      property: "display",
      equals: "none",
    },
  ],
  hints: [
    "要素のならび方は display プロパティで変えられます。li はふつうブロックなので、たてにならんでいます",
    "横にならべたい要素には display: inline-block を、消したい要素には display: none を指定します",
    "li のルールに display: inline-block; を、.hidden のルールに display: none; を書けば完成です",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
