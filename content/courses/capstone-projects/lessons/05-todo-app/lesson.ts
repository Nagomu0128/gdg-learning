import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "cap-05-todo-app",
  title: "TODO アプリ完全版",
  estMinutes: 25,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>TODO アプリ</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <!-- ここに自由に TODO アプリの画面を作ろう。判定が見る名前は次の6つだけ:
      - やることの入力欄: id="todo-input"
      - 追加ボタン: id="add-button"
      - リスト: id="todo-list"(項目は li として追加する)
      - 完了した li に付ける class: "done"(li のクリックで付け外し)
      - 各 li の中に置く削除ボタン: class="delete"
      - 未完了の件数の表示: id="count"(半角数字で表示)
    -->
    <script src="script.js"></script>
  </body>
</html>
`,
    },
    "style.css": {
      initial: `/* 自由にデザインしよう(判定は CSS を見ません) */
`,
    },
    "script.js": {
      initial: `// ここに TODO アプリのプログラムを書こう(追加 → 完了トグル → 削除 → 残数表示 の順で作るのがおすすめ)

`,
    },
  },
  checks: [
    {
      type: "custom",
      id: "add-appends-item",
      message:
        "入力欄(#todo-input)に文字を入れて追加ボタン(#add-button)を押したら、#todo-list にその文字の入った li が増えるようにしましょう",
      run: async (ctx) => {
        const input = ctx.document.querySelector("#todo-input") as HTMLInputElement | null;
        if (input === null) {
          return false;
        }
        const before = ctx.document.querySelectorAll("#todo-list li").length;
        input.value = "牛乳を買う";
        ctx.fire("#add-button", "click");
        await ctx.wait(100);
        const items = Array.from(ctx.document.querySelectorAll("#todo-list li"));
        if (items.length !== before + 1) {
          return false;
        }
        return items.some((li) => (li.textContent ?? "").includes("牛乳を買う"));
      },
    },
    {
      type: "custom",
      id: "click-toggles-done",
      message:
        'リストの項目(li)をクリックしたら class="done" が付き、もう一度クリックしたら外れる(完了/未完了の切り替え)ようにしましょう',
      run: async (ctx) => {
        // 項目が無ければ、まず1件追加してから確かめる
        let li = ctx.document.querySelector("#todo-list li");
        if (li === null) {
          const input = ctx.document.querySelector("#todo-input") as HTMLInputElement | null;
          if (input === null) {
            return false;
          }
          input.value = "そうじをする";
          ctx.fire("#add-button", "click");
          await ctx.wait(100);
          li = ctx.document.querySelector("#todo-list li");
          if (li === null) {
            return false;
          }
        }
        const before = li.classList.contains("done");
        ctx.fire("#todo-list li", "click");
        await ctx.wait(100);
        const mid = ctx.document.querySelector("#todo-list li");
        if (mid === null || mid.classList.contains("done") === before) {
          return false;
        }
        ctx.fire("#todo-list li", "click");
        await ctx.wait(100);
        const after = ctx.document.querySelector("#todo-list li");
        return after !== null && after.classList.contains("done") === before;
      },
    },
    {
      type: "custom",
      id: "delete-removes-item",
      message: '項目の中の削除ボタン(class="delete")を押したら、その li がリストから消えるようにしましょう',
      run: async (ctx) => {
        // 項目が無ければ、まず1件追加してから確かめる
        if (ctx.document.querySelector("#todo-list li") === null) {
          const input = ctx.document.querySelector("#todo-input") as HTMLInputElement | null;
          if (input === null) {
            return false;
          }
          input.value = "ゴミを出す";
          ctx.fire("#add-button", "click");
          await ctx.wait(100);
        }
        const before = ctx.document.querySelectorAll("#todo-list li").length;
        if (before === 0 || ctx.document.querySelector("#todo-list li .delete") === null) {
          return false;
        }
        ctx.fire("#todo-list li .delete", "click");
        await ctx.wait(100);
        return ctx.document.querySelectorAll("#todo-list li").length === before - 1;
      },
    },
    {
      type: "custom",
      id: "count-follows",
      message:
        "#count に「まだ完了していない項目の数」を半角数字で表示し、追加や完了のたびに更新されるようにしましょう(例: 残り 2 件)",
      run: async (ctx) => {
        const input = ctx.document.querySelector("#todo-input") as HTMLInputElement | null;
        if (input === null || ctx.document.querySelector("#count") === null) {
          return false;
        }
        const shownCount = () => {
          const text = ctx.document.querySelector("#count")?.textContent ?? "";
          const m = text.match(/\d+/);
          return m === null ? null : Number(m[0]);
        };
        const remaining = () => ctx.document.querySelectorAll("#todo-list li:not(.done)").length;
        // 追加した直後に表示が実際の未完了数と一致すること
        input.value = "打ち合わせの準備";
        ctx.fire("#add-button", "click");
        await ctx.wait(100);
        if (shownCount() !== remaining()) {
          return false;
        }
        // 完了に切り替えた直後も追従すること
        ctx.fire("#todo-list li", "click");
        await ctx.wait(100);
        return shownCount() === remaining();
      },
    },
  ],
  hints: [
    "中心になるのは addTodo 関数です。li を作って ul に追加するとき、その li のクリック処理(完了トグル)と削除ボタンもいっしょに付けてしまうのがコツです。件数が変わる操作(追加・完了・削除)の最後では、かならず updateCount() を呼びます",
    '追加の部分実装: const li = document.createElement("li"); に input.value の文字を入れて(span を作って textContent に入れると削除ボタンと分けられます)、document.getElementById("todo-list").appendChild(li); します。追加したら input.value = ""; で入力欄を空に戻します',
    '完了トグルは li.addEventListener("click", () => { li.classList.toggle("done"); updateCount(); }); です。削除は class="delete" の button を li の中に入れて、クリックで li.remove() します。ボタンのクリックは li にも伝わるので、削除の処理の最初に event.stopPropagation(); を呼んで完了トグルと混ざらないようにします',
    `残り件数は「done が付いていない li の数」です。const remaining = document.querySelectorAll("#todo-list li:not(.done)").length; で数えて、document.getElementById("count").textContent = \`残り \${remaining} 件\`; のように半角数字で表示します`,
    'エンターキー対応(判定対象外のおまけ): input.addEventListener("keydown", (event) => { if (event.key === "Enter") { addTodo(); } }); のように、追加ボタンと同じ関数を呼べば完成です',
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>TODO アプリ</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <main class="app">
      <h1>やることリスト</h1>
      <p id="count"></p>
      <div class="input-row">
        <input id="todo-input" placeholder="やることを入力">
        <button id="add-button">追加</button>
      </div>
      <ul id="todo-list"></ul>
    </main>
    <script src="script.js"></script>
  </body>
