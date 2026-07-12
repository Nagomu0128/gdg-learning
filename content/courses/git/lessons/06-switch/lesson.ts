import { defineLesson } from "@codesteps/lesson-kit";
import { GitSim } from "@codesteps/lesson-kit/git-sim";

// Git レッスンの雛形は git-01(docs/specs/content-common-2.md §5)。
// すでにあるブランチの間を git switch で移動する。currentBranch で「今どこにいるか」を検証。
export default defineLesson({
  slug: "git-06-switch",
  title: "ブランチを移動する",
  estMinutes: 5,
  runner: "dom",
  files: {
    "commands.sh": {
      initial: `# main・feature・hotfix の3つのブランチがあるリポジトリから始めます。
# ブランチの間を git switch で移動しましょう。

# 1. git switch feature で feature ブランチへ移動する

# 2. git switch hotfix で hotfix ブランチへ移動する
`,
    },
    "setup.sh": {
      initial: `# feature と hotfix のブランチを用意しておく(今いるのは main)
git init
echo "# アプリ" > README.md
git add README.md
git commit -m "初期化"
git branch feature
git branch hotfix
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
      id: "use-switch",
      file: "commands.sh",
      pattern: "^\\s*git\\s+switch\\s+[A-Za-z]",
      flags: "m",
      message: "git switch ブランチ名 で、別のブランチへ移動しましょう",
    },
    {
      type: "custom",
      id: "on-hotfix",
      message: "最後に hotfix ブランチにいる状態にしましょう",
      run: (ctx) => {
        const sim = GitSim.fromScripts(ctx.files["setup.sh"] ?? "", ctx.files["commands.sh"] ?? "");
        return !sim.hasErrors() && sim.currentBranch() === "hotfix";
      },
    },
  ],
  hints: [
    "git switch ブランチ名 で、そのブランチに「いる状態」を切り替えます(-c は付けません。すでにあるブランチだからです)",
    "今どこにいるかは git branch で確認できます。* が付いているのが現在地です",
    "2行をこの通りに書けば完成です:\ngit switch feature\ngit switch hotfix",
  ],
  solution: {
    "commands.sh": `# main・feature・hotfix の3つのブランチがあるリポジトリから始めます。
# ブランチの間を git switch で移動しましょう。

# 1. git switch feature で feature ブランチへ移動する
git switch feature

# 2. git switch hotfix で hotfix ブランチへ移動する
git switch hotfix
`,
  },
});
