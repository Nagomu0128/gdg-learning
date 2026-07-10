import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>ベーカリー ひだまり</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>ベーカリー ひだまり</h1>
    <div class="card">
      <div class="photo">
        <span class="badge">NEW</span>
      </div>
      <h2>夏限定のレモンパン</h2>
      <p>さわやかなレモンクリームを、ふんわり生地で包みました。7月の新商品です。</p>
    </div>
  </body>
</html>
`;

const initialCss = `body {
  font-family: sans-serif;
  background-color: #f8fafc;
}

.card {
  width: 320px;
  background-color: #ffffff;
  border-radius: 12px;
  padding-top: 16px;
  padding-right: 16px;
  padding-bottom: 16px;
  padding-left: 16px;
}

.photo {
  height: 140px;
  background-color: #fcd34d;
  border-radius: 8px;
  /* ここに position: relative; を書いて、バッジをおく基準にしよう */
}

.badge {
  background-color: #e11d48;
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  padding-top: 4px;
  padding-right: 10px;
  padding-bottom: 4px;
  padding-left: 10px;
  border-radius: 999px;
  /* ここに position: absolute; と top / left を書いて、
     写真の左上(上から12px・左から12px)にバッジを重ねよう */
}

h2 {
  font-size: 18px;
  margin-top: 16px;
  margin-bottom: 4px;
}

p {
  margin-top: 0;
  color: #475569;
}
`;

const solutionCss = `body {
  font-family: sans-serif;
  background-color: #f8fafc;
}

.card {
  width: 320px;
  background-color: #ffffff;
  border-radius: 12px;
  padding-top: 16px;
  padding-right: 16px;
  padding-bottom: 16px;
  padding-left: 16px;
}

.photo {
  height: 140px;
  background-color: #fcd34d;
  border-radius: 8px;
  position: relative;
}

.badge {
  background-color: #e11d48;
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  padding-top: 4px;
  padding-right: 10px;
  padding-bottom: 4px;
  padding-left: 10px;
  border-radius: 999px;
  position: absolute;
  top: 12px;
  left: 12px;
}

h2 {
  font-size: 18px;
  margin-top: 16px;
  margin-bottom: 4px;
}

p {
  margin-top: 0;
  color: #475569;
}
`;

// top / left は longhand(shorthand の inset は使わない)。absolute の top / left は
// computed が指定 px のまま返るので style check で判定できる(CURRICULUM-2)。
export default defineLesson({
  slug: "css-int-04-position",
  title: "position で配置",
  estMinutes: 6,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "photo-position",
      type: "style",
      selector: ".photo",
      property: "position",
      equals: "relative",
      message: "写真(.photo)に position: relative を書いて、バッジの基準にしましょう",
    },
    {
      id: "badge-position",
      type: "style",
      selector: ".badge",
      property: "position",
      equals: "absolute",
      message: "バッジ(.badge)に position: absolute を書いて、写真に重ねられるようにしましょう",
    },
    {
      id: "badge-top",
      type: "style",
      selector: ".badge",
      property: "top",
      equals: "12px",
      message: ".badge の top を 12px にして、写真の上端から 12px の位置に置きましょう",
    },
    {
      id: "badge-left",
      type: "style",
      selector: ".badge",
      property: "left",
      equals: "12px",
      message: ".badge の left を 12px にして、写真の左端から 12px の位置に置きましょう",
    },
  ],
  hints: [
    "position: relative を親に書くと、その親が子の位置の「基準」になります。動かしたい子には position: absolute を書いて、ふだんの流れから浮かせます",
    "浮かせた子の場所は top(基準の上端からの距離)と left(基準の左端からの距離)で決めます。.badge { position: absolute; top: ...; left: ...; } の形です",
    ".photo に position: relative; を、.badge に position: absolute; top: 12px; left: 12px; を書けば完成です",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
