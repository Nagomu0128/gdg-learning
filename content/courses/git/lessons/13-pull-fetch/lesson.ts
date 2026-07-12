import { defineLesson } from "@codesteps/lesson-kit";
import { GitSim } from "@codesteps/lesson-kit/git-sim";

// Git レッスンの雛形は git-01(docs/specs/content-common-2.md §5)。
// リモート先行の状態は「push → reset --hard」のイディオムで作る(§5.2)。
// fetch は追跡参照を更新するだけ、pull は取得して取り込む(ここでは fast-forward)。
export default defineLesson({
  slug: "git-13-pull-fetch",
  title: "リモートと同期する",
  estMinutes: 7,
  runner: "dom",
  files: {
    "commands.sh": {
      initial: `# リモート(origin/main)が、手元より1コミット先に進んでいます。
# リモートの更新を取り込んで、手元を追いつかせましょう。

# 1. git fetch で、リモートに何が来ているかを取得する(まだ取り込まない)

# 2. git pull origin main で、取得して手元に取り込む
`,
    },
    "setup.sh": {
      initial: `# 2コミットを push してから、手元だけ1つ巻き戻す = リモートが先行した状態
git init
echo "1行目" > notes.txt
git add notes.txt
git commit -m "メモを作成"
echo "2行目" >> notes.txt
git add notes.txt
git commit -m "メモを追記"
git push -u origin main
git reset --hard HEAD~1
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
      id: "use-fetch",
      file: "commands.sh",
      pattern: "^\\s*git\\s+fetch\\b",
      flags: "m",
      message: "git fetch で、リモートの更新を取得しましょう",
    },
    {
      type: "source",
      id: "use-pull",
      file: "commands.sh",
      pattern: "git\\s+pull\\b",
      message: "git pull で、リモートの更新を手元に取り込みましょう",
    },
    {
      type: "custom",
      id: "synced-with-remote",
      message: "リモートの更新を取り込み、手元 main の履歴が origin/main と一致するようにしましょう",
      run: (ctx) => {
        const sim = GitSim.fromScripts(ctx.files["setup.sh"] ?? "", ctx.files["commands.sh"] ?? "");
        const local = sim.log("main");
        const remote = sim.remoteLog("origin/main");
        return (
          !sim.hasErrors() &&
          sim.commitCount("main") === 2 &&
          local.length === remote.length &&
          local.every((message, i) => message === remote[i])
        );
      },
    },
  ],
  hints: [
    "fetch は「取ってくるだけ(まだ手元には反映しない)」、pull は「取ってきて手元に取り込む」。まず様子を見て、それから取り込みます",
    "リモートは main を指定します。git pull origin main で、origin の main を取り込みます",
    "2行をこの通りに書けば完成です:\ngit fetch\ngit pull origin main",
  ],
  solution: {
    "commands.sh": `# リモート(origin/main)が、手元より1コミット先に進んでいます。
# リモートの更新を取り込んで、手元を追いつかせましょう。

# 1. git fetch で、リモートに何が来ているかを取得する(まだ取り込まない)
git fetch

# 2. git pull origin main で、取得して手元に取り込む
git pull origin main
`,
  },
});
