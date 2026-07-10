import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>追従ヘッダー</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <header class="site-header">
      <strong class="brand">GDG TRAVEL</strong>
      <a href="https://example.com">ツアー一覧</a>
      <a href="https://example.com">お問い合わせ</a>
    </header>
    <main>
      <h1>世界の絶景ツアー</h1>
      <p>一生に一度は見たい風景を、現地ガイドと一緒にめぐる旅。人気の8コースを紹介します。</p>
      <section>
        <h2>オーロラの夜空</h2>
        <p>北極圏の澄んだ夜空に、緑のカーテンがゆらめきます。防寒具は現地でレンタルできるので、身軽に参加できます。</p>
        <p>観測のベストシーズンは冬。夜は氷のホテルに宿泊します。</p>
      </section>
      <section>
        <h2>砂漠の星空キャンプ</h2>
        <p>見わたすかぎりの砂丘で、日没から夜明けまでを過ごします。空が近いと感じるほどの星の数です。</p>
        <p>朝はラクダに乗って、朝日の昇る砂丘の頂上へ向かいます。</p>
      </section>
      <section>
        <h2>湖にうつる山々</h2>
        <p>風のない朝だけ現れる、鏡のような湖面。対岸の雪山がそのまま水面にうつり込みます。</p>
        <p>湖畔のロッジで焼きたてのパンとチーズの朝食をどうぞ。</p>
      </section>
      <section>
        <h2>段々畑の夕暮れ</h2>
        <p>山の斜面に幾重にも重なる棚田が、夕日を受けて黄金色にかがやきます。</p>
        <p>収穫の時期には、村のお祭りにも参加できます。</p>
      </section>
      <section>
        <h2>青の洞窟クルーズ</h2>
        <p>小さなボートで洞窟へ入ると、海面が下から光るように青くかがやきます。</p>
        <p>波の静かな午前中だけ入れる、期間限定のコースです。</p>
      </section>
      <section>
        <h2>花畑の丘</h2>
        <p>春のわずか2週間だけ、丘全体が一面の花でおおわれます。みつばちの羽音まで聞こえる静かな場所です。</p>
        <p>丘のふもとのカフェでは、はちみつのスイーツが人気です。</p>
      </section>
      <section>
        <h2>氷河ハイキング</h2>
        <p>青白くかがやく氷の上を、アイゼンを付けて歩きます。ガイドが安全なルートを案内します。</p>
        <p>途中で出会う氷の洞窟は、思わず息をのむ美しさです。</p>
      </section>
      <section>
        <h2>天空の遺跡</h2>
        <p>雲より高い場所に築かれた石の都市。朝もやが晴れると、遺跡の全景が姿を現します。</p>
        <p>高山病を防ぐため、ふもとの村で1泊してから登ります。</p>
      </section>
    </main>
  </body>
</html>
`;

const initialCss = `body {
  margin: 0;
  font-family: sans-serif;
}

.site-header {
  /* ここに position: sticky; と top: 0; を書いて、
     スクロールしてもヘッダーが画面の上に残るようにしよう */
  padding: 12px 16px;
  background-color: #1d4ed8;
  color: white;
}

.site-header a {
  color: white;
  margin-left: 12px;
}

main {
  padding: 16px;
}

h2 {
  color: #1d4ed8;
}
`;

const solutionCss = `body {
  margin: 0;
  font-family: sans-serif;
}

.site-header {
  position: sticky;
  top: 0;
  padding: 12px 16px;
  background-color: #1d4ed8;
  color: white;
}

.site-header a {
  color: white;
  margin-left: 12px;
}

main {
  padding: 16px;
}

h2 {
  color: #1d4ed8;
}
`;

// position / top は style check(computed は "sticky" / "0px")。仕上げの custom check は
// 実際に 300px スクロールしてヘッダーが上端(rect.top = 0)に残ることを検証する。
// 本文は 8 セクション(約 1500px 超)あるため 800×600 の判定ビューポートで必ずスクロールでき、
// scrollTo は同期・getBoundingClientRect は強制レイアウトなので待ち時間なしで決定的。
export default defineLesson({
  slug: "css-adv-07-sticky",
  title: "追従ヘッダー",
  estMinutes: 5,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "header-position",
      type: "style",
      selector: ".site-header",
      property: "position",
      equals: "sticky",
      message: ".site-header に position: sticky; を書きましょう",
    },
    {
      id: "header-top",
      type: "style",
      selector: ".site-header",
      property: "top",
      equals: "0px",
      message: ".site-header に top: 0; を書いて、はり付く位置を画面の上端にしましょう",
    },
    {
      id: "header-sticks",
      type: "custom",
      message:
        "スクロールしてもヘッダーが画面の上に残るようにしましょう(position: sticky; と top: 0; の両方が必要です)",
      run: (ctx) => {
        const header = ctx.document.querySelector(".site-header");
        if (header === null) return false;
        ctx.window.scrollTo(0, 300);
        const top = header.getBoundingClientRect().top;
        return Math.abs(top) <= 1;
      },
    },
  ],
  hints: [
    "ふつうの要素はスクロールと一緒に流れていきます。position: sticky を指定した要素は、画面から出そうになると指定した位置にはり付いて追従します",
    "はり付く位置は top で決めます。top: 0; なら画面の上端です。position: sticky と top はセットで書かないと効きません",
    ".site-header のルールに position: sticky; と top: 0; の2行を書きたせば完成です",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
