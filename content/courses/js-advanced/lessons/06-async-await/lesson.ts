import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-adv-06-async-await",
  title: "async / await",
  estMinutes: 7,
  runner: "worker",
  files: {
    "script.js": {
      initial: `// 擬似的なデータ取得(そのままでOK): ms ミリ秒後に value で解決する Promise を返す
function fetchData(value, ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, ms);
  });
}

// async 関数 fetchTotal をつくろう
async function fetchTotal() {
  // ここでやること:
  //   1. fetchData(100, 200) の結果を await で受け取って、変数に入れる
  //   2. fetchData(200, 200) の結果も await で受け取って、変数に入れる
  //   3. 2つをたした合計を return する

}

// 動作確認・判定用(ここから下はそのままでOK)
globalThis.fetchTotal = fetchTotal;
fetchTotal().then((total) => {
  console.log(total);
});
`,
    },
  },
  checks: [
    {
      id: "declare-async-function",
      type: "source",
      file: "script.js",
      pattern: "async\\s+function\\s+fetchTotal",
      message: "fetchTotal は async function fetchTotal() { ... } の形のまま宣言しましょう",
    },
    {
      id: "use-await",
      type: "source",
      file: "script.js",
      pattern: "await\\s+fetchData",
      message: "await fetchData(...) の形で、結果が届くのを待って受け取りましょう",
    },
    {
      id: "fetch-total-300",
      type: "fn",
      name: "fetchTotal",
      args: [],
      returns: 300,
      message: "fetchTotal() の結果が 300 になるようにしましょう(100 と 200 を await で受け取ってたします)",
    },
  ],
  hints: [
    "async を付けた関数の中では await が使えます。await は Promise が解決するまで待って、その値を取り出します",
    "const first = await fetchData(100, 200); のように、待って受け取った値を変数に入れます。2つ目も同じ形です",
    "const first = await fetchData(100, 200); const second = await fetchData(200, 200); return first + second; の3行で完成です",
  ],
  solution: {
    "script.js": `// 擬似的なデータ取得(そのままでOK): ms ミリ秒後に value で解決する Promise を返す
function fetchData(value, ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, ms);
  });
}

// async 関数 fetchTotal: 2つのデータを順番に受け取って合計する
async function fetchTotal() {
  const first = await fetchData(100, 200);
  const second = await fetchData(200, 200);
  return first + second;
}

// 動作確認・判定用(ここから下はそのままでOK)
globalThis.fetchTotal = fetchTotal;
fetchTotal().then((total) => {
  console.log(total);
});
`,
  },
});
