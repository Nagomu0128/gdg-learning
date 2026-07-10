import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>::before / ::after</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>今週のおすすめスポット</h1>
    <ul class="list">
      <li class="item">朝焼けがきれいな海辺の公園</li>
      <li class="item">駅前にできた新しいベーカリー</li>
      <li class="item">夜景を一望できる展望台</li>
    </ul>
  </body>
</html>
`;

const initialCss = `body {
  font-family: sans-serif;
}

.list {
  list-style: none;
  padding-left: 0;
}

.item {
  margin-bottom: 8px;
}

/* ここに .item::before のルールを書こう
   ・content: "★"; で各項目の先頭に星を付ける
   ・color: orange; で星だけ色を変える */
`;

const solutionCss = `body {
  font-family: sans-serif;
}

.list {
  list-style: none;
  padding-left: 0;
}

.item {
  margin-bottom: 8px;
}

.item::before {
  content: "★";
  color: orange;
}
`;

// ::before は computed style check では判定できない(querySelector が擬似要素を選べない)ため、
// source check + custom check(getComputedStyle(el, "::before"))の併用で検証する(CURRICULUM-2)。
export default defineLesson({
  slug: "css-adv-04-pseudo-elements",
  title: "::before / ::after",
  estMinutes: 6,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "before-rule",
      type: "source",
      file: "style.css",
      pattern: "\\.item::before\\s*\\{",
      message: ".item::before { } のルールを書きましょう(コロンは2つ重ねます)",
    },
    {
      id: "before-content-decl",
      type: "source",
      file: "style.css",
      pattern: "\\.item::before\\s*\\{[^}]*content\\s*:",
      message: "::before のルールの中に content を書きましょう(content がないと擬似要素は表示されません)",
    },
    {
      id: "before-star",
      type: "custom",
      message: '各項目の先頭に content: "★"; で星を付けましょう',
      run: (ctx) => {
        const items = ctx.document.querySelectorAll(".item");
        if (items.length === 0) return false;
        for (const item of items) {
          if (ctx.window.getComputedStyle(item, "::before").content !== '"★"') return false;
        }
        return true;
      },
    },
    {
      id: "before-color",
      type: "custom",
      message: "星の色が orange になっていません。::before のルールの中に color: orange; を書きましょう",
      run: (ctx) => {
        const items = ctx.document.querySelectorAll(".item");
        if (items.length === 0) return false;
        for (const item of items) {
          if (ctx.window.getComputedStyle(item, "::before").color !== "rgb(255, 165, 0)") return false;
        }
        return true;
      },
    },
  ],
  hints: [
    "擬似要素 ::before は「要素の中身の先頭」に、HTML を書き換えずに飾りを追加します。セレクタは .item::before のようにコロンを2つ重ねます",
    '::before には content プロパティが必須です。表示したい文字を content: "★"; のように引用符で囲んで書きます',
    '.item::before { content: "★"; color: orange; } と書けば完成です',
  ],
  solution: {
    "style.css": solutionCss,
  },
});
