import { defineLesson } from "@codesteps/lesson-kit";

// CURRICULUM-2 html-advanced #5(写経): charset / viewport / description を source check で検証し、
// viewport は element check(DOM)でも裏付ける。
// source check は ignoreComments: true でコメント内の文字列にマッチしない(J-judge-hardening)。
export default defineLesson({
  slug: "html-adv-05-meta",
  title: "ページ情報を整える",
  estMinutes: 5,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <!-- ここに meta タグを3つ書こう(スライドの型のとおり):
         1. 文字コードの指定(charset)
         2. スマホ対応の設定(viewport)
         3. ページの説明文(description) -->
    <title>ぼくのブログ</title>
  </head>
  <body>
    <h1>ぼくのブログ</h1>
    <p>ようこそ。ここは HTML の練習用ブログです。</p>
  </body>
</html>
`,
    },
  },
  checks: [
    {
      id: "meta-charset",
      type: "source",
      file: "index.html",
      pattern: "<meta[^>]*charset\\s*=\\s*[\"']?utf-8[\"']?",
      flags: "i",
      ignoreComments: true,
      message: '<meta charset="utf-8"> で文字コードを指定しましょう(文字化けを防ぎます)',
    },
    {
      id: "meta-viewport",
      type: "source",
      file: "index.html",
      pattern: "<meta[^>]*name\\s*=\\s*[\"']viewport[\"']",
      flags: "i",
      ignoreComments: true,
      message: 'スマホ対応のための <meta name="viewport" ...> を書きましょう',
    },
    {
      id: "viewport-content",
      type: "source",
      file: "index.html",
      pattern:
        "<meta(?=[^>]*name\\s*=\\s*[\"']viewport[\"'])[^>]*content\\s*=\\s*[\"']width=device-width,\\s*initial-scale=1(?:\\.0)?[\"']",
      flags: "i",
      ignoreComments: true,
      message: 'viewport の content は "width=device-width, initial-scale=1" にしましょう',
    },
    {
      id: "meta-description",
      type: "source",
      file: "index.html",
      pattern: "<meta[^>]*name\\s*=\\s*[\"']description[\"']",
      flags: "i",
      ignoreComments: true,
      message: 'ページの説明のための <meta name="description" ...> を書きましょう',
    },
    {
      id: "description-content",
      type: "source",
      file: "index.html",
      pattern: "<meta(?=[^>]*name\\s*=\\s*[\"']description[\"'])[^>]*content\\s*=\\s*[\"'][^\"']",
      flags: "i",
      ignoreComments: true,
      message: "description の meta タグに、content 属性でページの説明文を書きましょう",
    },
    // DOM レベルの裏付け(挙動検証): viewport の meta が実際にパースされて存在すること
    {
      id: "viewport-in-dom",
      type: "element",
      selector: 'meta[name="viewport"]',
      message: 'スマホ対応のための <meta name="viewport" ...> を head の中に書きましょう',
    },
  ],
  hints: [
    "meta タグは head の中に書く「ページ自身の情報」です。画面には表示されませんが、ブラウザや検索エンジンが読み取ります",
    '3つとも head の中(title の上)に書きます。charset は <meta charset="utf-8"> だけ、viewport と description は name と content の2つの属性をセットで書きます',
    '<meta charset="utf-8"> と <meta name="viewport" content="width=device-width, initial-scale=1"> と <meta name="description" content="ページの説明文"> の3行を書けば完成です(説明文の中身は自由に書いてかまいません)',
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="HTML の練習でつくった、ぼくのブログです。">
    <title>ぼくのブログ</title>
  </head>
  <body>
    <h1>ぼくのブログ</h1>
    <p>ようこそ。ここは HTML の練習用ブログです。</p>
  </body>
</html>
`,
  },
});
