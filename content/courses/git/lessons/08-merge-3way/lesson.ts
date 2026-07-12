import { defineLesson } from "@codesteps/lesson-kit";
import { GitSim } from "@codesteps/lesson-kit/git-sim";

// Git レッスンの雛形は git-01(docs/specs/content-common-2.md §5)。
// 3方向(3-way)マージ: main と feature が両方進んでいるので、合流点として
// マージコミット(親2つ)ができる → isLinearHistory("main") が false になる。
export default defineLesson({
  slug: "git-08-merge-3way",
  title: "マージ(3方向)",
  estMinutes: 7,
  runner: "dom",
  files: {
    "commands.sh": {
      initial: `# main も feature も、枝分かれのあとで別々に1コミットずつ進んでいます。
# 今いるのは main。feature を取り込みましょう(別々のファイルなので衝突しません)。

# 1. git merge feature で feature の変更を main に取り込む
`,
    },
    "setup.sh": {
      initial: `# feature は feature.txt を、main は docs.txt を追加(別ファイルなので衝突しない)
git init
echo "ベース" > app.txt
git add app.txt
git commit -m "ベース"
git switch -c feature
echo "機能A" > feature.txt
git add feature.txt
git commit -m "機能Aを追加"
git switch main
echo "説明" > docs.txt
git add docs.txt
git commit -m "ドキュメントを追加"
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
      id: "merge-commit-made",
      message: "両方の変更を1つに合流させ、マージコミット(親が2つ)を作りましょう",
      run: (ctx) => {
        const sim = GitSim.fromScripts(ctx.files["setup.sh"] ?? "", ctx.files["commands.sh"] ?? "");
        return (
          !sim.hasErrors() &&
          sim.isMerged("feature", "main") &&
          !sim.isLinearHistory("main") &&
          sim.fileContent("feature.txt") !== null &&
          sim.fileContent("docs.txt") !== null
        );
      },
    },
  ],
  hints: [
    "今回は main も feature も別々に進んでいます。片方を「進めるだけ」では済みません",
    "両方の変更を 1 つにまとめる「合流点」のコミット(マージコミット)ができます。親が 2 つあるのが特徴です",
    "1行書けば完成です:\ngit merge feature\n別々のファイルへの変更なので、衝突せず自動で合流します",
  ],
  solution: {
    "commands.sh": `# main も feature も、枝分かれのあとで別々に1コミットずつ進んでいます。
# 今いるのは main。feature を取り込みましょう(別々のファイルなので衝突しません)。

# 1. git merge feature で feature の変更を main に取り込む
git merge feature
`,
  },
});
