import { defineLesson } from "@codesteps/lesson-kit";

// CURRICULUM-2 html-adv #1(写経): details / summary で JS なしの開閉 UI
export default defineLesson({
  slug: "html-adv-01-details",
  title: "開閉できる UI",
  estMinutes: 4,
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <title>よくある質問</title>
  </head>
  <body>
    <h1>よくある質問</h1>
    <!-- ここに details と summary で、クリックすると答えが開く質問コーナーを書こう -->
  </body>
</html>
`,
    },
  },
  checks: [
    { type: "element", id: "details-exists", selector: "details" },
    {
      type: "element",
      id: "summary-in-details",
      selector: "details > summary",
      message: "details タグの中の最初に summary タグを書きましょう",
    },
    { type: "text", id: "summary-text", selector: "summary", equals: "配送について" },
    {
      type: "element",
      id: "answer-in-details",
      selector: "details p",
      message: "details の中の summary の下に、p タグで答えの文を書きましょう",
    },
    {
      type: "custom",
      id: "click-toggles-details",
      message:
        "summary をクリックすると details が開閉するようにしましょう(summary は details の中に入れます)",
      run: async (ctx) => {
        const details = ctx.document.querySelector("details");
        if (details === null) {
          return false;
        }
        const before = details.open;
        ctx.fire("summary", "click");
        await ctx.wait(50);
        return details.open !== before;
      },
    },
  ],
  hints: [
    "開閉できる UI は details タグで作ります。details の中の最初に summary タグを書くと、そこがクリックできる見出しになります",
    "<details> の中に <summary>配送について</summary> と、答えの <p> を書きます",
    "<details><summary>配送について</summary><p>ご注文から3日以内にお届けします。</p></details> と書けば完成です",
  ],
  solution: {
    "index.html": `<!doctype html>
<html>
  <head>
    <title>よくある質問</title>
  </head>
  <body>
    <h1>よくある質問</h1>
    <details>
      <summary>配送について</summary>
      <p>ご注文から3日以内にお届けします。</p>
    </details>
  </body>
</html>
`,
  },
});
