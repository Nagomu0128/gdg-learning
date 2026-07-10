import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>重なりを制御する</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>本日のおすすめ</h1>
    <div class="stage">
      <div class="card">
        <h2>ブレンドコーヒー</h2>
        <p>深いりの豆を使った、香り高い一杯です。</p>
      </div>
      <div class="banner">全品 10% OFF セール中!</div>
    </div>
  </body>
</html>
`;

const initialCss = `body {
  font-family: sans-serif;
}

.stage {
  position: relative;
  height: 280px;
}

.card {
  /* ここに position: absolute; と z-index: 2; を書いて、
     カードをバナーより手前に出そう */
  top: 24px;
  left: 24px;
  width: 200px;
  height: 120px;
  padding: 16px;
  background-color: white;
  border: 2px solid #d1d5db;
  border-radius: 8px;
}

.card h2 {
  margin-top: 0;
  font-size: 18px;
}

.banner {
  /* ここに z-index: 1; を書こう */
  position: absolute;
  top: 90px;
  left: 0;
  width: 320px;
  height: 60px;
  line-height: 60px;
  padding-left: 16px;
  background-color: #f59e0b;
  color: white;
  font-weight: bold;
}
`;

const solutionCss = `body {
  font-family: sans-serif;
}

.stage {
  position: relative;
  height: 280px;
}

.card {
  position: absolute;
  z-index: 2;
  top: 24px;
  left: 24px;
  width: 200px;
  height: 120px;
  padding: 16px;
  background-color: white;
  border: 2px solid #d1d5db;
  border-radius: 8px;
}

.card h2 {
  margin-top: 0;
  font-size: 18px;
}

.banner {
  z-index: 1;
  position: absolute;
  top: 90px;
  left: 0;
  width: 320px;
  height: 60px;
  line-height: 60px;
  padding-left: 16px;
  background-color: #f59e0b;
  color: white;
  font-weight: bold;
}
`;

// z-index の computed 値は position: static でも数字のまま返るため、style check だけでは
// 「効いているか」を保証できない。仕上げの custom check が elementFromPoint で
// 「2要素が重なる領域の中心で、実際にカードが手前にいる」ことを検証する(CURRICULUM-2)。
// 座標は両要素の rect から実行時に計算するので、フォントや余白のちがいに影響されない。
export default defineLesson({
  slug: "css-adv-08-z-index",
  title: "重なりを制御する",
  estMinutes: 6,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "card-position",
      type: "style",
      selector: ".card",
      property: "position",
      equals: "absolute",
      message:
        ".card に position: absolute; を書きましょう。z-index は position を指定した要素にだけ効きます",
    },
    {
      id: "card-z-index",
      type: "style",
      selector: ".card",
      property: "z-index",
      equals: "2",
      message: ".card に z-index: 2; を書いて、重なりの順番を指定しましょう",
    },
    {
      id: "banner-z-index",
      type: "style",
      selector: ".banner",
      property: "z-index",
      equals: "1",
      message: ".banner に z-index: 1; を書いて、カードの 2 より小さい番号にしましょう",
    },
    {
      id: "card-front",
      type: "custom",
      message: "カードがバナーより手前に表示されるようにしましょう(z-index の数字が大きいほうが手前です)",
      run: (ctx) => {
        const card = ctx.document.querySelector(".card");
        const banner = ctx.document.querySelector(".banner");
        if (card === null || banner === null) return false;
        const a = card.getBoundingClientRect();
        const b = banner.getBoundingClientRect();
        const left = Math.max(a.left, b.left);
        const right = Math.min(a.right, b.right);
        const top = Math.max(a.top, b.top);
        const bottom = Math.min(a.bottom, b.bottom);
        if (right <= left || bottom <= top) return false;
        const hit = ctx.document.elementFromPoint((left + right) / 2, (top + bottom) / 2);
        return hit !== null && (hit === card || card.contains(hit));
      },
    },
  ],
  hints: [
    "重なった要素は「HTML であとに書いたもの」ほど手前に表示されるのが基本です。この順番を数字で入れかえるのが z-index です",
    "z-index は position を指定した要素にだけ効きます。.card には position: absolute; もあわせて書きましょう(書いてある top: 24px; left: 24px; が効きはじめます)",
    ".card に position: absolute; と z-index: 2; を、.banner に z-index: 1; を書けば、数字の大きいカードが手前に出ます",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
