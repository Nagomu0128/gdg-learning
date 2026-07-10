import { defineLesson } from "@codesteps/lesson-kit";

const indexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>図書室からのお知らせ</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>図書室からのお知らせ</h1>
    <p>新刊コーナーに10冊追加しました。</p>
    <p class="note">重要: 金曜日は蔵書点検のためお休みです。</p>
    <p>予約した本は入口カウンターで受け取れます。</p>
  </body>
</html>
`;

const initialCss = `body {
  font-family: sans-serif;
}

p {
  color: dimgray;
}

/* ここに .note のルールを書いて、重要なお知らせの文字色だけを crimson にしよう */
`;

const solutionCss = `body {
  font-family: sans-serif;
}

p {
  color: dimgray;
}

.note {
  color: crimson;
}
`;

export default defineLesson({
  slug: "css-int-02-specificity",
  title: "詳細度とカスケード",
  estMinutes: 5,
  files: {
    "index.html": { initial: indexHtml, editable: false },
    "style.css": { initial: initialCss },
  },
  checks: [
    {
      id: "note-rule",
      type: "source",
      file: "style.css",
      pattern: "\\.note\\s*\\{[^}]*color\\s*:",
      message: ".note のルールを新しく作って、その中で color を指定しましょう",
    },
    {
      id: "note-color",
      type: "style",
      selector: ".note",
      property: "color",
      equals: "crimson",
      message: 'class="note" の段落の文字色を crimson にしましょう',
    },
    {
      id: "p-rule-kept",
      type: "source",
      file: "style.css",
      pattern: "p\\s*\\{[^}]*color\\s*:\\s*dimgray",
      message: "p のルール(color: dimgray)は消さずに残しましょう。ふつうのお知らせの色です",
    },
    {
      id: "p-color-kept",
      type: "style",
      selector: "p",
      property: "color",
      equals: "dimgray",
      message: "class の付いていない段落の文字色は dimgray のままにしましょう",
    },
  ],
  hints: [
    "同じ要素に2つのルールが当たったときは、セレクタの「詳細度」が高いほうが勝ちます。クラスセレクタ(.note)は要素セレクタ(p)より詳細度が高いです",
    "p のルールはそのまま残して、.note { ... } というルールを新しく追加します。その中で color を指定しましょう",
    "p のルールの下に .note { color: crimson; } を追加すれば完成です",
  ],
  solution: {
    "style.css": solutionCss,
  },
});
