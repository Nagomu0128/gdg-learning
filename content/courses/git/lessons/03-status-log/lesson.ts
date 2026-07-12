import { defineLesson } from "@codesteps/lesson-kit";
import { GitSim } from "@codesteps/lesson-kit/git-sim";

// Git レッスンの雛形は git-01(docs/specs/content-common-2.md §5)。
// status / log は状態を変えない「確認」のコマンド。source check で使用を確認し、
// custom check で「状態が変わっていない(壊していない)」ことを保証する。
export default defineLesson({
  slug: "git-03-status-log",
  title: "状態と履歴を見る",
  estMinutes: 5,
  runner: "dom",
  files: {
    "commands.sh": {
      initial: `# コミットが2つあるリポジトリから始めます。
# 「いまの状態」と「これまでの履歴」を確認するコマンドを書きましょう。

# 1. git status で、作業ツリーの状態を見る

# 2. git log --oneline で、履歴を1行ずつ見る
`,
    },
    "setup.sh": {
      initial: `# コミットが2つある状態から始める
git init
echo "v1" > app.txt
git add app.txt
git commit -m "最初の実装"
echo "v2" >> app.txt
git add app.txt
git commit -m "機能を追加"
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
      id: "use-status",
      file: "commands.sh",
      pattern: "^\\s*git\\s+status\\s*$",
      flags: "m",
      message: "git status で、いまの状態を確認しましょう",
    },
    {
      type: "source",
      id: "use-log-oneline",
      file: "commands.sh",
      pattern: "git\\s+log\\s+--oneline",
      message: "git log --oneline で、履歴を1行ずつ表示しましょう",
    },
    {
      type: "custom",
      id: "history-intact",
      message: "status と log は状態を変えない確認コマンドです。エラーなく実行できるようにしましょう",
      run: (ctx) => {
        const sim = GitSim.fromScripts(ctx.files["setup.sh"] ?? "", ctx.files["commands.sh"] ?? "");
        return !sim.hasErrors() && sim.commitCount("HEAD") === 2 && sim.isClean();
      },
    },
  ],
  hints: [
    "どちらも「見るだけ」のコマンドです。ファイルや履歴は変わりません",
    "git status は今の状態、git log は過去の記録を表示します。--oneline を付けると1コミット1行で見やすくなります",
    "2行をこの通りに書けば完成です:\ngit status\ngit log --oneline",
  ],
  solution: {
    "commands.sh": `# コミットが2つあるリポジトリから始めます。
# 「いまの状態」と「これまでの履歴」を確認するコマンドを書きましょう。

# 1. git status で、作業ツリーの状態を見る
git status

# 2. git log --oneline で、履歴を1行ずつ見る
git log --oneline
`,
  },
});
