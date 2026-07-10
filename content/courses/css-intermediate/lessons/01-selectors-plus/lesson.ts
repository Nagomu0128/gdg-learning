import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>カフェのお品書き</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>カフェ こもれび</h1>
    <h2>本日のおすすめ</h2>
    <p>シェフが選んだ、今いちばんの一皿をどうぞ。</p>
    <p>気になる料理があれば、スタッフにお声がけください。</p>
    <ul>
      <li>
        パスタ
        <ol>
          <li>トマトソース</li>
          <li>クリームソース</li>
        </ol>
      </li>
      <li>マルゲリータピザ</li>
      <li>季節のサラダ</li>
    </ul>
  </body>
</html>
`;

const initialCss = `body {
  font-family: sans-serif;
}

/* ここに h1, h2 のルールを書いて、見出し2つの色をまとめて darkslateblue にしよう */

/* ここに ul > li のルールを書いて、ul の直下の li だけに左のラインを付けよう */

/* ここに h2 + p のルールを書いて、h2 の直後の段落だけ背景を lightyellow にしよう */
`;

const solutionCss = `body {
  font-family: sans-serif;
}

h1, h2 {
  color: darkslateblue;
}

ul > li {
  border-left-width: 4px;
  border-left-style: solid;
  border-left-color: steelblue;
  padding-left: 8px;
}

h2 + p {
  background-color: lightyellow;
}
`;

export default defineLesson({
  slug: "css-int-01-selectors-plus",
  title: "セレクタ応用",
  estMinutes: 6,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "group-selector",
      type: "source",
      file: "style.css",
      pattern: "(h1\\s*,\\s*h2|h2\\s*,\\s*h1)\\s*\\{",
      message: "h1 と h2 をコンマで区切った「h1, h2」のルールを書きましょう",
    },
    {
      id: "h1-color",
      type: "style",
      selector: "h1",
      property: "color",
      equals: "darkslateblue",
    },
    {
      id: "h2-color",
      type: "style",
      selector: "h2",
      property: "color",
      equals: "darkslateblue",
    },
    {
      id: "child-li-border-style",
      type: "style",
      selector: "ul > li",
      property: "border-left-style",
      equals: "solid",
      message: "ul > li のルールで、li の左に solid のライン(border-left-style)を付けましょう",
    },
    {
      id: "child-li-border-color",
      type: "style",
      selector: "ul > li",
      property: "border-left-color",
      equals: "steelblue",
      message: "ul > li の左のラインの色(border-left-color)を steelblue にしましょう",
    },
    {
      id: "adjacent-p-bg",
      type: "style",
      selector: "h2 + p",
      property: "background-color",
      equals: "lightyellow",
      message: "h2 + p のルールで、h2 の直後の段落の背景色を lightyellow にしましょう",
    },
  ],
  hints: [
    "セレクタをコンマで区切ると複数の相手にまとめて指定できます。> は「直下の子」、+ は「直後のとなり」を選ぶ記号です",
    "h1, h2 { ... } / ul > li { ... } / h2 + p { ... } の3つのルールを作ります。書く内容はスライドの最後の1枚にまとまっています",
    "h1, h2 { color: darkslateblue; }、ul > li { border-left-width: 4px; border-left-style: solid; border-left-color: steelblue; padding-left: 8px; }、h2 + p { background-color: lightyellow; } の3つを書けば完成です",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
