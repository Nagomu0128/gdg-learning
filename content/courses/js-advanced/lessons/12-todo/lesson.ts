import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "js-adv-12-todo",
  title: "総合: TODO リスト",
  estMinutes: 8,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>TODO リスト</title>
    <style>
      .done {
        text-decoration: line-through;
        color: #999999;
      }
    </style>
  </head>
  <body>
    <h1>TODO リスト</h1>
    <!-- ここに id="todo-input" の input と、id="add" の button(追加ボタン)を書こう -->
    <!-- ここに id="list" の ul を書こう(中身は空でよい) -->
    <!-- ここに残数の表示を書こう(例: 残り: 0 件。数字だけを id="count" の span に入れる) -->
    <script src="script.js"></script>
  </body>
</html>
`,
    },
    "script.js": {
      initial: `// TODO リストのプログラムを書こう。動きの仕様(判定はここを見ます):
// - #add をクリックすると、#todo-input の文字が新しい TODO として #list に li で増える
// - li 本体をクリックすると、その li の class "done" が付いたり外れたりする(完了の切り替え)
// - li の中の class="delete" のボタンをクリックすると、その TODO が消える
// - #count には「done が付いていない li の数」をいつも表示する
// おすすめの作り方: 配列で状態を持ち、render() で #list と #count を描き直す(前のレッスンの形)

