import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "html-int-08-form-validation",
  title: "入力チェック属性",
  estMinutes: 6,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>会員登録</title>
  </head>
  <body>
    <h1>会員登録</h1>
    <form>
      <p>
        <label for="username">ニックネーム(8文字まで)</label>
        <!-- この input に required と maxlength="8" を付けよう -->
        <input id="username" type="text">
      </p>
      <p>
        <label for="email">メールアドレス</label>
        <!-- この input の type を email に変えて、required も付けよう -->
        <input id="email" type="text">
      </p>
      <p>
        <label for="zip">郵便番号(例: 123-4567)</label>
        <!-- この input に pattern="[0-9]{3}-[0-9]{4}" を付けよう -->
        <input id="zip" type="text">
      </p>
      <button>登録</button>
    </form>
  </body>
</html>
`,
    },
  },
  checks: [
    { id: "form-exists", type: "element", selector: "form" },
    {
      id: "username-required",
      type: "attribute",
      selector: "#username",
      name: "required",
      exists: true,
      message: "ニックネームの input に required(必須)を付けましょう",
    },
    {
      id: "username-maxlength",
      type: "attribute",
      selector: "#username",
      name: "maxlength",
      equals: "8",
      message: 'ニックネームの input に maxlength="8" を付けましょう',
    },
    {
      id: "email-type",
      type: "attribute",
      selector: "#email",
      name: "type",
      equals: "email",
      message: 'メールアドレスの input の type を "email" にしましょう',
    },
    {
      id: "email-required",
      type: "attribute",
      selector: "#email",
      name: "required",
      exists: true,
      message: "メールアドレスの input にも required を付けましょう",
    },
    {
      id: "zip-pattern",
      type: "attribute",
      selector: "#zip",
      name: "pattern",
      equals: "[0-9]{3}-[0-9]{4}",
      message: '郵便番号の input に pattern="[0-9]{3}-[0-9]{4}" を付けましょう(記号はすべて半角)',
    },
  ],
  hints: [
    "入力チェックはぜんぶ input の属性で書けます。required(必須)は値なしで付けるだけ、maxlength と pattern は = で値を書きます",
    'メールアドレス欄は type を "text" から "email" に書きかえて、required を追加します: <input id="email" type="email" required>',
    '郵便番号はこう書きます: <input id="zip" type="text" pattern="[0-9]{3}-[0-9]{4}">。記号([ ] { } -)はすべて半角です',
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>会員登録</title>
  </head>
  <body>
    <h1>会員登録</h1>
    <form>
      <p>
        <label for="username">ニックネーム(8文字まで)</label>
        <input id="username" type="text" required maxlength="8">
      </p>
      <p>
        <label for="email">メールアドレス</label>
        <input id="email" type="email" required>
      </p>
      <p>
        <label for="zip">郵便番号(例: 123-4567)</label>
        <input id="zip" type="text" pattern="[0-9]{3}-[0-9]{4}">
      </p>
      <button>登録</button>
    </form>
  </body>
</html>
`,
  },
});
