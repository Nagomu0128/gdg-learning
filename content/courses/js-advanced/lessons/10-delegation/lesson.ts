import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-adv-10-delegation",
  title: "イベントデリゲーション",
  estMinutes: 7,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>イベントデリゲーション</title>
    <style>
      li {
        cursor: pointer;
      }
      .done {
        text-decoration: line-through;
        color: #999999;
      }
    </style>
  </head>
  <body>
    <h1>買い物リスト</h1>
    <p>買ったものをクリックすると、打ち消し線が付きます</p>
    <ul id="list"></ul>
    <script src="script.js"></script>
  </body>
</html>
`,
      editable: false,
    },
    "script.js": {
      initial: `// 品物の配列から li を作って追加する(この部分は完成しています)
const items = ["りんご", "ぎゅうにゅう", "たまご"];
const list = document.getElementById("list");

for (const name of items) {
  const li = document.createElement("li");
  li.textContent = name;
  list.appendChild(li);
}

// ここに、親の list へ click イベントの処理を「1回だけ」登録しよう
// クリックされた要素(event.target)のタグ名が "LI" のときだけ、
// その要素の classList で "done" クラスを toggle する

`,
    },
  },
  checks: [
    {
      type: "element",
      id: "list-items-rendered",
      selector: "#list li",
      count: 3,
      message:
        "配列から作られた3つの li が #list の中にある状態にしましょう(初期コードのくり返し部分はそのまま使います)",
    },
    {
      type: "source",
      id: "single-listener",
      file: "script.js",
      pattern: "^(?:(?!addEventListener)[\\s\\S])*addEventListener(?:(?!addEventListener)[\\s\\S])*$",
      message:
        "click の処理は addEventListener で親の list に1回だけ登録しましょう(li の1つ1つには付けません。コメント内の記述も回数に数えます)",
    },
    {
      type: "custom",
      id: "click-marks-done",
      message:
        "li をクリックしたら、その li だけに done クラスが付くようにしましょう(ほかの li には付けません)",
      run: async (ctx) => {
        ctx.fire("#list li:nth-child(2)", "click");
        await ctx.wait(50);
        const first = ctx.document.querySelector("#list li:nth-child(1)");
        const second = ctx.document.querySelector("#list li:nth-child(2)");
        if (first === null || second === null) {
          return false;
        }
        return second.classList.contains("done") && !first.classList.contains("done");
      },
    },
    {
      type: "custom",
      id: "click-toggles-back",
      message: "同じ li をもう一度クリックしたら、done クラスが外れるようにしましょう(toggle を使います)",
      run: async (ctx) => {
        ctx.fire("#list li:nth-child(2)", "click");
        await ctx.wait(50);
        const second = ctx.document.querySelector("#list li:nth-child(2)");
        if (second === null) {
          return false;
        }
        return !second.classList.contains("done");
      },
    },
    {
      type: "custom",
      id: "reacts-to-added-item",
      message:
        "あとから追加された li のクリックにも反応するようにしましょう(li の1つ1つではなく、親の list にイベントを登録すると実現できます)",
      run: async (ctx) => {
        const list = ctx.document.querySelector("#list");
        if (list === null) {
          return false;
        }
        const li = ctx.document.createElement("li");
        li.id = "added-by-judge";
        li.textContent = "おちゃ";
        list.appendChild(li);
        ctx.fire("#added-by-judge", "click");
        await ctx.wait(50);
        return li.classList.contains("done");
      },
    },
  ],
  hints: [
    'list.addEventListener("click", (event) => { ... }) と、親の list に1回だけ登録します。処理が event を受け取るのを忘れずに',
    '実際にクリックされた要素は event.target で取れます。li かどうかは event.target.tagName === "LI" で調べます(タグ名は大文字で返ります)',
    '処理の中身はこうなります: if (event.target.tagName === "LI") { event.target.classList.toggle("done"); }',
  ],
  solution: {
    "script.js": `// 品物の配列から li を作って追加する(この部分は完成しています)
const items = ["りんご", "ぎゅうにゅう", "たまご"];
const list = document.getElementById("list");

for (const name of items) {
  const li = document.createElement("li");
  li.textContent = name;
  list.appendChild(li);
}

// 親の list に1回だけ登録する(イベントデリゲーション)
list.addEventListener("click", (event) => {
  // クリックされたのが li のときだけ反応する
  if (event.target.tagName === "LI") {
    event.target.classList.toggle("done");
  }
});
`,
  },
});
