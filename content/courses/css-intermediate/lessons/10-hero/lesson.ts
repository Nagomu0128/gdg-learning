import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>そらたび</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <section class="hero">
      <span class="badge">夏の予約受付中</span>
      <div class="hero-inner">
        <h1>週末、空の旅へ。</h1>
        <p>行き先を選ぶだけで、旅のプランがきっと見つかります。</p>
        <a class="cta" href="https://example.com">旅を計画する</a>
      </div>
    </section>
  </body>
</html>
`;

const initialCss = `body {
  margin: 0;
  font-family: sans-serif;
}

/* ここに .hero のルールを書こう
   ・height: 400px と background-color: #e0f2fe で舞台を作る
   ・display: flex にして、justify-content と align-items で .hero-inner を上下左右の中央に
   ・position: relative でバッジの基準にする */

.hero-inner {
  text-align: center;
}

.hero-inner h1 {
  color: #0c4a6e;
  font-size: 40px;
  margin-top: 0;
  margin-bottom: 12px;
}

.hero-inner p {
  color: #0369a1;
  margin-top: 0;
  margin-bottom: 24px;
}

.badge {
  background-color: #f59e0b;
  color: #78350f;
  font-size: 14px;
  font-weight: bold;
  padding-top: 4px;
  padding-right: 12px;
  padding-bottom: 4px;
  padding-left: 12px;
  border-radius: 999px;
  /* ここに position: absolute; と top / right を書いて、
     .hero の右上(上から16px・右から16px)に置こう */
}

.cta {
  display: inline-block;
  background-color: #0284c7;
  color: #ffffff;
  font-weight: bold;
  text-decoration: none;
  padding-top: 12px;
  padding-right: 32px;
  padding-bottom: 12px;
  padding-left: 32px;
  border-radius: 999px;
  /* ここに transition-property と transition-duration を書いて、
     background-color が 0.3s かけて変わるようにしよう */
}

/* ここに .cta:hover のルールを書いて、background-color を #0369a1 に変えよう */
`;

const solutionCss = `body {
  margin: 0;
  font-family: sans-serif;
}

.hero {
  height: 400px;
  background-color: #e0f2fe;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.hero-inner {
  text-align: center;
}

.hero-inner h1 {
  color: #0c4a6e;
  font-size: 40px;
  margin-top: 0;
  margin-bottom: 12px;
}

.hero-inner p {
  color: #0369a1;
  margin-top: 0;
  margin-bottom: 24px;
}

.badge {
  background-color: #f59e0b;
  color: #78350f;
  font-size: 14px;
  font-weight: bold;
  padding-top: 4px;
  padding-right: 12px;
  padding-bottom: 4px;
  padding-left: 12px;
  border-radius: 999px;
  position: absolute;
  top: 16px;
  right: 16px;
}

.cta {
  display: inline-block;
  background-color: #0284c7;
  color: #ffffff;
  font-weight: bold;
  text-decoration: none;
  padding-top: 12px;
  padding-right: 32px;
  padding-bottom: 12px;
  padding-left: 32px;
  border-radius: 999px;
  transition-property: background-color;
  transition-duration: 0.3s;
}

