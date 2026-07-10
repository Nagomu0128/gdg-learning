import { defineLesson } from "@codesteps/lesson-kit";

// CURRICULUM-2 html-advanced #10(自力): dialog(購入確認)+ details(スペック)+ data-*(価格)+ 表。
// initial は骨格のみ。custom check は 02-dialog と同じ「fire → wait → dialog.open」の決定的パターン。
// 注意: script.js の初期コメントに showModal( を書かない(source check がコメントにマッチするため)。
export default defineLesson({
  slug: "html-adv-10-product",
  title: "総合: 商品詳細ページ",
  estMinutes: 8,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>商品詳細</title>
  </head>
  <body>
    <!-- 商品詳細ページを自力で作ろう。id は script.js と判定が見るので正確に付けること -->
    <!-- 1. h1 で商品名(例: ワイヤレスヘッドホン)を書く -->
    <!-- 2. id="price" の p に data-price="4980" を付けて「4980円」と表示する -->
    <!-- 3. details を書く: summary は「スペック」、中に table で th(項目名)と td(値)の表 -->
    <!-- 4. id="buy" の button「購入する」を書く -->
    <!-- 5. id="confirm" の dialog を書く: 中に p の確認文と id="close" の button「閉じる」 -->
    <script src="script.js"></script>
  </body>
</html>
`,
    },
    "script.js": {
      initial: `// 自分の力で書いてみよう:
// 1. document.getElementById で、購入ボタン(buy)・ダイアログ(confirm)・閉じるボタン(close)を取得する
// 2. 購入ボタンがクリックされたら、ダイアログを showModal でモーダルとして開く
// 3. 閉じるボタンがクリックされたら、ダイアログを close で閉じる
`,
    },
  },
  checks: [
    {
      id: "product-heading",
      type: "element",
      selector: "h1",
      message: "h1 で商品名の見出しを書きましょう",
    },
    {
      id: "price-element",
      type: "element",
      selector: "#price",
      message: 'id="price" を付けた p で価格を表示しましょう(判定がこの id を見ます)',
    },
    {
      id: "price-data",
      type: "attribute",
      selector: "#price",
      name: "data-price",
      equals: "4980",
      message: '価格の要素に data-price="4980" を付けましょう',
    },
    {
      id: "details-exists",
      type: "element",
      selector: "details",
      message: "スペックの表は details で折りたためるようにしましょう",
    },
    {
      id: "summary-in-details",
      type: "element",
      selector: "details > summary",
      message: "details の中の最初に summary で見出し(スペック)を書きましょう",
    },
    {
      id: "table-in-details",
      type: "element",
      selector: "details table",
      message: "details の中に table で、th(項目名)と td(値)のスペック表を書きましょう",
    },
    {
      id: "buy-button",
      type: "element",
      selector: "#buy",
      message: 'id="buy" の「購入する」ボタンを書きましょう',
    },
    {
      id: "dialog-exists",
      type: "element",
      selector: "dialog",
      message: "購入確認のための dialog タグを書きましょう",
    },
    {
      id: "dialog-id",
      type: "attribute",
      selector: "dialog",
      name: "id",
      equals: "confirm",
      message: 'dialog に id="confirm" を付けましょう(script.js がこの id で探します)',
    },
    {
      id: "close-in-dialog",
      type: "element",
      selector: "dialog #close",
      message: 'dialog の中に id="close" の閉じるボタンを入れましょう',
    },
    {
      id: "use-show-modal",
      type: "source",
      file: "script.js",
      pattern: "showModal\\s*\\(",
      message: "script.js で dialog.showModal() を呼んで、購入ボタンからダイアログを開きましょう",
    },
    {
      id: "open-dialog",
      type: "custom",
      message:
        "「購入する」ボタンをクリックしたら、確認ダイアログが開くようにしましょう(dialog は最初は閉じた状態にしておきます)",
      run: async (ctx) => {
        const dialog = ctx.document.querySelector("dialog");
        if (dialog === null) {
          return false;
        }
        // 静的な open 属性などで最初から開いている場合は「クリックで開いた」と見なさない
        if (dialog.open) {
          return false;
        }
        ctx.fire("#buy", "click");
        await ctx.wait(50);
        // 再取得で TS の絞り込みを切る(fire 後に open は変わり得る)
        const after = ctx.document.querySelector("dialog");
        return after?.open === true;
      },
    },
    {
      id: "close-dialog",
      type: "custom",
      message: "「閉じる」ボタンをクリックしたら、ダイアログが閉じるようにしましょう",
      run: async (ctx) => {
        const dialog = ctx.document.querySelector("dialog");
        if (dialog === null) {
          return false;
        }
        if (!dialog.open) {
          ctx.fire("#buy", "click");
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
    "部品はすべてこのコースの復習です。details と summary はレッスン1、dialog と showModal はレッスン2、data-* 属性はレッスン3の形をそのまま使えます。コメントの1から順番に作りましょう",
    'HTML の形: <p id="price" data-price="4980">4980円</p>、<details><summary>スペック</summary><table>...</table></details>、<button id="buy">購入する</button>、<dialog id="confirm"><p>この商品を購入しますか?</p><button id="close">閉じる</button></dialog> です',
    'JS はまず const buyButton = document.getElementById("buy"); const dialog = document.getElementById("confirm"); const closeButton = document.getElementById("close"); で部品を取得し、buyButton.addEventListener("click", () => { dialog.showModal(); }); と closeButton.addEventListener("click", () => { dialog.close(); }); の2つの処理を書けば完成です',
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>商品詳細</title>
  </head>
  <body>
    <h1>ワイヤレスヘッドホン</h1>
    <p id="price" data-price="4980">4980円</p>
    <details>
      <summary>スペック</summary>
      <table>
        <tr>
          <th>重さ</th>
          <td>250g</td>
        </tr>
        <tr>
          <th>連続再生</th>
          <td>30時間</td>
        </tr>
      </table>
    </details>
    <button id="buy">購入する</button>
    <dialog id="confirm">
      <p>この商品を購入しますか?</p>
      <button id="close">閉じる</button>
    </dialog>
    <script src="script.js"></script>
  </body>
</html>
`,
    "script.js": `// 部品を取得する
const buyButton = document.getElementById("buy");
const dialog = document.getElementById("confirm");
const closeButton = document.getElementById("close");

// 購入ボタンでダイアログをモーダルとして開く
buyButton.addEventListener("click", () => {
  dialog.showModal();
});

// 閉じるボタンでダイアログを閉じる
closeButton.addEventListener("click", () => {
  dialog.close();
});
`,
  },
});
