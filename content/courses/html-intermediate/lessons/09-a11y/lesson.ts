import { defineLesson } from "@codesteps/lesson-kit";

// CURRICULUM-2 html-intermediate #9(穴埋め): やさしい HTML — img alt / label for / button・nav の aria-label(attribute exists/equals)
export default defineLesson({
  slug: "html-int-09-a11y",
  title: "やさしい HTML",
  estMinutes: 6,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>としょかんだより</title>
  </head>
  <body>
    <!-- この nav に aria-label="メインメニュー" を付けよう -->
    <nav>
      <a href="#">ホーム</a>
      <a href="#">お知らせ</a>
    </nav>
    <main>
      <!-- この img に alt で「何の画像か」を書こう -->
      <img src="logo.svg">
      <h1>としょかんだより</h1>
      <div class="notice">
        <p>今週の金曜日は休館日です。</p>
        <!-- このボタンに aria-label="お知らせを閉じる" を付けよう -->
        <button>×</button>
      </div>
      <form>
        <!-- この label に for="keyword" を付けて、入力欄とつなごう -->
        <label>本をさがす</label>
        <input id="keyword" type="text">
      </form>
    </main>
  </body>
</html>
`,
    },
  },
  checks: [
    { id: "nav-exists", type: "element", selector: "nav" },
    { id: "img-exists", type: "element", selector: "img" },
    {
      id: "nav-label",
      type: "attribute",
      selector: "nav",
      name: "aria-label",
      exists: true,
      message: 'nav に aria-label でメニューの名前を付けましょう(例: aria-label="メインメニュー")',
    },
    {
      id: "img-alt",
      type: "attribute",
      selector: "img",
      name: "alt",
      exists: true,
      message: "img に alt 属性で「何の画像か」のことばを書きましょう",
    },
    {
      id: "button-label",
      type: "attribute",
      selector: "button",
      name: "aria-label",
      exists: true,
      message: "「×」だけのボタンに、aria-label でことばの説明を付けましょう",
    },
    {
      id: "label-for",
      type: "attribute",
      selector: "label",
      name: "for",
      equals: "keyword",
      message: 'label に for="keyword" を付けて、入力欄の id とつなぎましょう',
    },
  ],
  hints: [
    "読み上げソフトのために、画像には alt、記号だけのボタンには aria-label で「ことばの説明」を付けます。どちらもタグに書き足す属性です",
    'nav には aria-label="メインメニュー"、img には alt="としょかんだよりのロゴ" のように書きます',
    'ボタンは <button aria-label="お知らせを閉じる">×</button>、label は <label for="keyword">本をさがす</label> にします(for の値は input の id と同じです)',
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>としょかんだより</title>
  </head>
  <body>
    <nav aria-label="メインメニュー">
      <a href="#">ホーム</a>
      <a href="#">お知らせ</a>
    </nav>
    <main>
      <img src="logo.svg" alt="としょかんだよりのロゴ">
      <h1>としょかんだより</h1>
      <div class="notice">
        <p>今週の金曜日は休館日です。</p>
        <button aria-label="お知らせを閉じる">×</button>
      </div>
      <form>
        <label for="keyword">本をさがす</label>
        <input id="keyword" type="text">
      </form>
    </main>
  </body>
</html>
`,
  },
});
