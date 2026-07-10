import { defineLesson } from "@codesteps/lesson-kit";

// CURRICULUM-2 html-adv #2(穴埋め): dialog 要素と showModal() によるモーダル
export default defineLesson({
  slug: "html-adv-02-dialog",
  title: "dialog とモーダル",
  estMinutes: 7,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>送信の確認</title>
  </head>
  <body>
    <h1>お問い合わせ</h1>
    <p>内容を確認して、送信ボタンを押してください。</p>
    <button id="open">送信する</button>
    <!-- ここに id="confirm" の dialog タグを書こう。
         中には p で確認のメッセージと、id="close" の閉じるボタンを入れよう -->
    <script src="script.js"></script>
  </body>
</html>
`,
    },
    "script.js": {
      initial: `// 送信ボタンとダイアログの要素を取得する
const openButton = document.getElementById("open");
const dialog = document.getElementById("confirm");

// ここに openButton がクリックされたら dialog を showModal で開く処理を書こう


// 「閉じる」ボタン(id="close")の処理は用意してあります
document.addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof Element && target.id === "close" && dialog !== null) {
    dialog.close();
  }
});
`,
    },
  },
  checks: [
    {
      type: "element",
      id: "open-button",
      selector: "#open",
      message: '送信ボタン <button id="open">送信する</button> は消さずに残しておきましょう',
    },
    { type: "element", id: "dialog-exists", selector: "dialog" },
    { type: "attribute", id: "dialog-id", selector: "dialog", name: "id", equals: "confirm" },
    {
      type: "element",
      id: "close-in-dialog",
      selector: "dialog #close",
      message: 'dialog の中に id="close" の閉じるボタンを書きましょう',
    },
    {
      type: "source",
      id: "use-show-modal",
      file: "script.js",
      pattern: "showModal\\s*\\(",
      message: "script.js で dialog.showModal() を呼んで、ダイアログを開きましょう",
    },
    {
      type: "custom",
      id: "open-shows-dialog",
      message:
        "「送信する」ボタンをクリックしたら、ダイアログが開くようにしましょう(dialog は最初は閉じた状態にしておきます)",
      run: async (ctx) => {
        const dialog = ctx.document.querySelector("dialog");
        if (dialog === null) {
          return false;
        }
        // 静的な open 属性などで最初から開いている場合は「クリックで開いた」と見なさない
        if (dialog.open) {
          return false;
        }
        ctx.fire("#open", "click");
        await ctx.wait(50);
        // 再取得で TS の絞り込みを切る(fire 後に open は変わり得る)
        const after = ctx.document.querySelector("dialog");
        return after?.open === true;
      },
    },
    {
      type: "custom",
      id: "close-hides-dialog",
      message: "「閉じる」ボタンをクリックしたら、ダイアログが閉じることを確認しましょう",
      run: async (ctx) => {
        const dialog = ctx.document.querySelector("dialog");
        if (dialog === null) {
          return false;
        }
        if (!dialog.open) {
          ctx.fire("#open", "click");
          await ctx.wait(50);
        }
        if (!dialog.open) {
          return false;
        }
        ctx.fire("#close", "click");
        await ctx.wait(50);
        // fire 後に open は変わり得る(TS の絞り込みが実行時と食い違うため比較でなく否定で書く)
        return !dialog.open;
      },
    },
  ],
  hints: [
    'HTML 側: <dialog id="confirm"> と書いて、その中に p と button を入れます。dialog の中身は普通のタグと同じ書き方です',
    'JS 側: openButton.addEventListener("click", () => { ここに処理 }); の形で、クリックされたら dialog.showModal() を呼びます',
    'HTML は <dialog id="confirm"><p>この内容で送信しますか?</p><button id="close">閉じる</button></dialog>、JS は openButton.addEventListener("click", () => { dialog.showModal(); }); で完成です',
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>送信の確認</title>
  </head>
  <body>
    <h1>お問い合わせ</h1>
    <p>内容を確認して、送信ボタンを押してください。</p>
    <button id="open">送信する</button>
    <dialog id="confirm">
      <p>この内容で送信しますか?</p>
      <button id="close">閉じる</button>
    </dialog>
    <script src="script.js"></script>
  </body>
</html>
`,
    "script.js": `// 送信ボタンとダイアログの要素を取得する
const openButton = document.getElementById("open");
const dialog = document.getElementById("confirm");

// クリックされたらダイアログをモーダルとして開く
openButton.addEventListener("click", () => {
  dialog.showModal();
});

// 「閉じる」ボタン(id="close")の処理は用意してあります
document.addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof Element && target.id === "close" && dialog !== null) {
    dialog.close();
  }
});
`,
  },
});
