import { defineLesson } from "@codesteps/lesson-kit";
import { GitSim } from "@codesteps/lesson-kit/git-sim";

// Git レッスンの雛形は git-01(docs/specs/content-common-2.md §5)。
// setup.sh で初期状態をシードし、学習者は commands.sh にコマンドを書く。
// index.html / preview.js は git-01 からのコピー(変更不要)。
export default defineLesson({
  slug: "git-02-add-commit",
  title: "変更を記録する",
  estMinutes: 6,
  runner: "dom",
  files: {
    "commands.sh": {
      initial: `# すでに README.md を1回コミットしたリポジトリから始めます。
# 新しいファイルをつくって、add と commit で記録しましょう。

# 1. echo "牛乳を買う" > todo.txt でメモをつくる

# 2. git add todo.txt でステージに載せる

# 3. git commit -m "TODOを追加" で記録する
`,
    },
    "setup.sh": {
      initial: `# 最初のコミットが1つある状態から始める
git init
echo "# メモ帳アプリ" > README.md
git add README.md
git commit -m "最初のコミット"
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
      id: "use-add",
      file: "commands.sh",
      pattern: "^\\s*git\\s+add\\s+",
      flags: "m",
      message: "git add todo.txt で、つくったファイルをステージに載せましょう",
    },
    {
      type: "source",
      id: "use-commit",
      file: "commands.sh",
      pattern: "git\\s+commit\\s+-m",
      message: 'git commit -m "TODOを追加" で記録しましょう(メッセージは "" で囲みます)',
    },
    {
      type: "custom",
      id: "second-commit",
      message:
        "新しいファイルを add して commit し、コミットを2つ目まで増やしましょう(プレビューのエラー表示も確認)",
      run: (ctx) => {
        const sim = GitSim.fromScripts(ctx.files["setup.sh"] ?? "", ctx.files["commands.sh"] ?? "");
        return (
          !sim.hasErrors() &&
          sim.commitCount("HEAD") === 2 &&
          sim.fileContent("todo.txt") !== null &&
          sim.isClean()
        );
      },
    },
  ],
  hints: [
    "コメント(# の行)はそのままでOK。各コメントの下にコマンドを1つずつ書きます",
    'echo でファイルをつくる → git add でステージ → git commit -m "..." で記録、の順です',
    '3行をこの通りに書けば完成です:\necho "牛乳を買う" > todo.txt\ngit add todo.txt\ngit commit -m "TODOを追加"',
  ],
  solution: {
    "commands.sh": `# すでに README.md を1回コミットしたリポジトリから始めます。
# 新しいファイルをつくって、add と commit で記録しましょう。

# 1. echo "牛乳を買う" > todo.txt でメモをつくる
echo "牛乳を買う" > todo.txt

# 2. git add todo.txt でステージに載せる
git add todo.txt

# 3. git commit -m "TODOを追加" で記録する
git commit -m "TODOを追加"
`,
  },
});