`,
    },
  },
  checks: [
    {
      type: "element",
      id: "todo-input-exists",
      selector: "input#todo-input",
      message: "やることを書く入力欄(id が todo-input の input)を作りましょう",
    },
    {
      type: "element",
      id: "add-button-exists",
      selector: "button#add",
      message: "追加ボタン(id が add の button)を作りましょう",
    },
    {
      type: "element",
      id: "list-exists",
      selector: "ul#list",
      message: "TODO を並べる場所(id が list の ul)を作りましょう",
    },
    {
      type: "element",
      id: "count-exists",
      selector: "#count",
      message: "残数を表示する場所(id が count の要素)を作りましょう(中身は数字だけにします)",
    },
    {
      type: "text",
      id: "count-starts-at-zero",
      selector: "#count",
      equals: "0",
      message: "はじめは #count の中身を「0」にしましょう(数字だけを入れます)",
    },
    {
      type: "custom",
      id: "add-appends-item",
      message: "追加ボタンを押したら、入力欄の文字が新しい li として #list に増えるようにしましょう",
      run: async (ctx) => {
        const input = ctx.document.querySelector("#todo-input") as HTMLInputElement | null;
        const list = ctx.document.querySelector("#list");
        if (input === null || list === null) {
          return false;
        }
        const before = list.querySelectorAll("li").length;
        input.value = "牛乳を買う";
        ctx.fire("#add", "click");
        await ctx.wait(50);
        const items = Array.from(list.querySelectorAll("li"));
        if (items.length !== before + 1) {
          return false;
        }
        return items.some((li) => (li.textContent ?? "").includes("牛乳を買う"));
      },
    },
    {
      type: "custom",
      id: "click-toggles-done",
      message: "li をクリックするたびに、done クラスが付いたり外れたりする(完了 ⇔ 未完了)ようにしましょう",
      run: async (ctx) => {
        const before = ctx.document.querySelector("#list li");
        if (before === null) {
          return false;
        }
        const had = before.classList.contains("done");
        ctx.fire("#list li", "click");
        await ctx.wait(50);
        const after = ctx.document.querySelector("#list li");
        if (after === null || after.classList.contains("done") === had) {
          return false;
        }
        ctx.fire("#list li", "click");
        await ctx.wait(50);
        const again = ctx.document.querySelector("#list li");
        if (again === null) {
          return false;
        }
        return again.classList.contains("done") === had;
      },
    },
    {
      type: "custom",
      id: "delete-removes-item",
      message: "li の中に class が delete のボタンを置き、押したらその TODO の li が消えるようにしましょう",
      run: async (ctx) => {
        const list = ctx.document.querySelector("#list");
        if (list === null) {
          return false;
        }
        const before = list.querySelectorAll("li").length;
        if (before === 0) {
          return false;
        }
        ctx.fire("#list li .delete", "click");
        await ctx.wait(50);
        return list.querySelectorAll("li").length === before - 1;
      },
    },
    {
      type: "custom",
      id: "count-tracks-remaining",
      message:
        "#count の数字が「done が付いていない li の数」にいつも追従するようにしましょう(追加したら増え、完了にしたら減ります)",
      run: async (ctx) => {
        const input = ctx.document.querySelector("#todo-input") as HTMLInputElement | null;
        if (input === null) {
          return false;
        }
        input.value = "たまごを買う";
        ctx.fire("#add", "click");
        await ctx.wait(50);
        input.value = "そうじをする";
        ctx.fire("#add", "click");
        await ctx.wait(50);
        const countBefore = ctx.document.querySelector("#count");
        if (countBefore === null || (countBefore.textContent ?? "").trim() !== "2") {
          return false;
        }
        ctx.fire("#list li", "click");
        await ctx.wait(50);
        const countAfter = ctx.document.querySelector("#count");
        if (countAfter === null) {
          return false;
        }
        return (countAfter.textContent ?? "").trim() === "1";
      },
    },
  ],
  hints: [
    "状態は const todos = []; の配列で持ち、追加は todos.push({ text: input.value, done: false }) です。「配列を変えたら render() で描き直す」に統一すると、追加・完了・削除がぜんぶ同じ形で書けます",
    'render() では list.innerHTML = "" で空にしてから todos.forEach((todo, index) => { ... }) で li を作ります。li.textContent に todo.text、li.dataset.index = index で番号をメモし、done なら li.classList.add("done")。削除ボタンは button を作って className = "delete" にして li に appendChild します。残数は todos.filter((todo) => !todo.done).length を #count に入れます',
    'クリックは list に1回で受けます(イベントデリゲーション)。event.target.classList.contains("delete") なら const index = Number(event.target.parentNode.dataset.index); todos.splice(index, 1);、event.target.tagName === "LI" なら const index = Number(event.target.dataset.index); todos[index].done = !todos[index].done; を実行し、どちらも最後に render() を呼びます',
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>TODO リスト</title>
    <style>
      .done {
        text-decoration: line-through;
        color: #999999;
      }
    </style>
  </head>
  <body>
    <h1>TODO リスト</h1>
    <input id="todo-input" placeholder="やることを入力">
    <button id="add">追加</button>
    <ul id="list"></ul>
    <p>残り: <span id="count">0</span> 件</p>
    <script src="script.js"></script>
  </body>
</html>
`,
    "script.js": `// 状態: TODO の配列。{ text: 文字列, done: 真偽値 } のオブジェクトで持つ
const todos = [];

const input = document.getElementById("todo-input");
const addButton = document.getElementById("add");
const list = document.getElementById("list");
const count = document.getElementById("count");

// 状態から画面をぜんぶ描き直す
function render() {
  list.innerHTML = "";
  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.textContent = todo.text;
    li.dataset.index = index;
    if (todo.done) {
      li.classList.add("done");
    }
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete";
    deleteButton.textContent = "削除";
    li.appendChild(deleteButton);
    list.appendChild(li);
  });
  // done でない TODO の数を残数として表示する
  count.textContent = todos.filter((todo) => !todo.done).length;
}

// 追加ボタン: 入力欄の文字を新しい TODO にする
addButton.addEventListener("click", () => {
  if (input.value === "") {
    return;
  }
  todos.push({ text: input.value, done: false });
  input.value = "";
  render();
});

// リスト全体で1回だけクリックを受ける(イベントデリゲーション)
list.addEventListener("click", (event) => {
  const target = event.target;
  if (target.classList.contains("delete")) {
    // 削除ボタン: 親の li にメモした番号の TODO を配列から取り除く
    const index = Number(target.parentNode.dataset.index);
    todos.splice(index, 1);
    render();
  } else if (target.tagName === "LI") {
    // li 本体: 完了を反転する
    const index = Number(target.dataset.index);
    todos[index].done = !todos[index].done;
    render();
  }
});

// 最初に1回描画する
render();
`,
  },
});
