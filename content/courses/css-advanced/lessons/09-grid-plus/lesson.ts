import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>Grid 上級</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>きょうのレシピ</h1>
    <div class="cards">
      <div class="card">
        <h2>春野菜のサラダ</h2>
        <p>ゆで卵と豆のグリーンサラダ。</p>
      </div>
      <div class="card">
        <h2>トマトのパスタ</h2>
        <p>完熟トマトを煮込んだ定番の味。</p>
      </div>
      <div class="card">
        <h2>鶏肉のグリル</h2>
        <p>皮はパリッと、中はジューシー。</p>
      </div>
      <div class="card">
        <h2>コーンスープ</h2>
        <p>とうもろこしの甘みたっぷり。</p>
      </div>
      <div class="card">
        <h2>フレンチトースト</h2>
        <p>ひと晩ひたした、しっとり食感。</p>
      </div>
      <div class="card">
        <h2>りんごのケーキ</h2>
        <p>バターの香りとりんごの酸味。</p>
      </div>
    </div>
  </body>
</html>
`;

const initialCss = `body {
  font-family: sans-serif;
}

.cards {
  /* 判定を安定させるため、親の幅は 720px に固定してあります */
  width: 720px;
  display: grid;
  column-gap: 24px;
  row-gap: 24px;
  /* ここに grid-template-columns を書こう:
     repeat と minmax を使って「最小 100px、あまりは等分」の列を3本ならべる */
}

.card {
  padding: 16px;
  background-color: #fef9c3;
  border-radius: 8px;
}

.card h2 {
  margin-top: 0;
  font-size: 18px;
}

.card p {
  margin-bottom: 0;
}
`;

const solutionCss = `body {
  font-family: sans-serif;
}

.cards {
  /* 判定を安定させるため、親の幅は 720px に固定してあります */
  width: 720px;
  display: grid;
  column-gap: 24px;
  row-gap: 24px;
  grid-template-columns: repeat(3, minmax(100px, 1fr));
}

.card {
  padding: 16px;
  background-color: #fef9c3;
  border-radius: 8px;
}

.card h2 {
  margin-top: 0;
  font-size: 18px;
}

.card p {
  margin-bottom: 0;
}
`;

// repeat()/minmax() は computed 値(使用値)に残らないため source check で書かせ、
// レイアウト結果は 800px 判定ビューポートでの computed grid-template-columns を
// style check で確かめる(CURRICULUM-2 の Grid 上級規約)。期待値の計算:
// .cards は width: 720px 固定・padding なし → コンテンツ幅 720px。
// 列間 column-gap 24px × 2 = 48px を引いた 672px を 1fr × 3 で等分 → 各列 224px。
// minmax の最小 100px は長さ指定なので内容の幅に影響されず、スクロールバーが出ても
// 親幅 720px は変わらない(決定的)。
export default defineLesson({
  slug: "css-adv-09-grid-plus",
  title: "Grid 上級",
  estMinutes: 7,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "use-repeat",
      type: "source",
      file: "style.css",
      pattern: "repeat\\(",
      message: "列のくり返しは repeat() で書きましょう(例: repeat(3, 1fr) は 1fr の列を3本)",
    },
    {
      id: "use-minmax",
      type: "source",
      file: "style.css",
      pattern: "minmax\\(",
      message: "列の幅には minmax() を使って「最小 100px、最大 1fr」を指定しましょう",
    },
    {
      id: "cards-columns",
      type: "style",
      selector: ".cards",
      property: "grid-template-columns",
      equals: "224px 224px 224px",
      message:
        "3列がそれぞれ 224px になっていません。.cards に grid-template-columns: repeat(3, minmax(100px, 1fr)); と書きましょう(幅 720px からすきま 24px × 2 を引いた 672px を3等分すると 224px です)",
    },
  ],
  hints: [
    "repeat(回数, 幅) は同じ幅の列をくり返す書き方です。grid-template-columns: repeat(3, 1fr); は 1fr 1fr 1fr と同じ意味になります",
    "minmax(最小, 最大) は「せまくても最小より細くならず、広ければ最大まで伸びる」幅の指定です。repeat の「幅」の部分にそのまま入れられます",
    ".cards に grid-template-columns: repeat(3, minmax(100px, 1fr)); と書けば完成です",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
