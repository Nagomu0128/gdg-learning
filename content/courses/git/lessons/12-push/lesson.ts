import { defineLesson } from "@codesteps/lesson-kit";
import { GitSim } from "@codesteps/lesson-kit/git-sim";

// Git レッスンの雛形は git-01(docs/specs/content-common-2.md §5)。
// push: ローカルのブランチをリモート(origin)へ送る。-u で「追跡関係」を結ぶと
// 以降は git push だけで送れる。remoteBranchExists でリモートに実体ができたか検証。
export default defineLesson({
  slug: "git-12-push",
  title: "リモートへ送る",
  estMinutes: 6,
  runner: "dom",
  files: {
    "commands.sh": {
      initial: `# feature ブランチにコミットまで済んでいます(まだリモートには送っていません)。
# feature ブランチを origin(リモート)へ送りましょう。

# 1. git push -u origin feature で feature をリモートへ送る(-u で追跡関係も結ぶ)
`,
    },
    "setup.sh": {
      initial: `# feature ブランチに1コミット。リモートはまだ空
git init
echo "# アプリ" > README.md
git add README.md
git commit -m "初期化"
git switch -c feature
echo "新機能" > feature.txt
git add feature.txt
git commit -m "新機能を追加"
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
      id: "use-push-u",
      file: "commands.sh",
      pattern: "git\\s+push\\s+-u\\s+origin",
      message: "git push -u origin feature でリモートへ送りましょう(-u を忘れずに)",
    },
    {
      type: "custom",
      id: "pushed-to-remote",
      message: "feature ブランチを origin へ送り、リモートに feature ができるようにしましょう",
      run: (ctx) => {
        const sim = GitSim.fromScripts(ctx.files["setup.sh"] ?? "", ctx.files["commands.sh"] ?? "");
        return !sim.hasErrors() && sim.remoteBranchExists("origin/feature");
      },
    },
  ],
  hints: [
    "push は「送る」。手元(ローカル)のコミットを、みんなが見られるリモート(origin)へアップロードします",
    "初めてそのブランチを送るときは -u を付けます。ローカルの feature と origin/feature を「追跡関係」で結び、次からは git push だけで送れるようになります",
    "1行書けば完成です:\ngit push -u origin feature",
  ],
  solution: {
    "commands.sh": `# feature ブランチにコミットまで済んでいます(まだリモートには送っていません)。
# feature ブランチを origin(リモート)へ送りましょう。

# 1. git push -u origin feature で feature をリモートへ送る(-u で追跡関係も結ぶ)
git push -u origin feature
`,
  },
});
