import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "html-int-07-form-controls",
  title: "フォーム部品図鑑",
  estMinutes: 7,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>おやつアンケート</title>
  </head>
  <body>
    <h1>おやつアンケート</h1>
    <form>
      <p>
        <!-- この label に for="snack" を付けて、select とつなごう -->
        <label>すきなおやつ</label>
        <select id="snack">
          <option>チョコレート</option>
          <!-- ここに option を2つ追加しよう(ポテトチップス・グミ) -->
        </select>
      </p>
      <p>
        また食べたいですか
        <input type="radio" name="again" id="again-yes">
        <label for="again-yes">はい</label>
        <!-- ここに「いいえ」のラジオボタンを追加しよう(name は同じ "again"、id は "again-no"。label も忘れずに) -->
      </p>
      <p>
        <!-- ここに label と textarea で「ひとこと」欄を作ろう(id="comment") -->
      </p>
      <button>送信</button>
    </form>
  </body>
</html>
`,
    },
  },
  checks: [
    { id: "select-exists", type: "element", selector: "select" },
    { id: "textarea-exists", type: "element", selector: "textarea" },
    {
      id: "option-count",
      type: "element",
      selector: "select > option",
      count: 3,
      message: "select の中に option を3個入れましょう",
    },
    {
      id: "radio-count",
      type: "element",
      selector: 'input[type="radio"]',
      count: 2,
      message: 'type="radio" の input(ラジオボタン)を2個にしましょう',
    },
    {
      id: "radio-name",
      type: "element",
      selector: 'input[type="radio"][name="again"]',
      count: 2,
      message: '2つのラジオボタンに、同じ name="again" を付けましょう',
    },
    {
      id: "label-for",
      type: "attribute",
      selector: "label",
      name: "for",
      equals: "snack",
      message: '「すきなおやつ」の label に for="snack" を付けて、select の id とつなぎましょう',
    },
  ],
  hints: [
    "select の中に option をならべると選択肢になります。ラジオボタンは name が同じもの同士が「1つだけ選べるグループ」になります",
    'いいえのラジオボタンは <input type="radio" name="again" id="again-no"> と <label for="again-no">いいえ</label> のペアで書きます',
    'option は <option>ポテトチップス</option> と <option>グミ</option> を追加。ひとこと欄は <label for="comment">ひとこと</label> と <textarea id="comment"></textarea>。最初の label は <label for="snack">すきなおやつ</label> にします',
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>おやつアンケート</title>
  </head>
  <body>
    <h1>おやつアンケート</h1>
    <form>
      <p>
        <label for="snack">すきなおやつ</label>
        <select id="snack">
          <option>チョコレート</option>
          <option>ポテトチップス</option>
          <option>グミ</option>
        </select>
      </p>
      <p>
        また食べたいですか
        <input type="radio" name="again" id="again-yes">
        <label for="again-yes">はい</label>
        <input type="radio" name="again" id="again-no">
        <label for="again-no">いいえ</label>
      </p>
      <p>
        <label for="comment">ひとこと</label>
        <textarea id="comment"></textarea>
      </p>
      <button>送信</button>
    </form>
  </body>
</html>
`,
  },
});
