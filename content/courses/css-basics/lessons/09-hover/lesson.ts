import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>おすすめリンク集</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>おすすめリンク集</h1>
    <ul>
      <li><a href="https://example.com">はじめてのHTML</a></li>
      <li><a href="https://example.com">CSSデザインの見本帳</a></li>
      <li><a href="https://example.com">プログラミングの歩き方</a></li>
    </ul>
  </body>
</html>
`;

const initialCss = `body {
  font-family: sans-serif;
}

li {
  margin-bottom: 8px;
}

a {
  font-size: 18px;
  /* ここに color を書いて、リンクの色を green にしよう */
}

/* ここに a:hover のルールを書いて、
   マウスをのせたら color が orange に変わるようにしよう */
`;

const solutionCss = `body {
  font-family: sans-serif;
}

li {
  margin-bottom: 8px;
}

a {
  font-size: 18px;
  color: green;
}

a:hover {
  color: orange;
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

/** color: orange の宣言値として受け入れるシリアライズ表現(空白除去・小文字) */
const ORANGE_VALUES = ["orange", "rgb(255,165,0)", "rgba(255,165,0,1)", "rgba(255,165,0,1.0)", "#ffa500"];

// :hover は computed style で判定できないため、a:hover は CSSOM(document.styleSheets)を走査する
// custom check で「パース済みルールとして存在するか」を検証する(コメント内の構文では合格しない)
export default defineLesson({
  slug: "css-09-hover",
  title: "マウスをのせたときの変化",
  estMinutes: 6,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "a-color",
      type: "style",
      selector: "a",
      property: "color",
      equals: "green",
    },
    {
      id: "hover-rule",
      type: "custom",
      message: "a:hover のルール(マウスをのせたときのスタイル)を書きましょう",
      run: (ctx) => rulesFor(ctx.document, "a:hover").length > 0,
    },
    {
      id: "hover-color",
      type: "custom",
      message: "a:hover のルールの中で、color を orange にしましょう",
      run: (ctx) => declaresValue(rulesFor(ctx.document, "a:hover"), "color", ORANGE_VALUES),
    },
  ],
  hints: [
    "マウスをのせたときだけ効くスタイルは、セレクタに :hover を付けた別のルールに書きます",
    "ふだんの色は a のルールに、のせたときの色は a:hover のルールに、それぞれ color で指定します",
    "a { color: green; } のあとに a:hover { color: orange; } というルールを書けば完成です",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
