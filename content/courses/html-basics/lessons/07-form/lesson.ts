import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "html-07-form",
  title: "フォームの部品",
  estMinutes: 6,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>おといあわせ</title>
  </head>
  <body>
    <h1>おといあわせ</h1>
    <form>
      <!-- ここに placeholder 属性つきの input タグを書こう -->
      <!-- ここに「送信」と表示される button タグを書こう -->
    </form>
  </body>
</html>
`,
    },
  },
  checks: [
    { id: "form-exists", type: "element", selector: "form" },
    {
      id: "input-exists",
      type: "element",
      selector: "form input",
      message: "form の中に input タグを書きましょう",
    },
    {
      id: "input-placeholder",
      type: "attribute",
      selector: "form input",
      name: "placeholder",
      exists: true,
      message: "input タグに placeholder 属性を付けましょう",
    },
    {
      id: "button-exists",
      type: "element",
      selector: "form button",
      message: "form の中に button タグを書きましょう",
    },
    {
      id: "button-text",
      type: "text",
      selector: "form button",
      equals: "送信",
      message: "button タグの中身を「送信」にしましょう",
    },
  ],
  hints: [
    "文字の入力欄は <input> タグで作ります(閉じタグはありません)。ボタンは <button>ボタンの文字</button> の形です",
    '入力欄は <input type="text" placeholder="うすく表示する文字"> の形です。placeholder には入力のヒントを書きます',
    '<input type="text" placeholder="お名前"> と <button>送信</button> の2つを form の中に書きます',
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>おといあわせ</title>
  </head>
  <body>
    <h1>おといあわせ</h1>
    <form>
      <input type="text" placeholder="お名前">
      <button>送信</button>
    </form>
  </body>
</html>
`,
  },
});
