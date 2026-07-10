import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>メディアクエリ</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <header class="site-header">
      <h1>GDG CAFE</h1>
      <nav>
        <ul class="menu">
          <li><a href="https://example.com">メニュー</a></li>
          <li><a href="https://example.com">店舗案内</a></li>
          <li><a href="https://example.com">お知らせ</a></li>
        </ul>
      </nav>
    </header>
    <p>季節のブレンドをご用意して、お待ちしています。</p>
  </body>
</html>
`;

const initialCss = `body {
  font-family: sans-serif;
}

.site-header {
  padding: 16px;
  background-color: #ecfdf5;
}

.menu {
  list-style: none;
  padding-left: 0;
  display: flex;
  flex-direction: row;
  column-gap: 16px;
}

/* ここに「画面幅 900px 以下のとき」に適用されるメディアクエリのルールを書こう
   画面幅が 900px 以下のときは、.menu を
   ・flex-direction: column;(縦ならび)
   ・row-gap: 8px;(縦のすきま 8px)
   に変える */
`;

const solutionCss = `body {
  font-family: sans-serif;
}

.site-header {
  padding: 16px;
  background-color: #ecfdf5;
}

.menu {
  list-style: none;
  padding-left: 0;
  display: flex;
  flex-direction: row;
  column-gap: 16px;
}

@media (max-width: 900px) {
  .menu {
    flex-direction: column;
    row-gap: 8px;
  }
}
`;

// 判定ビューポートは 800×600 固定(§6.3)なので、(max-width: 900px) は常にマッチする。
// メディアクエリ内の宣言は「適用された側」の computed 値を style check で判定する(CURRICULUM-2)。
export default defineLesson({
  slug: "css-adv-03-media",
  title: "メディアクエリ",
  estMinutes: 6,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "media-rule",
      type: "source",
      file: "style.css",
      pattern: "@media\\s*\\(\\s*max-width\\s*:\\s*900px\\s*\\)",
      message: "@media (max-width: 900px) { } のルールを書きましょう",
    },
    {
      id: "menu-column",
      type: "style",
      selector: ".menu",
      property: "flex-direction",
      equals: "column",
      message:
        "画面幅 900px 以下で .menu の flex-direction が column になっていません。@media の中に .menu のルールを書きましょう(判定は幅 800px の画面で行われます)",
    },
    {
      id: "menu-row-gap",
      type: "style",
      selector: ".menu",
      property: "row-gap",
      equals: "8px",
      message: "@media の中の .menu に row-gap: 8px; を書いて、縦ならびのすきまを空けましょう",
    },
  ],
  hints: [
    "メディアクエリは「条件に合う画面のときだけ」中のルールを適用するしくみです。@media (条件) { ルール } の形で書きます",
    "条件は (max-width: 900px)(幅 900px 以下)。中にはふだんと同じように .menu { } のルールを書くので、ネストが1段深くなります",
    "@media (max-width: 900px) { .menu { flex-direction: column; row-gap: 8px; } } と書けば完成です",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
