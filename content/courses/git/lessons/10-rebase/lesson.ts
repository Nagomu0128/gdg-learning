import { defineLesson } from "@codesteps/lesson-kit";
import { GitSim } from "@codesteps/lesson-kit/git-sim";

// Git レッスンの雛形は git-01(docs/specs/content-common-2.md §5)。
// rebase: feature のコミットを、main の先端に「載せ替える」。マージコミットを作らず
// 履歴が1本の線になる → isLinearHistory("feature") が true。main は feature の祖先になる。
export default defineLesson({
  slug: "git-10-rebase",
  title: "履歴を載せ替える",
  estMinutes: 7,
  runner: "dom",
  files: {
    "commands.sh": {
      initial: `# feature で作業している間に、main も緊急修正で1つ進みました。
# 今いるのは feature。feature を main の先端に載せ替えましょう。

# 1. git rebase main で、feature のコミットを main の上に載せ替える
`,
    },
    "setup.sh": {
      initial: `# main は hotfix.txt を、feature は f1.txt を追加。最後に feature にいる状態にする
git init
echo "ベース" > base.txt
git add base.txt
git commit -m "ベース"
git switch -c feature
echo "機能1" > f1.txt
git add f1.txt
git commit -m "機能1を実装"
git switch main
echo "緊急修正" > hotfix.txt
git add hotfix.txt
git commit -m "本番の緊急修正"
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
      id: "use-rebase",
      file: "commands.sh",
      pattern: "^\\s*git\\s+rebase\\s+[A-Za-z]",
      flags: "m",
      message: "git rebase main で、feature を main の上に載せ替えましょう",
    },
    {
      type: "custom",
      id: "rebased-linear",
      message: "feature を main の先端に載せ替え、履歴が1本の線(マージコミットなし)になるようにしましょう",
      run: (ctx) => {
        const sim = GitSim.fromScripts(ctx.files["setup.sh"] ?? "", ctx.files["commands.sh"] ?? "");
        return (
          !sim.hasErrors() &&
          sim.isLinearHistory("feature") &&
          sim.isMerged("main", "feature") &&
          sim.fileContent("hotfix.txt") !== null &&
          sim.fileContent("f1.txt") !== null
        );
      },
    },
  ],
  hints: [
    "rebase は「自分のコミットを、別のブランチの先端に置き直す」ことです。マージと違い、合流点のコミットを作りません",
    "今いる feature のコミットを、いったん外して main の先端に積み直すイメージ。結果、履歴が 1 本の線になります",
    "1行書けば完成です:\ngit rebase main\n(別々のファイルへの変更なので、衝突せず載せ替わります)",
  ],
  solution: {
    "commands.sh": `# feature で作業している間に、main も緊急修正で1つ進みました。
# 今いるのは feature。feature を main の先端に載せ替えましょう。

# 1. git rebase main で、feature のコミットを main の上に載せ替える
git rebase main
`,
  },
});
