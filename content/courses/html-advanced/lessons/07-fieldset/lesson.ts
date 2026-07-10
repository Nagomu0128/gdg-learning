import { defineLesson } from "@codesteps/lesson-kit";

// CURRICULUM-2 html-advanced #7(穴埋め): fieldset / legend / autocomplete / inputmode
export default defineLesson({
  slug: "html-adv-07-fieldset",
  title: "フォームをグループ化",
  estMinutes: 6,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>おとどけ先フォーム</title>
  </head>
  <body>
    <h1>おとどけ先フォーム</h1>
    <form>
      <!-- 1. ここに <fieldset> を書き、その中の最初に <legend>お届け先</legend> を書こう -->
      <p>
        <label for="name">お名前</label>
        <!-- 2. この input に autocomplete="name" を付けよう -->
        <input id="name" type="text">
      </p>
      <p>
        <label for="zip">ゆうびん番号</label>
        <!-- 3. この input に inputmode="numeric" と autocomplete="postal-code" を付けよう -->
        <input id="zip" type="text">
      </p>
      <!-- 4. ここに </fieldset> を書こう(2つの入力欄をグループで囲む) -->
      <button type="button">送信する</button>
    </form>
  </body>
</html>
`,
    },
  },
  checks: [
    {
      id: "fieldset-exists",
      type: "element",
      selector: "form > fieldset",
      message: "form の中の入力欄を fieldset で囲みましょう",
    },
    {
      id: "legend-exists",
      type: "element",
      selector: "fieldset > legend",
      message: "fieldset の中の最初に legend でグループの見出しを書きましょう",
    },
    { id: "legend-text", type: "text", selector: "fieldset > legend", equals: "お届け先" },
    {
      id: "inputs-in-fieldset",
      type: "element",
      selector: "fieldset input",
      count: 2,
      message: "2つの入力欄が fieldset の中に入るように囲みましょう",
    },
    {
      id: "name-autocomplete",
      type: "attribute",
      selector: "#name",
      name: "autocomplete",
      equals: "name",
      message: 'お名前の input に autocomplete="name" を付けましょう',
    },
    {
      id: "zip-inputmode",
      type: "attribute",
      selector: "#zip",
      name: "inputmode",
      equals: "numeric",
      message: 'ゆうびん番号の input に inputmode="numeric" を付けましょう',
    },
    {
      id: "zip-autocomplete",
      type: "attribute",
      selector: "#zip",
      name: "autocomplete",
      equals: "postal-code",
      message: 'ゆうびん番号の input に autocomplete="postal-code" を付けましょう',
    },
  ],
  hints: [
    "fieldset は関連する入力欄をグループで囲むタグ、legend はそのグループの見出しです。autocomplete と inputmode は input に付ける属性で、入力のしやすさを助けます",
    "<fieldset> は最初の <p> の前、</fieldset> は2つ目の </p> の後ろに書きます。legend は <fieldset> のすぐ次の行に <legend>お届け先</legend> と書きます",
    'お名前は <input id="name" type="text" autocomplete="name">、ゆうびん番号は <input id="zip" type="text" inputmode="numeric" autocomplete="postal-code"> と書けば完成です',
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>おとどけ先フォーム</title>
  </head>
  <body>
    <h1>おとどけ先フォーム</h1>
    <form>
      <fieldset>
        <legend>お届け先</legend>
        <p>
          <label for="name">お名前</label>
          <input id="name" type="text" autocomplete="name">
        </p>
        <p>
          <label for="zip">ゆうびん番号</label>
          <input id="zip" type="text" inputmode="numeric" autocomplete="postal-code">
        </p>
      </fieldset>
      <button type="button">送信する</button>
    </form>
  </body>
</html>
`,
  },
});
