import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "html-06-table",
  title: "表をつくる",
  estMinutes: 6,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>すきなくだもの</title>
  </head>
  <body>
    <h1>すきなくだもの</h1>
    <table>
      <tr>
        <th>名前</th>
        <!-- ここに「値段」の見出しセル(th)を書こう -->
      </tr>
      <tr>
        <td>りんご</td>
        <td>150円</td>
      </tr>
      <!-- ここに「みかん」「100円」の行(tr)を追加しよう -->
    </table>
  </body>
</html>
`,
    },
  },
  checks: [
    { id: "table-exists", type: "element", selector: "table" },
    { id: "tr-count", type: "element", selector: "tr", count: 3 },
    { id: "th-count", type: "element", selector: "th", count: 2 },
    { id: "td-count", type: "element", selector: "td", count: 4 },
  ],
  hints: [
    "表は <table> の中に行をならべて作ります。行は <tr>、見出しのセルは <th>、データのセルは <td> で書きます",
    "見出しの行には <th>値段</th> を足します。データの行は <tr> の中に <td> を2つ入れた形で、もう1行追加します",
    "みかんの行はこう書きます: <tr><td>みかん</td><td>100円</td></tr>",
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>すきなくだもの</title>
  </head>
  <body>
    <h1>すきなくだもの</h1>
    <table>
      <tr>
        <th>名前</th>
        <th>値段</th>
      </tr>
      <tr>
        <td>りんご</td>
        <td>150円</td>
      </tr>
      <tr>
        <td>みかん</td>
        <td>100円</td>
      </tr>
    </table>
  </body>
</html>
`,
  },
});
