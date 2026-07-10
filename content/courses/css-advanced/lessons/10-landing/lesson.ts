import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>総合: レスポンシブ LP</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <header class="site-header">
      <strong class="brand">GDG GARDEN</strong>
      <nav class="nav">
        <a href="https://example.com">教室について</a>
        <a href="https://example.com">申し込み</a>
      </nav>
    </header>
    <section class="hero">
      <h1 class="hero-title">週末は、庭ですごそう。</h1>
      <p>はじめてでも大丈夫。道具ぜんぶ貸し出しの、90分ガーデニング教室です。</p>
    </section>
    <section class="features">
      <div class="feature-card">
        <h2>たがやす</h2>
        <p>ふかふかの土づくりから。腐葉土と肥料の配合を、手を動かして学びます。</p>
      </div>
      <div class="feature-card">
        <h2>そだてる</h2>
        <p>季節の野菜と花の苗を植え付け。水やりと間引きのコツを覚えます。</p>
      </div>
      <div class="feature-card">
        <h2>あじわう</h2>
        <p>収穫した野菜はその場でランチに。育てた人だけのごほうびです。</p>
      </div>
    </section>
    <section class="voices">
      <h2>参加者の声</h2>
      <p>「ベランダ菜園を始めるきっかけになりました。説明がていねいで安心です」</p>
      <p>「子どもと一緒に参加しました。土にさわる時間は想像以上のリフレッシュでした」</p>
      <p>「収穫ランチが最高でした。次の季節のコースも申し込みました」</p>
    </section>
    <footer class="site-footer">
      <p>GDG GARDEN - 週末ガーデニング教室</p>
    </footer>
  </body>
</html>
`;

const initialCss = `/* 総合演習: 変数 + sticky + Grid + @media で LP を仕上げよう
   手順と数値はスライドにまとまっています */

/* 1. :root で --main-color: #166534 を定義しよう */

body {
  margin: 0;
  font-family: sans-serif;
  color: #1f2937;
}

/* 2. .site-header — 背景色はカスタムプロパティ --main-color を var で参照、
      position: sticky; と top: 0; で画面の上に追従させよう */

/* 3. .hero — 見出し .hero-title は font-size: 40px; に */

/* 4. .features — width: 720px; display: grid;
      repeat を使った 1fr × 3列、column-gap: 24px; でならべよう */

/* 5. .feature-card — 背景や角丸は自由にかざってみよう */

/* 6. 最後に「画面幅 900px 以下のとき」のメディアクエリの中で
      .hero-title を font-size: 32px; にしよう */
`;

const solutionCss = `:root {
  --main-color: #166534;
}

body {
  margin: 0;
  font-family: sans-serif;
  color: #1f2937;
}

.site-header {
  position: sticky;
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background-color: var(--main-color);
  color: white;
}

.site-header a {
  color: white;
  margin-left: 16px;
}

.hero {
  padding: 48px 24px;
  background-color: #f0fdf4;
  text-align: center;
}

.hero-title {
  margin: 0;
  font-size: 40px;
}

.features {
  width: 720px;
  margin: 24px auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 24px;
}

.feature-card {
  padding: 16px;
  background-color: #f0fdf4;
  border-radius: 12px;
}

.feature-card h2 {
  margin-top: 0;
  color: var(--main-color);
}

.voices {
  width: 720px;
  margin: 24px auto;
}

.voices h2 {
  color: var(--main-color);
}

.site-footer {
  padding: 16px 24px;
  background-color: var(--main-color);
  color: white;
  text-align: center;
}

@media (max-width: 900px) {
  .hero-title {
    font-size: 32px;
  }
}
`;

// コースの4部品(変数 / sticky / Grid / @media)の総合演習(CURRICULUM-2)。決定性の設計:
// - .features は width: 720px 固定・padding なし → スクロールバーや body の余白に
//   影響されず、repeat(3, 1fr) + column-gap 24px × 2 → (720 - 48) ÷ 3 = 224px。
// - 判定ビューポートは 800×600 なので (max-width: 900px) は常にマッチし、
//   .hero-title の computed font-size は @media 内の 32px(適用される側)で判定する。
// - #166534 は probe 側で rgb(22, 101, 52) に解決されるため var() 経由でも一致する。
export default defineLesson({
  slug: "css-adv-10-landing",
  title: "総合: レスポンシブ LP",
  estMinutes: 8,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "root-variable",
      type: "source",
      file: "style.css",
      pattern: ":root\\s*\\{[^}]*--main-color\\s*:\\s*#166534",
      message: ":root { } の中に --main-color: #166534; と書いて、テーマカラーの変数を定義しましょう",
    },
    {
      id: "use-var",
      type: "source",
      file: "style.css",
      pattern: "var\\(\\s*--main-color\\s*\\)",
      message: "定義した変数を var(--main-color) の形で使いましょう(まずはヘッダーの背景色から)",
    },
    {
      id: "header-background",
      type: "style",
      selector: ".site-header",
      property: "background-color",
      equals: "#166534",
      message:
        ".site-header の背景色がテーマカラーになっていません。background-color: var(--main-color); と書きましょう",
    },
    {
      id: "header-position",
      type: "style",
      selector: ".site-header",
      property: "position",
      equals: "sticky",
      message: ".site-header に position: sticky; を書いて、画面の上に追従させましょう",
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
      id: "features-display",
      type: "style",
      selector: ".features",
      property: "display",
      equals: "grid",
      message: ".features に display: grid; を書きましょう",
    },
    {
      id: "use-repeat",
      type: "source",
      file: "style.css",
      pattern: "repeat\\(",
      message: "3列の指定は repeat() を使って書きましょう(例: repeat(3, 1fr))",
    },
    {
      id: "features-columns",
      type: "style",
      selector: ".features",
      property: "grid-template-columns",
      equals: "224px 224px 224px",
      message:
        ".features の3列がそれぞれ 224px になっていません。width: 720px; と column-gap: 24px; と grid-template-columns: repeat(3, 1fr); の3つがそろっているか確かめましょう((720 - 48) ÷ 3 = 224px です)",
    },
    {
      id: "media-rule",
      type: "source",
      file: "style.css",
      pattern: "@media\\s*\\(\\s*max-width\\s*:\\s*900px\\s*\\)",
      message: "@media (max-width: 900px) { } のルールをファイルの最後に書きましょう",
    },
    {
      id: "hero-title-size",
      type: "style",
      selector: ".hero-title",
      property: "font-size",
      equals: "32px",
      message:
        "せまい画面で .hero-title が 32px になっていません。@media (max-width: 900px) の中に .hero-title { font-size: 32px; } を書きましょう(判定は幅 800px の画面で行われます)",
    },
  ],
  hints: [
    "4つの部品はどれも、このコースのレッスンで一度書いた形です。01(変数)・07(sticky)・09(Grid)・03(@media)の書き方をそのまま組み合わせましょう",
    ":root { --main-color: #166534; } を定義し、.site-header に position: sticky; top: 0; background-color: var(--main-color); を、.features に width: 720px; display: grid; grid-template-columns: repeat(3, 1fr); column-gap: 24px; を書くのが骨組みです",
    "仕上げに、ファイルの末尾へ @media (max-width: 900px) { .hero-title { font-size: 32px; } } を追加します。ふだんの .hero-title は font-size: 40px; にしておきましょう",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
