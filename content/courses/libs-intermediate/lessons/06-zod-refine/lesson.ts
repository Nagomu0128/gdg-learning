import { defineLesson } from "@codesteps/lesson-kit";

export default defineLesson({
  slug: "lib-int-06-zod-refine",
  title: "zodのカスタム検証",
  estMinutes: 6,
  runner: "dom",
  files: {
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>zodのカスタム検証</title>
  </head>
  <body>
    <h1>独自ルールで検証する</h1>
    <p>100(正の数): <span id="ok"></span></p>
    <p>-5(負の数): <span id="ng"></span></p>
    <script src="/vendor/zod.js"></script>
    <script src="main.js"></script>
  </body>
</html>
`,
      editable: false,
    },
    "main.js": {
      initial: `// zod の .refine で「型」だけでなく「独自のルール」も検証する
// ここでは「正の数(0 より大きい数)」だけを合格にしたい

// (1) z.number() に .refine を足して、n > 0 のときだけ合格にしよう
const priceSchema = z.number();

function check(value) {
  const result = priceSchema.safeParse(value);
  return result.success ? "OK" : "エラー";
}

const okText = check(100);
const ngText = check(-5);

document.getElementById("ok").textContent = okText;
document.getElementById("ng").textContent = ngText;
console.log("100:", okText);
console.log("-5:", ngText);
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-refine",
      file: "main.js",
      pattern: "\\.refine\\(",
      message: ".refine を足して、正の数だけを合格にするルールを加えましょう",
    },
    {
      type: "text",
      id: "show-ok",
      selector: "#ok",
      equals: "OK",
      message: "正の数 100 は OK と表示されるようにしましょう",
    },
    {
      type: "text",
      id: "show-ng",
      selector: "#ng",
      equals: "エラー",
      message: "負の数 -5 は正の数ではないので エラー と表示されるようにしましょう",
    },
    {
      type: "console",
      id: "log-both",
      lines: ["100: OK", "-5: エラー"],
      message: "コンソールに「100: OK」と「-5: エラー」を出力しましょう",
    },
  ],
  hints: [
    ".refine(条件の関数, メッセージ) を足すと、型は合っていても条件を満たさない値をエラーにできます",
    "条件の関数は「合格なら true」を返します。正の数の条件は (n) => n > 0 です",
    'priceSchema = z.number().refine((n) => n > 0, "正の数を入力してください"); にすれば完成です',
  ],
  solution: {
    "main.js": `const priceSchema = z.number().refine((n) => n > 0, "正の数を入力してください");

function check(value) {
  const result = priceSchema.safeParse(value);
  return result.success ? "OK" : "エラー";
}

const okText = check(100);
const ngText = check(-5);

document.getElementById("ok").textContent = okText;
document.getElementById("ng").textContent = ngText;
console.log("100:", okText);
console.log("-5:", ngText);
`,
  },
});
