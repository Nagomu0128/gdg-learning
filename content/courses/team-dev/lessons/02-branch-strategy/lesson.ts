import { defineLesson } from "@codesteps/lesson-kit";
import { GitSim } from "@codesteps/lesson-kit/git-sim";

// ハンズオン(git-sim)レッスン。雛形は content/courses/git/lessons/01-init/ からコピー:
// - commands.sh(editable): 学習者が書くコマンド
// - setup.sh(hidden): 初期状態のシード(main に動くコードが1コミット済み)
// - index.html / preview.js(hidden): vendor の GitSim でターミナル再生(git-01 と同一)
// 判定は custom check が実際の git 状態を検証する(手つかずでは feature ブランチが無く不合格)。
export default defineLesson({
  slug: "team-02-branch-strategy",
  title: "ブランチ戦略",
  estMinutes: 8,
  runner: "dom",
  files: {
    "commands.sh": {
      initial: `# GitHub Flow: main はさわらず、feature ブランチを切って作業します。
# (# の行はコメント。消さなくてOK。各手順の下にコマンドを1つずつ書こう)

# 1. main から feature ブランチを作って切り替える(作り方はスライド参照)


# 2. app.js を小さく書きかえる(例: echo で1行、上書き)


# 3. 変更をステージする


# 4. コミットして記録する
`,
    },
    "setup.sh": {
      initial: `# 開始状態: main に1コミット(動くコード)
git init
echo "console.log('todo app');" > app.js
git add app.js
git commit -m "feat: アプリの土台"
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
      message: "git switch -c ブランチ名 で、新しい feature ブランチを作って切り替えましょう",
    },
    {
      type: "source",
      id: "commit",
      file: "commands.sh",
      pattern: "^\\s*git\\s+commit\\s+-m",
      flags: "m",
      message: 'git commit -m "メッセージ" で、変更を記録しましょう',
    },
    {
      type: "custom",
      id: "branch-work-clean",
      message:
        "feature ブランチを作り、そこにコミットを1つ足しましょう(main はさわらない)。最後にコミットまで済ませて、きれいな状態にします",
      run: (ctx) => {
        const sim = GitSim.fromScripts(ctx.files["setup.sh"] ?? "", ctx.files["commands.sh"] ?? "");
        const others = sim.branches().filter((b) => b !== "main");
        const feature = others[0];
        return (
          !sim.hasErrors() &&
          others.length === 1 &&
          feature !== undefined &&
          sim.commitCount("main") === 1 &&
          sim.commitCount(feature) === 2 &&
          sim.isMerged("main", feature) &&
          sim.isClean()
        );
      },
    },
  ],
  hints: [
    "main を直接さわらないのが GitHub Flow のコツです。まず作業用の feature ブランチに移りましょう",
    'git switch -c feature/greeting でブランチを作って移り、echo "..." > app.js で書きかえ、git add と git commit で記録します',
    `この4行で完成します:
git switch -c feature/greeting
echo "console.log('hello team');" > app.js
git add app.js
git commit -m "feat: あいさつを追加"`,
  ],
  solution: {
    "commands.sh": `git switch -c feature/greeting
echo "console.log('hello team');" > app.js
git add app.js
git commit -m "feat: あいさつを追加"
`,
  },
});
