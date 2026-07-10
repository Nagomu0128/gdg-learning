import { defineLesson } from "@codesteps/lesson-kit";

// CURRICULUM-2 html-advanced #4(穴埋め): template と content.cloneNode(true) による複製。
// 注意: template の中身は inert なので document.querySelector("template li") では見えない。
// 中身の検証は custom check で template.content を直接見る。
export default defineLesson({
  slug: "html-adv-04-template",
  title: "template で複製",
  estMinutes: 6,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>くだものリスト</title>
  </head>
  <body>
    <h1>今日のくだもの</h1>
    <ul id="list"></ul>
    <!-- ここに id="item-template" の template タグを書こう。
         中には空の li タグを1つ入れる(文字は script.js が入れます) -->
    <script src="script.js"></script>
  </body>
</html>
`,
    },
    "script.js": {
      initial: `// template と ul を取得する
const template = document.getElementById("item-template");
const list = document.getElementById("list");

const fruits = ["りんご", "バナナ", "みかん"];
for (const fruit of fruits) {
  // ここで template の中身をまるごと複製して、clone という名前の const 変数に入れよう

  // 複製した li に文字を入れて、リストに追加する(この2行は用意してあります)
  clone.querySelector("li").textContent = fruit;
  list.appendChild(clone);
}
`,
    },
  },
  checks: [
    {
      id: "template-exists",
      type: "element",
      selector: "template",
      message: "リストの下書きになる template タグを書きましょう",
    },
    {
      id: "template-id",
      type: "attribute",
      selector: "template",
      name: "id",
      equals: "item-template",
      message: 'template に id="item-template" を付けましょう(script.js がこの id で探します)',
    },
    {
      id: "li-in-template",
      type: "custom",
      message: "template の中に、複製のもとになる li タグを1つ入れましょう",
      run: (ctx) => {
        const template = ctx.document.querySelector("template");
        return template !== null && template.content.querySelector("li") !== null;
      },
    },
    {
      id: "use-clone-node",
      type: "source",
      file: "script.js",
      pattern: "\\.cloneNode\\s*\\(\\s*true\\s*\\)",
      message: "script.js で template.content.cloneNode(true) を使って、中身ごと複製しましょう",
    },
    {
      id: "list-items",
      type: "custom",
      message: 'template を3回複製して、リスト(id="list")の中に li が3個ならぶようにしましょう',
      run: (ctx) => ctx.document.querySelectorAll("#list li").length === 3,
    },
    {
      id: "first-item-text",
      type: "text",
      selector: "#list li",
      equals: "りんご",
      message: "リストの1番目は「りんご」になるはずです。複製した li に文字が入っているか確認しましょう",
    },
  ],
  hints: [
    "template タグの中身は画面に表示されない「下書き」です。JavaScript からは template.content で中身に触れて、cloneNode で複製(コピー)して使います。引数の true は「中身ごとコピーする」という意味です",
    'HTML は <template id="item-template"><li></li></template> の形です。JS の穴埋めは const clone = template.content.cloneNode(true); の1行です',
    "template を書いたら、for の中のコメントの場所に const clone = template.content.cloneNode(true); と書けば完成です。true を忘れると中身が空の複製になるので注意しましょう",
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>くだものリスト</title>
  </head>
  <body>
    <h1>今日のくだもの</h1>
    <ul id="list"></ul>
    <template id="item-template">
      <li></li>
    </template>
    <script src="script.js"></script>
  </body>
</html>
`,
    "script.js": `// template と ul を取得する
const template = document.getElementById("item-template");
const list = document.getElementById("list");

const fruits = ["りんご", "バナナ", "みかん"];
for (const fruit of fruits) {
  // template の中身をまるごと複製する
  const clone = template.content.cloneNode(true);

  // 複製した li に文字を入れて、リストに追加する(この2行は用意してあります)
  clone.querySelector("li").textContent = fruit;
  list.appendChild(clone);
}
`,
  },
});