.cta:hover {
  background-color: #0369a1;
}
`;

// ---- :hover 判定ヘルパー(CSSOM 走査) --------------------------------------
// :hover 中の computed style は取得できず、生 CSS への正規表現(source check)では
// コメントに同じ構文を書くだけで合格してしまう。そこでパース済みの CSS(CSSOM)を
// document.styleSheets から走査し、実際に効くルールとして存在するかを検証する。
// 判定 iframe では <link> が同一ドキュメントの <style> にインライン合成されるため、
// sandbox(opaque origin)でも cssRules の読み取りは制限されない。

/** cssRules を読めないシート(cross-origin 等。インライン <style> では起きない)は null */
function safeRules(sheet: CSSStyleSheet): CSSRuleList | null {
  try {
    return sheet.cssRules;
  } catch {
    return null;
  }
}

/** @media 等のグループも再帰的にたどり、セレクタを持つスタイルルールをすべて集める */
function collectStyleRules(doc: Document): CSSStyleRule[] {
  const found: CSSStyleRule[] = [];
  const visit = (rules: CSSRuleList): void => {
    for (const rule of Array.from(rules)) {
      // instanceof は実行環境の realm に依存し得るため、ダックタイピングで判別する
      if ("selectorText" in rule && "style" in rule) found.push(rule as CSSStyleRule);
      if ("cssRules" in rule) visit((rule as CSSGroupingRule).cssRules);
    }
  };
  for (const sheet of Array.from(doc.styleSheets)) {
    const rules = safeRules(sheet);
    if (rules !== null) visit(rules);
  }
  return found;
}

/** セレクタリスト(カンマ区切り)のいずれかが selector と一致するルールを集める */
function rulesFor(doc: Document, selector: string): CSSStyleRule[] {
  return collectStyleRules(doc).filter((rule) =>
    rule.selectorText.split(",").some((s) => s.trim() === selector),
  );
}

/** 宣言値のシリアライズはブラウザ差があり得るため、正規化(空白除去 + 小文字化)して受容集合と比較する */
function declaresValue(rules: CSSStyleRule[], property: string, accepted: string[]): boolean {
  return rules.some((rule) => {
    const value = rule.style.getPropertyValue(property).toLowerCase().replace(/\s+/g, "");
    return value !== "" && accepted.includes(value);
  });
}

/** background-color: #0369a1 の宣言値として受け入れるシリアライズ表現(空白除去・小文字) */
const HOVER_BACKGROUND_VALUES = ["#0369a1", "rgb(3,105,161)", "rgba(3,105,161,1)", "rgba(3,105,161,1.0)"];

// 中級の総合: flex 中央寄せ + position(relative/absolute + top/right)+ transition の組合せ。
// :hover 中の computed は判定できないため .cta:hover は CSSOM(document.styleSheets)を走査する
// custom check で検証する(css-09 / css-int-08 と同じ方針。コメント内の構文では合格しない)。
export default defineLesson({
  slug: "css-int-10-hero",
  title: "総合: ヒーローセクション",
  estMinutes: 8,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "hero-height",
      type: "style",
      selector: ".hero",
      property: "height",
      equals: "400px",
      message: ".hero のルールを作って、height を 400px にしましょう",
    },
    {
      id: "hero-display",
      type: "style",
      selector: ".hero",
      property: "display",
      equals: "flex",
      message: ".hero を display: flex にして、中身をならべる準備をしましょう",
    },
    {
      id: "hero-justify",
      type: "style",
      selector: ".hero",
      property: "justify-content",
      equals: "center",
      message: ".hero の justify-content を center にして、中身を横方向の中央にそろえましょう",
    },
    {
      id: "hero-align",
      type: "style",
      selector: ".hero",
      property: "align-items",
      equals: "center",
      message: ".hero の align-items を center にして、中身を縦方向の中央にそろえましょう",
    },
    {
      id: "hero-position",
      type: "style",
      selector: ".hero",
      property: "position",
      equals: "relative",
      message: ".hero に position: relative を書いて、バッジの基準にしましょう",
    },
    {
      id: "badge-position",
      type: "style",
      selector: ".badge",
      property: "position",
      equals: "absolute",
      message: ".badge に position: absolute を書いて、ヒーローの上に重ねられるようにしましょう",
    },
    {
      id: "badge-top",
      type: "style",
      selector: ".badge",
      property: "top",
      equals: "16px",
      message: ".badge の top を 16px にして、上端から 16px の位置に置きましょう",
    },
    {
      id: "badge-right",
      type: "style",
      selector: ".badge",
      property: "right",
      equals: "16px",
      message: ".badge の right を 16px にして、右端から 16px の位置に置きましょう",
    },
    {
      id: "cta-transition-property",
      type: "style",
      selector: ".cta",
      property: "transition-property",
      equals: "background-color",
      message: ".cta に transition-property: background-color を書いて、変化させる相手を決めましょう",
    },
    {
      id: "cta-transition-duration",
      type: "style",
      selector: ".cta",
      property: "transition-duration",
      equals: "0.3s",
      message: ".cta の transition-duration を 0.3s にして、変化にかける時間を決めましょう",
    },
    {
      id: "cta-hover-rule",
      type: "custom",
      message: ".cta:hover のルール(マウスをのせたとき用のスタイル)を書きましょう",
      run: (ctx) => rulesFor(ctx.document, ".cta:hover").length > 0,
    },
    {
      id: "cta-hover-background",
      type: "custom",
      message: ".cta:hover のルールの中で、background-color を #0369a1 にしましょう",
      run: (ctx) =>
        declaresValue(rulesFor(ctx.document, ".cta:hover"), "background-color", HOVER_BACKGROUND_VALUES),
    },
  ],
  hints: [
    "作るものは3つです。まず .hero を display: flex にして中身を中央へ(justify-content と align-items)、つぎに .badge を position で右上に固定、最後に .cta へ transition と :hover の色変化を付けます。スライドの順に進めましょう",
    "土台は .hero { height: 400px; background-color: #e0f2fe; display: flex; justify-content: center; align-items: center; position: relative; } です。バッジは .badge に position: absolute; top: 16px; right: 16px; を足します",
    "仕上げに .cta へ transition-property: background-color; と transition-duration: 0.3s; を足して、.cta:hover { background-color: #0369a1; } のルールを書けば完成です",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
