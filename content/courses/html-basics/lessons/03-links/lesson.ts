import { defineLesson } from "@codesteps/lesson-kit";

// CURRICULUM #3(穴埋め): a タグと href 属性
export default defineLesson({
  slug: "html-03-links",
  title: "リンクをはろう",
  estMinutes: 5,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>お気に入りリンク</title>
  </head>
  <body>
    <h1>お気に入りリンク</h1>
    <!-- ここに a タグでリンクを書こう -->
    <!-- 飛び先: https://example.com  表示する文字: れんしゅうサイト -->
  </body>
</html>
`,
    },
  },
  checks: [
    { type: "element", id: "a-exists", selector: "a" },
    { type: "attribute", id: "a-href", selector: "a", name: "href", equals: "https://example.com" },
    { type: "text", id: "a-text", selector: "a", equals: "れんしゅうサイト" },
  ],
  hints: [
    'リンクは a タグで作ります。飛び先の URL は href という「属性」に、開きタグの中で 名前="値" の形で書きます',
    '<a href="URL">表示する文字</a> の形です。URL は半角の引用符 " で囲みます',
    '<a href="https://example.com">れんしゅうサイト</a> と書けば完成です',
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>お気に入りリンク</title>
  </head>
  <body>
    <h1>お気に入りリンク</h1>
    <a href="https://example.com">れんしゅうサイト</a>
  </body>
</html>
`,
  },
});
