import { defineLesson } from "@codesteps/lesson-kit";
import { GitSim } from "@codesteps/lesson-kit/git-sim";

// Git レッスンの雛形は git-01(docs/specs/content-common-2.md §5)。
// diff は「まだ記録していない変更」を確認するコマンド。ステージ前後で見える差分が変わる。
export default defineLesson({
  slug: "git-04-diff",
  title: "変更を確認する",
  estMinutes: 6,
  runner: "dom",
  files: {
    "commands.sh": {
      initial: `# greeting.txt をコミット済みのリポジトリから始めます。
# ファイルを書き換えて、diff で「どこが変わったか」を確認しましょう。

# 1. echo "おはよう" > greeting.txt で中身を書き換える

# 2. git diff で、まだステージしていない変更を見る

# 3. git add greeting.txt でステージに載せる

# 4. git diff --staged で、ステージした変更を見る
`,
    },
    "setup.sh": {
      initial: `# greeting.txt が1回コミットされた状態から始める
git init
echo "こんにちは" > greeting.txt
git add greeting.txt
git commit -m "あいさつを追加"
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
      id: "use-diff",
      file: "commands.sh",
      pattern: "^\\s*git\\s+diff\\s*$",
      flags: "m",
      message: "git diff で、まだステージしていない変更を確認しましょう",
    },
    {
      type: "source",
      id: "use-diff-staged",
      file: "commands.sh",
      pattern: "git\\s+diff\\s+--staged",
      message: "git diff --staged で、ステージ済みの変更を確認しましょう",
    },
    {
      type: "custom",
      id: "changed-and-staged",
      message: "greeting.txt を書き換えて git add し、ステージに変更がある状態にしましょう",
      run: (ctx) => {
        const sim = GitSim.fromScripts(ctx.files["setup.sh"] ?? "", ctx.files["commands.sh"] ?? "");
        return !sim.hasErrors() && sim.stagedFiles().includes("greeting.txt");
      },
    },
  ],
  hints: [
    "diff は「変更を見る」コマンド。add する前と後で、見える差分が変わります",
    "add する前は git diff、add したあとは git diff --staged で確認します",
    'この通りに書けば完成です:\necho "おはよう" > greeting.txt\ngit diff\ngit add greeting.txt\ngit diff --staged',
  ],
  solution: {
    "commands.sh": `# greeting.txt をコミット済みのリポジトリから始めます。
# ファイルを書き換えて、diff で「どこが変わったか」を確認しましょう。

# 1. echo "おはよう" > greeting.txt で中身を書き換える
echo "おはよう" > greeting.txt

# 2. git diff で、まだステージしていない変更を見る
git diff

# 3. git add greeting.txt でステージに載せる
git add greeting.txt

# 4. git diff --staged で、ステージした変更を見る
git diff --staged
`,
  },
});
