import { defineLesson } from "@codesteps/lesson-kit";
import { GitSim } from "@codesteps/lesson-kit/git-sim";

// 総合ハンズオン(git-sim)。Issue → ブランチ → コミット → (PR相当) → レビュー → マージ → 片付け を一巡する。
// 雛形は content/courses/git/lessons/01-init/ からコピー。conflict は使わず、健全系(FF マージ)に絞る。
// custom check は複数述語で最終状態(main に戻り・Conventional Commit が取り込まれ・feature 削除済み・clean)を検証する。
export default defineLesson({
  slug: "team-08-team-flow",
  title: "総合: 開発フロー一巡",
  estMinutes: 10,
  runner: "dom",
  files: {
    "commands.sh": {
      initial: `# ブランチ → コミット → マージ → 片付け の一巡。各手順にコマンドを書こう。

# 1. feature ブランチを作って切り替える

# 2. README に1行追記(echo の >>)

# 3. add して Conventional Commits でコミット

# 4. main に戻る

# 5. feature をマージ

# 6. feature を片付ける(git branch -d)
`,
    },
    "setup.sh": {
      initial: `# 開始状態: main に1コミット
git init
echo "# チームアプリ" > README.md
git add README.md
git commit -m "chore: リポジトリ初期化"
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
      id: "create-branch",
      file: "commands.sh",
      pattern: "^\\s*git\\s+(switch\\s+-c|checkout\\s+-b)\\s+\\S+",
      flags: "m",
      message: "git switch -c で feature ブランチを作って切り替えましょう",
    },
    {
      type: "source",
      id: "conventional-commit",
      file: "commands.sh",
      pattern: 'git\\s+commit\\s+-m\\s+"(feat|fix|docs|refactor|test|chore|style)',
      flags: "m",
      message: 'git commit -m "feat: ..." のように Conventional Commits で書きましょう',
    },
    {
      type: "source",
      id: "merge",
      file: "commands.sh",
      pattern: "^\\s*git\\s+merge\\s+\\S+",
      flags: "m",
      message: "main に切り替えてから git merge で feature を取り込みましょう",
    },
    {
      type: "custom",
      id: "flow-complete",
      message:
        "一巡を完成させましょう。最後は main に戻り、コミットがマージされ、feature ブランチを片付けた、きれいな状態にします",
      run: (ctx) => {
        const sim = GitSim.fromScripts(ctx.files["setup.sh"] ?? "", ctx.files["commands.sh"] ?? "");
        const conventional = /^(feat|fix|docs|refactor|test|chore|style)(\(.+\))?:\s/;
        return (
          !sim.hasErrors() &&
          sim.currentBranch() === "main" &&
          sim.commitCount("main") >= 2 &&
          sim.log("main").some((m) => conventional.test(m)) &&
          sim.branches().length === 1 &&
          sim.isClean()
        );
      },
    },
  ],
  hints: [
    "feature を作る → コミット → main に戻る → マージ → 片付け、の順に進めます",
    "コミットは feat: など Conventional Commits で。片付けは git branch -d です",
    `この順に書けば完成します:
git switch -c feature/login
echo "- ログイン機能" >> README.md
git add README.md
git commit -m "feat: ログイン機能を追加"
git switch main
git merge feature/login
git branch -d feature/login`,
  ],
  solution: {
    "commands.sh": `git switch -c feature/login
echo "- ログイン機能" >> README.md
git add README.md
git commit -m "feat: ログイン機能を追加"
git switch main
git merge feature/login
git branch -d feature/login
`,
  },
});
