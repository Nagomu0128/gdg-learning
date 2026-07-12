import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "lib-int-04-lodash-get",
  title: "深い階層を安全に扱う",
  estMinutes: 8,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>深い階層を安全に扱う</title>
  </head>
  <body>
    <h1>深いデータを安全に扱う</h1>
    <p>市区町村: <span id="city"></span></p>
    <p>郵便番号: <span id="zip"></span></p>
    <p>元の名前: <span id="orig"></span></p>
    <p>コピーの名前: <span id="copy"></span></p>
    <script src="/vendor/lodash.min.js"></script>
    <script src="main.js"></script>
  </body>
</html>
`,
      editable: false,
    },
    "main.js": {
      initial: `// lodash で「深いオブジェクト」を安全に扱う
const data = {
  user: { profile: { name: "山田", address: { city: "東京" } } },
};

// (1) 深い階層の値を取り出そう。_.get にドットでつないだパスを渡す
const city = "";

// (2) 存在しない階層は既定値でしのぐ。_.get の第 3 引数に "未登録" を渡す
const zip = "";

// (3) data を丸ごと複製しよう。_.cloneDeep を使う(copy を変えても data は無傷)
const copy = data;
copy.user.profile.name = "変更後";

document.getElementById("city").textContent = city;
document.getElementById("zip").textContent = zip;
document.getElementById("orig").textContent = data.user.profile.name;
document.getElementById("copy").textContent = copy.user.profile.name;
console.log("市区町村:", city);
console.log("郵便番号:", zip);
console.log("元の名前:", data.user.profile.name);
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-get",
      file: "main.js",
      pattern: "_\\.get\\(",
      message: "_.get を使って深い階層の値を取り出しましょう",
    },
    {
      type: "source",
      id: "use-clonedeep",
      file: "main.js",
      pattern: "_\\.cloneDeep\\(",
      message: "_.cloneDeep を使って data を丸ごと複製しましょう",
    },
    {
      type: "text",
      id: "show-city",
      selector: "#city",
      equals: "東京",
      message: '_.get(data, "user.profile.address.city") で 東京 を取り出しましょう',
    },
    {
      type: "text",
      id: "show-zip",
      selector: "#zip",
      equals: "未登録",
      message: "存在しない zip は、第 3 引数の既定値 未登録 が返るようにしましょう",
    },
    {
      type: "text",
      id: "show-orig",
      selector: "#orig",
      equals: "山田",
      message: "cloneDeep で複製すれば、コピーを変えても元の名前は 山田 のままです",
    },
    {
      type: "text",
      id: "show-copy",
      selector: "#copy",
      equals: "変更後",
      message: "複製した copy 側の名前は 変更後 になります",
    },
    {
      type: "console",
      id: "log-all",
      lines: ["市区町村: 東京", "郵便番号: 未登録", "元の名前: 山田"],
      message: "コンソールに市区町村・郵便番号・元の名前を出力しましょう",
    },
  ],
  hints: [
    '_.get(data, "user.profile.address.city") のように、ドットでつないだ文字列で深い値を取り出せます。途中が無くてもエラーになりません',
    '第 3 引数に既定値を渡すと、値が無いときにそれを返します: _.get(data, "user.profile.address.zip", "未登録")',
    "コピーは _.cloneDeep(data) で作ります。そのまま代入する浅いコピーだと、copy を変えたとき data まで変わってしまいます",
  ],
  solution: {
    "main.js": `const data = {
  user: { profile: { name: "山田", address: { city: "東京" } } },
};

const city = _.get(data, "user.profile.address.city");

const zip = _.get(data, "user.profile.address.zip", "未登録");

const copy = _.cloneDeep(data);
copy.user.profile.name = "変更後";

document.getElementById("city").textContent = city;
document.getElementById("zip").textContent = zip;
document.getElementById("orig").textContent = data.user.profile.name;
document.getElementById("copy").textContent = copy.user.profile.name;
console.log("市区町村:", city);
console.log("郵便番号:", zip);
console.log("元の名前:", data.user.profile.name);
`,
  },
});
