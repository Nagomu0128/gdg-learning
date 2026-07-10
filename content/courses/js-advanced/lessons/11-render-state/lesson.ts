import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-adv-11-render-state",
  title: "状態から描画する",
  estMinutes: 7,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>状態から描画する</title>
  </head>
  <body>
    <h1>フォローパネル</h1>
    <button id="follow">フォローする</button>
    <p id="followers"></p>
    <script src="script.js"></script>
  </body>
</html>
`,
      editable: false,
    },
    "script.js": {
      initial: `// 画面の状態(データ)を1つのオブジェクトにまとめる
const state = {
  following: false,
  followers: 100,
};

const button = document.getElementById("follow");
const followers = document.getElementById("followers");

// state を見て、画面の表示をすべて作り直す関数
function render() {
  // ここに書こう
  // 1. followers の文字を「フォロワー: (state の followers)人」にする
  //    (コロンは半角の : と半角スペース1つ)
  // 2. button の文字を、following が true なら「フォロー中」、
  //    false なら「フォローする」にする
}

// ここに button の click の処理を登録しよう
// 1. state の following を ! で反転する(true ⇔ false)
// 2. following になったら followers を +1、外れたら -1 する
// 3. 最後に render() を呼んで画面を描き直す

// 最初に1回描画する
render();
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "render-function-exists",
      file: "script.js",
      pattern: "function\\s+render\\s*\\(",
      message: "画面を描き直す render は、function 宣言のまま残しましょう",
    },
    {
      type: "text",
      id: "initial-followers-shown",
      selector: "#followers",
      equals: "フォロワー: 100人",
      message:
        "読み込み直後に「フォロワー: 100人」と表示しましょう(render の中で followers の文字を作ると、最後の render() で描画されます)",
    },
    {
      type: "source",
      id: "state-drives-render",
      file: "script.js",
      pattern: "state\\s*\\.\\s*following",
      message: "state.following を使いましょう(render で読んで表示を決め、クリックの処理で反転します)",
    },
    {
      type: "custom",
      id: "click-follows",
      message:
        "ボタンを押したら state が変わり、「フォロワー: 101人」「フォロー中」に表示が更新されるようにしましょう",
      run: async (ctx) => {
        ctx.fire("#follow", "click");
        await ctx.wait(50);
        const followers = ctx.document.querySelector("#followers");
        const button = ctx.document.querySelector("#follow");
        if (followers === null || button === null) {
          return false;
        }
        return (
          (followers.textContent ?? "").trim() === "フォロワー: 101人" &&
          (button.textContent ?? "").trim() === "フォロー中"
        );
      },
    },
    {
      type: "custom",
      id: "click-unfollows",
      message:
        "もう一度押したらフォローが外れて、「フォロワー: 100人」「フォローする」に戻るようにしましょう",
      run: async (ctx) => {
        ctx.fire("#follow", "click");
        await ctx.wait(50);
        const followers = ctx.document.querySelector("#followers");
        const button = ctx.document.querySelector("#follow");
        if (followers === null || button === null) {
          return false;
        }
        return (
          (followers.textContent ?? "").trim() === "フォロワー: 100人" &&
          (button.textContent ?? "").trim() === "フォローする"
        );
      },
    },
  ],
  hints: [
    `render() は「state を見て表示を作る」だけの関数にします。followers.textContent と button.textContent の2つを state から決めます。文字は \`フォロワー: \${state.followers}人\` のようにテンプレートリテラルが便利です`,
    "クリックの処理は「state を変える → render() を呼ぶ」の順です。反転は state.following = !state.following; と書きます",
    "クリック処理の中身: state.following = !state.following; のあと、if (state.following) { state.followers = state.followers + 1; } else { state.followers = state.followers - 1; } として、最後に render(); を呼びます",
  ],
  solution: {
    "script.js": `// 画面の状態(データ)を1つのオブジェクトにまとめる
const state = {
  following: false,
  followers: 100,
};

const button = document.getElementById("follow");
const followers = document.getElementById("followers");

// state を見て、画面の表示をすべて作り直す関数
function render() {
  followers.textContent = \`フォロワー: \${state.followers}人\`;
  if (state.following) {
    button.textContent = "フォロー中";
  } else {
    button.textContent = "フォローする";
  }
}

// ボタンでは「state を変えてから render() で描き直す」
button.addEventListener("click", () => {
  state.following = !state.following;
  if (state.following) {
    state.followers = state.followers + 1;
  } else {
    state.followers = state.followers - 1;
  }
  render();
});

// 最初に1回描画する
render();
`,
  },
});
