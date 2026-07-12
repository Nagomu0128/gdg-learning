import { defineLesson } from "@codesteps/lesson-kit";
import { GitSim } from "@codesteps/lesson-kit/git-sim";

// Git レッスンの雛形は git-01(docs/specs/content-common-2.md §5)。
// 総合レッスン: ブランチ作成 → コミット → マージ → push の一連の流れを1本で通す。
// 複数の述語の AND で「一巡できたか」を検証する。
export default defineLesson({
  slug: "git-14-team-flow",
  title: "総合: 開発フロー一巡",
  estMinutes: 10,
  runner: "dom",
  files: {
    "commands.sh": {
      initial: `# 分岐 → コミット → マージ → push を一巡させましょう。
# (main は初期コミット済み・origin/main へ送信済み)。手順:
# 1. git switch -c feature
# 2. echo "ログイン機能" > login.txt
# 3. git add login.txt
# 4. git commit -m "ログイン機能を実装"
# 5. git switch main
# 6. git merge feature
# 7. git push
`,
    },
    "setup.sh": {
      initial: `# main に初期コミット + リモート送信済み(origin/main あり)
git init
echo "# チームプロジェクト" > README.md
git add README.md
git commit -m "プロジェクト開始"
git push -u origin main
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
      id: "make-branch",
      file: "commands.sh",
      pattern: "git\\s+switch\\s+-c\\s+",
      message: "git switch -c feature でブランチを作りましょう",
    },
    {
      type: "source",
      id: "make-commit",
      file: "commands.sh",
      pattern: "git\\s+commit\\s+-m",
      message: 'git commit -m "..." で記録しましょう',
    },
    {
      type: "source",
      id: "do-merge",
      file: "commands.sh",
      pattern: "git\\s+merge\\s+[A-Za-z]",
      message: "git merge feature で取り込みましょう",
    },
    {
      type: "source",
      id: "do-push",
      file: "commands.sh",
      pattern: "git\\s+push\\b",
      message: "git push でリモートへ送りましょう",
    },
    {
      type: "custom",
      id: "flow-complete",
      message: "分岐 → コミット → マージ → push を一巡させましょう(main とリモートが同じ状態になればゴール)",
      run: (ctx) => {
        const sim = GitSim.fromScripts(ctx.files["setup.sh"] ?? "", ctx.files["commands.sh"] ?? "");
        const local = sim.log("main");
        const remote = sim.remoteLog("origin/main");
        return (
          !sim.hasErrors() &&
          sim.branchExists("feature") &&
          sim.isMerged("feature", "main") &&
          sim.fileContent("login.txt") !== null &&
          sim.isClean() &&
          local.length === remote.length &&
          local.every((message, i) => message === remote[i])
        );
      },
    },
  ],
  hints: [
    "総まとめです。ブランチ作成 → コミット → 本流に戻ってマージ → push の順に並べます",
    "git switch main で本流に戻ってから git merge feature を実行します(取り込む先にいることが大切)",
    'この通りに書けば完成です:\ngit switch -c feature\necho "ログイン機能" > login.txt\ngit add login.txt\ngit commit -m "ログイン機能を実装"\ngit switch main\ngit merge feature\ngit push',
  ],
  solution: {
    "commands.sh": `# 分岐 → コミット → マージ → push の一巡
git switch -c feature
echo "ログイン機能" > login.txt
git add login.txt
git commit -m "ログイン機能を実装"
git switch main
git merge feature
git push
`,
  },
});
