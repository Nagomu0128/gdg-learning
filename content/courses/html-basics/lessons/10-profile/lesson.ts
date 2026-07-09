import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "html-10-profile",
  title: "総合: プロフィールページ",
  estMinutes: 8,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>プロフィール</title>
  </head>
  <body>
    <!-- ここにプロフィールページを自力で作ろう -->
    <!-- 1. h1 で名前の見出しを書く -->
    <!-- 2. img で icon.svg を表示する(alt 属性も付ける) -->
    <!-- 3. ul と li で「すきなもの」を3つならべる -->
    <!-- 4. a ですきなサイトへのリンクを作る(href 属性) -->
  </body>
</html>
`,
    },
  },
  checks: [
    { id: "h1-exists", type: "element", selector: "h1" },
    { id: "img-exists", type: "element", selector: "img" },
    { id: "img-src", type: "attribute", selector: "img", name: "src", equals: "icon.svg" },
    { id: "img-alt", type: "attribute", selector: "img", name: "alt", exists: true },
    {
      id: "list-items",
      type: "element",
      selector: "ul > li",
      count: 3,
      message: "ul の中に li を3つ入れましょう",
    },
    { id: "link-exists", type: "element", selector: "a" },
    { id: "link-href", type: "attribute", selector: "a", name: "href", exists: true },
  ],
  hints: [
    "これまでに学んだタグの組み合わせで作れます。見出しは h1、画像は img、リストは ul と li、リンクは a でした",
    '画像は <img src="icon.svg" alt="画像の説明">、リンクは <a href="URL">表示する文字</a> の形です',
    '例: <h1>タロウのプロフィール</h1> <img src="icon.svg" alt="アイコン"> <ul><li>サッカー</li><li>ゲーム</li><li>ねこ</li></ul> <a href="https://example.com">すきなサイト</a>',
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>プロフィール</title>
  </head>
  <body>
    <h1>タロウのプロフィール</h1>
    <img src="icon.svg" alt="タロウのアイコン">
    <ul>
      <li>サッカー</li>
      <li>ゲーム</li>
      <li>ねこ</li>
    </ul>
    <a href="https://example.com">すきなサイト</a>
  </body>
</html>
`,
  },
});
