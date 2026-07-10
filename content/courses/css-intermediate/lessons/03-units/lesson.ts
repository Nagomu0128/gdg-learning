import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>コラム: 朝の散歩</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div class="container">
      <div class="card">
        <h2>朝の散歩のすすめ</h2>
        <p class="lead">朝の15分の散歩は、頭をすっきりさせてくれます。</p>
        <p>太陽の光を浴びると体内時計が整って、夜もぐっすり眠れるようになると言われています。今日から始めてみませんか。</p>
      </div>
    </div>
  </body>
</html>
`;

const initialCss = `body {
  margin: 0;
  font-family: sans-serif;
}

.container {
  width: 800px;
  background-color: #f1f5f9;
  padding-top: 24px;
  padding-bottom: 24px;
}

.card {
  background-color: #ffffff;
  border-radius: 8px;
  padding-top: 16px;
  padding-right: 16px;
  padding-bottom: 16px;
  padding-left: 16px;
  margin-left: auto;
  margin-right: auto;
  /* ここに width を % で書いて、カードの幅を親(800px)の半分にしよう */
}

.lead {
  /* ここに font-size を rem で書いて、リード文を 1.5rem にしよう */
}
`;

const solutionCss = `body {
  margin: 0;
  font-family: sans-serif;
}

.container {
  width: 800px;
  background-color: #f1f5f9;
  padding-top: 24px;
  padding-bottom: 24px;
}

.card {
  background-color: #ffffff;
  border-radius: 8px;
  padding-top: 16px;
  padding-right: 16px;
  padding-bottom: 16px;
  padding-left: 16px;
  margin-left: auto;
  margin-right: auto;
  width: 50%;
}

.lead {
  font-size: 1.5rem;
}
`;

// rem の適用先は p(.lead)にする: h2 だと 1.5rem = UA 既定値(1.5em = 24px)と同値になり空検証になる。
// % の基準は .container の width: 800px(判定ビューポート 800x600 に一致する明示幅)。
export default defineLesson({
  slug: "css-int-03-units",
  title: "単位を使い分ける",
  estMinutes: 6,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "lead-rem-source",
      type: "source",
      file: "style.css",
      pattern: "font-size\\s*:\\s*1\\.5rem",
      message: "リード文(.lead)の font-size を rem 単位(1.5rem)で書きましょう",
    },
    {
      id: "lead-size",
      type: "style",
      selector: ".lead",
      property: "font-size",
      equals: "24px",
      message: ".lead の font-size が 24px(16px × 1.5 = 1.5rem)になっていません",
    },
    {
      id: "card-percent-source",
      type: "source",
      file: "style.css",
      pattern: "(?<!-)width\\s*:\\s*50%",
      message: ".card の width を % 単位(50%)で書きましょう",
    },
    {
      id: "card-width",
      type: "style",
      selector: ".card",
      property: "width",
      equals: "400px",
      message: ".card の幅が 400px(親の 800px の 50%)になっていません",
    },
  ],
  hints: [
    "rem はルート(html)の文字サイズ 16px を 1 とする単位、% は親要素のサイズを 100 とする単位です。どちらも「基準 × 数字」で実際の大きさが決まります",
    ".lead のルールに font-size を rem で、.card のルールに width を % で追加します。1.5rem は 16px × 1.5 = 24px、50% は親の 800px の半分 = 400px です",
    ".lead に font-size: 1.5rem; を、.card に width: 50%; を書けば完成です",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
