import { defineLesson } from "@codesteps/lesson-kit";
import { GitSim } from "@codesteps/lesson-kit/git-sim";

// Git レッスンの雛形は git-01(docs/specs/content-common-2.md §5)。
// コンフリクト解決レッスン: setup で「両側が同一ファイルを変更」した状態(§5.2)を作る。
// merge は必ずエラー(コンフリクト)を出すため、custom check に !hasErrors() は入れない。
export default defineLesson({
  slug: "git-09-merge-conflict",
  title: "コンフリクトを解決する",
  estMinutes: 8,
  runner: "dom",
  files: {
    "commands.sh": {
      initial: `# main と feature が同じ greeting.txt を別々に変更しています。
# merge すると衝突します。自分で解決して完了させましょう:
# 1. git merge feature(ここで衝突が起きます)
# 2. echo "こんにちは、そしてこんばんは" > greeting.txt(解決後の内容を書く)
# 3. git add greeting.txt(解決済みとして印をつける)
# 4. git commit -m "あいさつを統合"(マージを完了する)
`,
    },
    "setup.sh": {
      initial: `# 共通の祖先を作ってから、feature と main で同じ行を別々に変更する
git init
echo "おはよう" > greeting.txt
git add greeting.txt
git commit -m "あいさつ"
git switch -c feature
echo "こんばんは" > greeting.txt
git add greeting.txt
git commit -m "夜のあいさつに変更"
git switch main
echo "こんにちは" > greeting.txt
git add greeting.txt
git commit -m "昼のあいさつに変更"
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
      id: "start-merge",
      file: "commands.sh",
      pattern: "^\\s*git\\s+merge\\s+[A-Za-z]",
      flags: "m",
      message: "まず git merge feature でマージを始めます(ここで衝突します)",
    },
    {
      type: "source",
      id: "finalize",
      file: "commands.sh",
      pattern: "git\\s+commit",
      message: "解決後 git commit でマージを完了しましょう",
    },
    {
      type: "custom",
      id: "conflict-resolved",
      message: "マーカーを消してコンフリクトを解決し、マージを完了しましょう(<<<<<<< が残ると未完了)",
      run: (ctx) => {
        const sim = GitSim.fromScripts(ctx.files["setup.sh"] ?? "", ctx.files["commands.sh"] ?? "");
        return sim.isMerged("feature", "main") && !sim.hasConflictMarkers("greeting.txt") && sim.isClean();
      },
    },
  ],
  hints: [
    "merge のエラーは失敗ではなく「自動で決められないので決めてください」の合図です",
    "コンフリクトした所には <<<<<<< ======= >>>>>>> の印が入ります。印ごと正しい内容に書き直します",
    'この通りに書けば完成です:\ngit merge feature\necho "こんにちは、そしてこんばんは" > greeting.txt\ngit add greeting.txt\ngit commit -m "あいさつを統合"',
  ],
  solution: {
    "commands.sh": `# 衝突を解決してマージを完了する
git merge feature
echo "こんにちは、そしてこんばんは" > greeting.txt
git add greeting.txt
git commit -m "あいさつを統合"
`,
  },
});
