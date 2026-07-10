import { defineLesson } from "@codesteps/lesson-kit";

// CURRICULUM-2 html-advanced #6(穴埋め): caption / th scope="col|row" / tfoot
export default defineLesson({
  slug: "html-adv-06-table-a11y",
  title: "表のアクセシビリティ",
  estMinutes: 6,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>文ぼうぐの値段</title>
  </head>
  <body>
    <h1>文ぼうぐの値段</h1>
    <table>
      <!-- 1. ここに caption で表のタイトル「文ぼうぐの値段」を書こう -->
      <thead>
        <tr>
          <!-- 2. 2つの th に scope="col" を付けよう -->
          <th>商品</th>
          <th>値段</th>
        </tr>
      </thead>
      <tbody>
        <!-- 3. 各行の th に scope="row" を付けよう -->
        <tr>
          <th>えんぴつ</th>
          <td>100円</td>
        </tr>
        <tr>
          <th>ノート</th>
          <td>150円</td>
        </tr>
      </tbody>
      <!-- 4. ここに tfoot で合計の行を書こう(th「合計」と td「250円」) -->
    </table>
  </body>
</html>
`,
    },
  },
  checks: [
    {
      id: "caption-exists",
      type: "element",
      selector: "table > caption",
      message: "table の中の最初に caption で表のタイトルを書きましょう",
    },
    { id: "caption-text", type: "text", selector: "caption", equals: "文ぼうぐの値段" },
    {
      id: "col-scope",
      type: "element",
      selector: 'thead th[scope="col"]',
      count: 2,
      message: 'thead の中の2つの th に scope="col" を付けましょう',
    },
    {
      id: "row-scope",
      type: "element",
      selector: 'tbody th[scope="row"]',
      count: 2,
      message: 'tbody の各行の th に scope="row" を付けましょう',
    },
    {
      id: "tfoot-exists",
      type: "element",
      selector: "tfoot",
      message: "合計の行は tfoot で囲みましょう",
    },
    {
      id: "tfoot-th",
      type: "element",
      selector: "tfoot th",
      message: "tfoot の行に th で「合計」の見出しセルを書きましょう",
    },
    {
      id: "tfoot-total",
      type: "text",
      selector: "tfoot td",
      equals: "250円",
      message: "tfoot の td に合計の「250円」を書きましょう",
    },
  ],
  hints: [
    "caption は table の中のいちばん最初に書く「表のタイトル」です。scope は th に付ける属性で、col なら列(たて)の見出し、row なら行(よこ)の見出しという意味になります",
    '見出しの行の th は <th scope="col">商品</th>、データの行の th は <th scope="row">えんぴつ</th> の形です。tfoot は tbody の後ろに <tfoot><tr>...</tr></tfoot> と書きます',
    '合計の行はこう書きます: <tfoot><tr><th scope="row">合計</th><td>250円</td></tr></tfoot>。caption は <caption>文ぼうぐの値段</caption> です',
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>文ぼうぐの値段</title>
  </head>
  <body>
    <h1>文ぼうぐの値段</h1>
    <table>
      <caption>文ぼうぐの値段</caption>
      <thead>
        <tr>
          <th scope="col">商品</th>
          <th scope="col">値段</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">えんぴつ</th>
          <td>100円</td>
        </tr>
        <tr>
          <th scope="row">ノート</th>
          <td>150円</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th scope="row">合計</th>
          <td>250円</td>
        </tr>
      </tfoot>
    </table>
  </body>
</html>
`,
  },
});
