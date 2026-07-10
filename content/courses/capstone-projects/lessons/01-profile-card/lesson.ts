import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "cap-01-profile-card",
  title: "プロフィールカード",
  estMinutes: 15,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>プロフィールカード</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <!-- ここに class="card" の div を作り、中に img と h1 と p を入れよう -->
    <!-- 画像は <img src="avatar.svg" alt="アバター"> で同梱の画像が使えます -->
    <script src="script.js"></script>
  </body>
</html>
`,
    },
    "style.css": {
      initial: `/* ここに .card の見た目(background-color と border-radius)と、:hover の変化を書こう */
`,
    },
    "script.js": {
      initial: `// このレッスンは JavaScript なしで完成します(使いたい人は自由に使ってOK)
`,
    },
  },
  checks: [
    {
      type: "element",
      id: "card-element",
      selector: ".card",
      message: 'カードの箱になる class="card" の要素を書きましょう',
    },
    {
      type: "element",
      id: "card-has-img",
      selector: ".card img",
      message: ".card の中に img を入れましょう(同梱の avatar.svg が使えます)",
    },
    {
      type: "element",
      id: "card-has-heading",
      selector: ".card h1",
      message: ".card の中に名前の h1 を入れましょう",
    },
    {
      type: "element",
      id: "card-has-text",
      selector: ".card p",
      message: ".card の中に紹介文の p を入れましょう",
    },
    {
      type: "source",
      id: "card-background-color",
      file: "style.css",
      pattern: "\\.card\\s*\\{[^}]*background-color\\s*:",
      message:
        "style.css の .card { ... } の中に background-color を書きましょう(background 1語の短縮形は判定に数えません)",
    },
    {
      type: "source",
      id: "card-border-radius",
      file: "style.css",
      pattern: "\\.card\\s*\\{[^}]*border[-a-z]*-radius\\s*:",
      message: "style.css の .card { ... } の中に border-radius で角丸を付けましょう",
    },
    {
      type: "source",
      id: "hover-effect",
      file: "style.css",
      pattern: ":hover[^{]*\\{[^}]*[a-z-]+\\s*:",
      message: "マウスをのせたときの変化を :hover のルールで書きましょう(例: .card:hover { ... })",
    },
  ],
  hints: [
    "「HTML の骨組み → カードの見た目 → ホバーの仕上げ」の3ステップで進めましょう。まず骨組みを書いて、プレビューに文字と画像が出れば一歩前進です",
    'HTML は <div class="card"> の中に <img src="avatar.svg" alt="アバター">・<h1>名前</h1>・<p>紹介文</p> を入れる形です',
    "CSS はまず .card { width: 300px; background-color: #ffffff; border-radius: 16px; padding: 24px; } の4点セット(幅・背景色・角丸・余白)から始めるとカードらしくなります",
    "ホバーは .card:hover { box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2); } のように書きます。ふだんの .card に transition: box-shadow 0.2s; を足すと変化がなめらかになります",
    "カードを画面中央に置くなら body { display: flex; justify-content: center; padding-top: 40px; } を、文字の中央ぞろえなら .card { text-align: center; } を使いましょう",
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>プロフィールカード</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div class="card">
      <img src="avatar.svg" alt="アバター" />
      <h1>ヤマダ タロウ</h1>
      <p>プログラミングを勉強中です。すきなものは猫とコーヒーです。</p>
    </div>
    <script src="script.js"></script>
  </body>
</html>
`,
    "style.css": `body {
  font-family: sans-serif;
  background-color: #f1f5f9;
  display: flex;
  justify-content: center;
  padding-top: 40px;
}

.card {
  width: 300px;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.15);
  transition: box-shadow 0.2s, transform 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.2);
}

.card img {
  width: 96px;
  height: 96px;
}

.card h1 {
  font-size: 20px;
  margin-top: 12px;
  margin-bottom: 8px;
}

.card p {
  font-size: 14px;
  color: #475569;
  margin: 0;
}
`,
    "script.js": `// このレッスンは JavaScript を使いません(自由に足してもかまいません)
`,
  },
});
