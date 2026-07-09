import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>としょかんのおしらせ</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>としょかんのおしらせ</h1>
    <div class="box">来週の月曜日は、開館時間が午後2時からに変わります。</div>
    <div class="box">新しい本の予約は、カウンターで受け付けています。</div>
  </body>
</html>
`;

const styleCss = `.box {
  /* ここに、上と左に 16px の内側の余白(padding)をつけよう */

  /* ここに、下に 2px の実線(solid)の線(border)をつけよう */
}
`;

export default defineLesson({
  slug: "css-04-box",
  title: "ボックスモデル",
  estMinutes: 6,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: styleCss },
  },
  checks: [
    {
      id: "box-padding-top",
      type: "style",
      selector: ".box",
      property: "padding-top",
      equals: "16px",
    },
    {
      id: "box-padding-left",
      type: "style",
      selector: ".box",
      property: "padding-left",
      equals: "16px",
    },
    {
      id: "box-border-style",
      type: "style",
      selector: ".box",
      property: "border-bottom-style",
      equals: "solid",
    },
    {
      id: "box-border-width",
      type: "style",
      selector: ".box",
      property: "border-bottom-width",
      equals: "2px",
    },
  ],
  hints: [
    "内側の余白は padding-top や padding-left のように「padding-方向」のプロパティで1方向ずつ指定します",
    "下線は border-bottom-style: solid; で線の種類を、border-bottom-width: 2px; で太さを指定します。種類を書かないと線は表示されません",
    ".box の中に padding-top: 16px; / padding-left: 16px; / border-bottom-style: solid; / border-bottom-width: 2px; の4行を書けば完成です",
  ],
  solution: {
    "style.css": `.box {
  padding-top: 16px;
  padding-left: 16px;
  border-bottom-style: solid;
  border-bottom-width: 2px;
}
`,
  },
});
