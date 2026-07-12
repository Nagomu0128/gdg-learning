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
      initial: `# main に初期コミットがあり、リモート(origin/main)にも送信済みの状態です。
# 「機能を1つ作って本流に取り込み、リモートへ送る」までを一巡させましょう。

# 1. git switch -c feature で feature ブランチを作って移動

# 2. echo "ログイン機能" > login.txt でファイルをつくる

# 3. git add login.txt でステージに載せる

# 4. git commit -m "ログイン機能を実装" で記録する

# 5. git switch main で本流に戻る

# 6. git merge feature で feature を main に取り込む

# 7. git push で main をリモートへ送る
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
      message: "git switch -c feature で feature ブランチを作りましょう",
    },
    {
      type: "source",
      id: "make-commit",
      file: "commands.sh",
      pattern: "git\\s+commit\\s+-m",
      message: 'git commit -m "..." で作業を記録しましょう',
    },
    {
      type: "source",
      id: "do-merge",
      file: "commands.sh",
      pattern: "git\\s+merge\\s+[A-Za-z]",
      message: "git merge feature で feature を main に取り込みましょう",
    },
    {
      type: "source",
      id: "do-push",
      file: "commands.sh",
      pattern: "git\\s+push\\b",
      message: "git push で main をリモートへ送りましょう",
    },
    {
      type: "custom",
      id: "flow-complete",
      message:
        "feature を作ってコミットし、main に取り込んで push するまでを一巡させましょう(main とリモートが同じ状態になればゴール)",
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
    "これまでのレッスンの総まとめです。ブランチを作る → コミット → 本流に戻ってマージ → push、の順に並べます",
    "feature で作業したら git switch main で本流に戻り、そこで git merge feature を実行します。取り込む先にいることが大切です",
    'この通りに書けば完成です:\ngit switch -c feature\necho "ログイン機能" > login.txt\ngit add login.txt\ngit commit -m "ログイン機能を実装"\ngit switch main\ngit merge feature\ngit push',
  ],
  solution: {
    "commands.sh": `# main に初期コミットがあり、リモート(origin/main)にも送信済みの状態です。
# 「機能を1つ作って本流に取り込み、リモートへ送る」までを一巡させましょう。

# 1. git switch -c feature で feature ブランチを作って移動
git switch -c feature

# 2. echo "ログイン機能" > login.txt でファイルをつくる
echo "ログイン機能" > login.txt

# 3. git add login.txt でステージに載せる
git add login.txt

# 4. git commit -m "ログイン機能を実装" で記録する
git commit -m "ログイン機能を実装"

# 5. git switch main で本流に戻る
git switch main

# 6. git merge feature で feature を main に取り込む
git merge feature

# 7. git push で main をリモートへ送る
git push
`,
  },
});
