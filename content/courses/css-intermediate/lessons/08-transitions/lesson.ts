import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>プログラミング勉強会</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>プログラミング勉強会</h1>
    <p>はじめてでも大丈夫。いっしょに手を動かして学びましょう。</p>
    <a href="https://example.com">参加を申し込む</a>
  </body>
</html>
`;

const initialCss = `body {
  font-family: sans-serif;
}

a {
  display: inline-block;
  background-color: #0ea5e9;
  color: #ffffff;
  text-decoration: none;
  padding-top: 12px;
  padding-right: 24px;
  padding-bottom: 12px;
  padding-left: 24px;
  border-radius: 8px;
  /* ここに transition-property と transition-duration を書いて、
     background-color が 0.3s かけて変わるようにしよう */
}

/* ここに a:hover のルールを書いて、
   マウスをのせたら background-color が #0369a1 に変わるようにしよう */
`;

const solutionCss = `body {
  font-family: sans-serif;
}

a {
  display: inline-block;
  background-color: #0ea5e9;
  color: #ffffff;
  text-decoration: none;
  padding-top: 12px;
  padding-right: 24px;
  padding-bottom: 12px;
  padding-left: 24px;
  border-radius: 8px;
  transition-property: background-color;
  transition-duration: 0.3s;
}

a:hover {
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

// :hover 中の computed は判定できないため、a:hover は CSSOM(document.styleSheets)を走査する
// custom check で「パース済みルールとして存在するか」を検証する(css-09 と同じ方針)
export default defineLesson({
  slug: "css-int-08-transitions",
  title: "なめらかに変化させる",
  estMinutes: 6,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "transition-property",
      type: "style",
      selector: "a",
      property: "transition-property",
      equals: "background-color",
    },
    {
      id: "transition-duration",
      type: "style",
      selector: "a",
      property: "transition-duration",
      equals: "0.3s",
    },
    {
      id: "hover-rule",
      type: "custom",
      message: "a:hover のルール(マウスをのせたとき用のスタイル)を書きましょう",
      run: (ctx) => rulesFor(ctx.document, "a:hover").length > 0,
    },
    {
      id: "hover-background",
      type: "custom",
      message: "a:hover のルールの中で、background-color を #0369a1 にしましょう",
      run: (ctx) =>
        declaresValue(rulesFor(ctx.document, "a:hover"), "background-color", HOVER_BACKGROUND_VALUES),
    },
  ],
  hints: [
    "なめらかな変化は、ふだんの状態のルール(a)に transition-property と transition-duration を書いておきます。変化後の色は a:hover のルールに書きます",
    "transition-property: background-color; transition-duration: 0.3s; の2行です。時間は s(秒)の単位で書きます",
    "a のルールに transition-property: background-color; transition-duration: 0.3s; を足して、a:hover { background-color: #0369a1; } のルールを書けば完成です",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
