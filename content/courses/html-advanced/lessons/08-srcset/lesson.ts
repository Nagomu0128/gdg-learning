import { defineLesson } from "@codesteps/lesson-kit";

// CURRICULUM-2 html-advanced #8(穴埋め): picture / source(media 属性)/ img フォールバック。
// 判定ビューポートは 800×600 固定なので (min-width: 700px) は常にマッチする(決定性)。
export default defineLesson({
  slug: "html-adv-08-srcset",
  title: "画像の出し分け",
  estMinutes: 6,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>山のしゃしん館</title>
  </head>
  <body>
    <h1>山のしゃしん館</h1>
    <!-- ここに picture を書こう:
         1. <picture> の中に <source> と <img> を入れる
         2. <source> には media="(min-width: 700px)" と srcset="wide.svg" を付ける
         3. <img> には src="square.svg" と alt(画像の説明)を付ける -->
  </body>
</html>
`,
    },
  },
  checks: [
    {
      id: "picture-exists",
      type: "element",
      selector: "picture",
      message: "picture タグで画像の出し分けの入れ物を作りましょう",
    },
    {
      id: "source-in-picture",
      type: "element",
      selector: "picture > source",
      message: "picture の中に、条件付きの画像を指定する source タグを書きましょう",
    },
    {
      id: "source-media",
      type: "attribute",
      selector: "picture > source",
      name: "media",
      equals: "(min-width: 700px)",
      message: 'source の media 属性を "(min-width: 700px)" にしましょう(スペースの位置もそのまま)',
    },
    {
      id: "source-srcset",
      type: "attribute",
      selector: "picture > source",
      name: "srcset",
      equals: "wide.svg",
      message: 'source の srcset 属性に "wide.svg" を指定しましょう',
    },
    {
      id: "img-in-picture",
      type: "element",
      selector: "picture > img",
      message: "picture の中の最後に、ふだん表示する img タグを書きましょう",
    },
    {
      id: "img-src",
      type: "attribute",
      selector: "picture > img",
      name: "src",
      equals: "square.svg",
      message: 'img の src 属性に "square.svg" を指定しましょう',
    },
    {
      id: "img-alt",
      type: "attribute",
      selector: "picture > img",
      name: "alt",
      exists: true,
      message: "img に alt 属性で画像の説明を付けましょう",
    },
  ],
  hints: [
    "picture の中には「条件付きの候補」の source を先に、「ふだん使う画像」の img を最後に書きます。media 属性の条件に合うと、img の代わりに source の画像が表示されます",
    '<picture><source media="条件" srcset="ファイル名"><img src="ファイル名" alt="説明"></picture> の形です。条件は (min-width: 700px)、つまり「画面の幅が 700px 以上のとき」です',
    '<picture><source media="(min-width: 700px)" srcset="wide.svg"><img src="square.svg" alt="山の風景"></picture> と書けば完成です',
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>山のしゃしん館</title>
  </head>
  <body>
    <h1>山のしゃしん館</h1>
    <picture>
      <source media="(min-width: 700px)" srcset="wide.svg">
      <img src="square.svg" alt="山の風景">
    </picture>
  </body>
</html>
`,
  },
});
