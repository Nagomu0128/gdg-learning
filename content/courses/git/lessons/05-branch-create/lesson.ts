import { defineLesson } from "@codesteps/lesson-kit";
import { GitSim } from "@codesteps/lesson-kit/git-sim";

// Git レッスンの雛形は git-01(docs/specs/content-common-2.md §5)。
// ブランチ作成の2つの書き方を学ぶ: git branch(作るだけ)と git switch -c(作って移動)。
export default defineLesson({
  slug: "git-05-branch-create",
  title: "ブランチを作る",
  estMinutes: 6,
  runner: "dom",
  files: {
    "commands.sh": {
      initial: `# 最初のコミットが1つあるリポジトリから始めます。
# ブランチを作る2つの書き方を試しましょう。

# 1. git branch feature で feature ブランチを作る(今いる場所は変わりません)

# 2. git switch -c release で release ブランチを作って、そこへ移動する
`,
    },
    "setup.sh": {
      initial: `# ブランチを作れるように、コミットを1つ用意する
git init
echo "# プロジェクト" > README.md
git add README.md
git commit -m "初期化"
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
      id: "use-branch",
      file: "commands.sh",
      pattern: "^\\s*git\\s+branch\\s+[A-Za-z]",
      flags: "m",
      message: "git branch feature で feature ブランチを作りましょう",
    },
    {
      type: "source",
      id: "use-switch-c",
      file: "commands.sh",
      pattern: "git\\s+switch\\s+-c\\s+",
      message: "git switch -c release で release ブランチを作って移動しましょう",
    },
    {
      type: "custom",
      id: "branches-created",
      message: "feature と release の2つのブランチを作りましょう",
      run: (ctx) => {
        const sim = GitSim.fromScripts(ctx.files["setup.sh"] ?? "", ctx.files["commands.sh"] ?? "");
        return !sim.hasErrors() && sim.branchExists("feature") && sim.branchExists("release");
      },
    },
  ],
  hints: [
    "ブランチは「作業の枝分かれ」。main を残したまま、別の枝で作業できます",
    "git branch 名前 は作るだけ(移動しない)、git switch -c 名前 は作ってすぐ移動します",
    "2行をこの通りに書けば完成です:\ngit branch feature\ngit switch -c release",
  ],
  solution: {
    "commands.sh": `# 最初のコミットが1つあるリポジトリから始めます。
# ブランチを作る2つの書き方を試しましょう。

# 1. git branch feature で feature ブランチを作る(今いる場所は変わりません)
git branch feature

# 2. git switch -c release で release ブランチを作って、そこへ移動する
git switch -c release
`,
  },
});
