import { defineLesson } from "@codesteps/lesson-kit";
import { GitSim } from "@codesteps/lesson-kit/git-sim";

// Git レッスンの雛形は git-01(docs/specs/content-common-2.md §5)。
// rebase のコンフリクト解決: setup で「両側が同一ファイルを変更」した状態(§5.2)を作る。
// 解決フローは merge と少し違う: 編集 → git add → git rebase --continue。
// rebase は必ずエラー(コンフリクト)を出すため、custom check に !hasErrors() は入れない。
export default defineLesson({
  slug: "git-11-rebase-conflict",
  title: "rebase の衝突を解決",
  estMinutes: 8,
  runner: "dom",
  files: {
    "commands.sh": {
      initial: `# feature と main が同じ config.txt を別々に変更しています。
# rebase すると衝突します。解決してから --continue で続けましょう:
# 1. git rebase main(ここで衝突します)
# 2. echo "設定 = 本番と機能を両立" > config.txt(解決後の内容を書く)
# 3. git add config.txt(解決済みとして印をつける)
# 4. git rebase --continue(載せ替えを続行・完了する)
`,
    },
    "setup.sh": {
      initial: `# 共通の祖先を作ってから、feature と main で同じ config.txt を別々に変更する
git init
echo "設定 = 初期" > config.txt
git add config.txt
git commit -m "初期設定"
git switch -c feature
echo "設定 = 機能版" > config.txt
git add config.txt
git commit -m "機能に合わせて設定変更"
git switch main
echo "設定 = 本番版" > config.txt
git add config.txt
git commit -m "本番に合わせて設定変更"
git switch feature
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
      id: "start-rebase",
      file: "commands.sh",
      pattern: "^\\s*git\\s+rebase\\s+[A-Za-z]",
      flags: "m",
      message: "まず git rebase main で載せ替えを始めましょう(ここで衝突します)",
    },
    {
      type: "source",
      id: "continue-rebase",
      file: "commands.sh",
      pattern: "git\\s+rebase\\s+--continue",
      message: "解決したら git rebase --continue で載せ替えを続行しましょう",
    },
    {
      type: "custom",
      id: "rebase-resolved",
      message:
        "コンフリクトを解決して rebase を完了し、履歴が1本の線になるようにしましょう(印が残っていると未完了です)",
      run: (ctx) => {
        const sim = GitSim.fromScripts(ctx.files["setup.sh"] ?? "", ctx.files["commands.sh"] ?? "");
        return (
          sim.isClean() &&
          sim.isLinearHistory("feature") &&
          sim.isMerged("main", "feature") &&
          !sim.hasConflictMarkers("config.txt")
        );
      },
    },
  ],
  hints: [
    "rebase の途中で衝突しても、やることはマージのときと似ています。ファイルを直して add します",
    "違うのは最後の一手。commit ではなく git rebase --continue で「続けて」と伝えます",
    'この通りに書けば完成です:\ngit rebase main\necho "設定 = 本番と機能を両立" > config.txt\ngit add config.txt\ngit rebase --continue',
  ],
  solution: {
    "commands.sh": `# 衝突を解決して rebase を完了する
git rebase main
echo "設定 = 本番と機能を両立" > config.txt
git add config.txt
git rebase --continue
`,
  },
});
