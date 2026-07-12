import { defineLesson } from "@codesteps/lesson-kit";
import { GitSim } from "@codesteps/lesson-kit/git-sim";

// Git レッスンの雛形は git-01(docs/specs/content-common-2.md §5)。
// 早送り(fast-forward)マージ: main が動いていないので、feature の先端に main を進めるだけ。
// マージコミットはできない → isLinearHistory("main") が true のまま。
export default defineLesson({
  slug: "git-07-merge-ff",
  title: "マージ(早送り)",
  estMinutes: 7,
  runner: "dom",
  files: {
    "commands.sh": {
      initial: `# main は初期コミットのまま、feature だけが1つ先に進んでいます。
# 今いるのは main。feature を取り込みましょう。

# 1. git merge feature で feature の変更を main に取り込む
`,
    },
    "setup.sh": {
      initial: `# main は動かさず、feature を1コミット先に進めてから main に戻る
git init
echo "ベース" > app.txt
git add app.txt
git commit -m "ベース"
git switch -c feature
echo "新機能" > feature.txt
git add feature.txt
git commit -m "新機能を追加"
git switch main
`,
      editable: false,
      hidden: true,
    },
    "index.html": {
      initial: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>ターミナル</title>
    <style>
      html, body { height: 100%; margin: 0; }
      #terminal { height: 100%; }
    </style>
  </head>
  <body>
    <div id="terminal"></div>
    <script src="/vendor/git-sim.js"></script>
    <script src="preview.js"></script>
  </body>
</html>
`,
      editable: false,
      hidden: true,
    },
    "preview.js": {
      initial: `// commands.sh をターミナル風に再生する(vendor の GitSim)。
// __FILES__ はプレビュー合成時に注入される(判定時は無くてもよい)
var files = window.__FILES__ || {};
GitSim.renderPlayback(
  document.getElementById("terminal"),
  files["setup.sh"] || "",
  files["commands.sh"] || ""
);
`,
      editable: false,
      hidden: true,
    },
  },
  checks: [
    {
      type: "source",
      id: "use-merge",
      file: "commands.sh",
      pattern: "^\\s*git\\s+merge\\s+[A-Za-z]",
      flags: "m",
      message: "git merge feature で feature を取り込みましょう",
    },
    {
      type: "custom",
      id: "fast-forwarded",
      message: "feature を main に取り込み、履歴が1本のまま(早送り)になるようにしましょう",
      run: (ctx) => {
        const sim = GitSim.fromScripts(ctx.files["setup.sh"] ?? "", ctx.files["commands.sh"] ?? "");
        return (
          !sim.hasErrors() &&
          sim.isMerged("feature", "main") &&
          sim.isLinearHistory("main") &&
          sim.fileContent("feature.txt") !== null
        );
      },
    },
  ],
  hints: [
    "マージは「別のブランチの変更を、今いるブランチに取り込む」ことです",
    "今いる main は初期のまま動いていないので、main を feature の先端まで進めるだけで済みます。これを早送り(fast-forward)と呼びます",
    "1行書けば完成です:\ngit merge feature",
  ],
  solution: {
    "commands.sh": `# main は初期コミットのまま、feature だけが1つ先に進んでいます。
# 今いるのは main。feature を取り込みましょう。

# 1. git merge feature で feature の変更を main に取り込む
git merge feature
`,
  },
});