</html>
`,
    "style.css": `body {
  margin: 0;
  padding-top: 48px;
  display: flex;
  justify-content: center;
  font-family: sans-serif;
  background-color: #f0fdf4;
}

.app {
  width: 400px;
  padding: 24px;
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 10px 30px rgba(6, 78, 59, 0.12);
}

h1 {
  margin-top: 0;
  font-size: 22px;
  color: #065f46;
}

#count {
  color: #059669;
  font-weight: bold;
}

.input-row {
  display: flex;
  column-gap: 8px;
}

#todo-input {
  flex-grow: 1;
  padding: 8px 12px;
  font-size: 14px;
  border: 2px solid #a7f3d0;
  border-radius: 8px;
}

#add-button {
  padding: 8px 16px;
  font-size: 14px;
  color: #ffffff;
  background-color: #059669;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

#todo-list {
  list-style: none;
  padding-left: 0;
  margin-bottom: 0;
}

#todo-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #d1fae5;
  cursor: pointer;
}

#todo-list li.done {
  text-decoration: line-through;
  color: #9ca3af;
}

.delete {
  padding: 4px 10px;
  font-size: 12px;
  color: #dc2626;
  background-color: #ffffff;
  border: 1px solid #fecaca;
  border-radius: 6px;
  cursor: pointer;
}
`,
    "script.js": `// 部品の取得
const input = document.getElementById("todo-input");
const addButton = document.getElementById("add-button");
const list = document.getElementById("todo-list");
const countEl = document.getElementById("count");

// 未完了の件数を数えて #count に表示する
function updateCount() {
  const remaining = list.querySelectorAll("li:not(.done)").length;
  countEl.textContent = \`残り \${remaining} 件\`;
}

// やることを1件追加する
function addTodo() {
  const text = input.value.trim();
  if (text === "") {
    return;
  }

  const li = document.createElement("li");
  const label = document.createElement("span");
  label.textContent = text;

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete";
  deleteButton.textContent = "削除";

  // li のクリックで完了/未完了を切り替える
  li.addEventListener("click", () => {
    li.classList.toggle("done");
    updateCount();
  });

  // 削除ボタンのクリックは li に伝えない(完了トグルと混ざらないように)
  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    li.remove();
    updateCount();
  });

  li.appendChild(label);
  li.appendChild(deleteButton);
  list.appendChild(li);

  input.value = "";
  updateCount();
}

// 追加ボタンとエンターキーの両方で追加できるようにする
addButton.addEventListener("click", addTodo);
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTodo();
  }
});

updateCount();
`,
  },
});
