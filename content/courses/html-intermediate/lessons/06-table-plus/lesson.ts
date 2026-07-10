import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "html-int-06-table-plus",
  title: "表の構造化",
  estMinutes: 7,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>文化祭の売上</title>
  </head>
  <body>
    <h1>文化祭の売上</h1>
    <table>
      <!-- ここに caption で表のタイトル「模擬店の売上表」を書こう -->
      <thead>
        <tr>
          <!-- 2つの th に scope="col" を付けよう -->
          <th>商品</th>
          <th>売上</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>やきそば</td>
          <td>3000円</td>
        </tr>
        <tr>
          <td>ジュース</td>
          <td>2000円</td>
        </tr>
        <!-- ここに合計の行を追加しよう: td に colspan="2" を付けて「合計 5000円」 -->
      </tbody>
    </table>
  </body>
</html>
`,
    },
  },
  checks: [
    { id: "caption-exists", type: "element", selector: "caption" },
    { id: "thead-exists", type: "element", selector: "thead" },
    { id: "tbody-exists", type: "element", selector: "tbody" },
    { id: "caption-text", type: "text", selector: "caption", equals: "模擬店の売上表" },
    {
      id: "th-scope-col",
      type: "element",
      selector: 'thead th[scope="col"]',
      count: 2,
      message: '2つの th に scope="col" を付けましょう',
    },
    {
      id: "tbody-rows",
      type: "element",
      selector: "tbody > tr",
      count: 3,
      message: "tbody の中の行(tr)を3行にしましょう(データ2行 + 合計の行1行)",
    },
    {
      id: "total-colspan",
      type: "attribute",
      selector: "tbody td[colspan]",
      name: "colspan",
      equals: "2",
      message: '合計の行の td に colspan="2" を付けて、2列分をつなげましょう',
    },
  ],
  hints: [
    "表のタイトルは caption、見出し行のまとまりは thead、データ行のまとまりは tbody です。caption は table の最初に書きます",
    'scope="col" は「このセルは列(縦方向)の見出し」という意味です。<th scope="col">商品</th> のように書きます',
    'caption は <caption>模擬店の売上表</caption>、合計の行は <tr><td colspan="2">合計 5000円</td></tr> と書きます',
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>文化祭の売上</title>
  </head>
  <body>
    <h1>文化祭の売上</h1>
    <table>
      <caption>模擬店の売上表</caption>
      <thead>
        <tr>
          <th scope="col">商品</th>
          <th scope="col">売上</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>やきそば</td>
          <td>3000円</td>
        </tr>
        <tr>
          <td>ジュース</td>
          <td>2000円</td>
        </tr>
        <tr>
          <td colspan="2">合計 5000円</td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
`,
  },
});
