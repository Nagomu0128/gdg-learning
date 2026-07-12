import { defineLesson } from "@codesteps/lesson-kit";

// 作文系レッスン(runner worker + .md)。レビューコメントの型(must-fix / nit の区別 + 受け方)を
// source check で判定する。見出しは「##」始まりの行だけがマッチし、ガイドのコメント行(行頭 <)は不一致。
// 本文チェック(id: body)は「行頭が < でも # でも空白でもない行」= 学習者が書いた地の文を要求する。
export default defineLesson({
  slug: "team-05-code-review",
  title: "コードレビューの作法",
  estMinutes: 6,
  runner: "worker",
  files: {
    "review.md": {
      initial: `<!-- コードレビューのコメントを書く練習です。 -->
<!-- レビューでは must-fix(必ず直す指摘)と nit(好みレベルの軽い指摘)を区別します。 -->
<!-- 下の3つの見出しを「##」で作り、それぞれ中身を書こう。 -->
<!--   ## must-fix … 必ず直してほしい指摘(具体的に・敬意をもって) -->
<!--   ## nit      … 直さなくてもよい軽い提案 -->
<!--   ## 受け方   … 指摘をもらったときの返し方 -->

`,
    },
  },
  checks: [
    {
      type: "source",
      id: "must-fix",
      file: "review.md",
      pattern: "^##\\s*must-?fix",
      flags: "im",
      message: "## must-fix の見出しを作り、必ず直してほしい指摘を具体的に書きましょう",
    },
    {
      type: "source",
      id: "nit",
      file: "review.md",
      pattern: "^##\\s*nit",
      flags: "im",
      message: "## nit の見出しを作り、直さなくてもよい軽い提案を書きましょう",
    },
    {
      type: "source",
      id: "receiving",
      file: "review.md",
      pattern: "^##\\s*受け",
      flags: "m",
      message: "## 受け方 の見出しを作り、指摘をもらったときの返し方を書きましょう",
    },
    {
      type: "source",
      id: "body",
      file: "review.md",
      pattern: "^[^<#\\s].+",
      flags: "m",
      message: "見出しの下に、指摘や返し方の中身を1行以上書きましょう(見出しだけでは不十分です)",
    },
  ],
  hints: [
    "レビューは相手を否定する場ではありません。「ここをこうするともっと良い」と、具体的かつ敬意をもって伝えます",
    "## must-fix(必ず直す)/ ## nit(好みの軽い提案)/ ## 受け方(もらったときの返し方)の3つを書きます",
    "たとえば must-fix に「パスワードをハッシュ化してから保存すると安全です」、nit に「変数名を users にすると読みやすいです(好みで)」のように書きます",
  ],
  solution: {
    "review.md": `<!-- コードレビューのコメントを書く練習です。 -->
<!-- レビューでは must-fix(必ず直す指摘)と nit(好みレベルの軽い指摘)を区別します。 -->
<!-- 下の3つの見出しを「##」で作り、それぞれ中身を書こう。 -->
<!--   ## must-fix … 必ず直してほしい指摘(具体的に・敬意をもって) -->
<!--   ## nit      … 直さなくてもよい軽い提案 -->
<!--   ## 受け方   … 指摘をもらったときの返し方 -->

## must-fix
パスワードがそのまま保存されています。ハッシュ化してから保存すると安全になります。

## nit
変数名 data はやや広いので、users にするともっと読みやすいと思います(好みで大丈夫です)。

## 受け方
指摘には感謝を伝え、直す・直さないの理由を一言そえて返信します。
`,
  },
});
