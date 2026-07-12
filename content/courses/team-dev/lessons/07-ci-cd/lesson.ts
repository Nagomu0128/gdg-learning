import { defineLesson } from "@codesteps/lesson-kit";

// 作文系(用語うめ)レッスン(runner worker + .md)。CI/CD の用語を穴うめし、source check で判定する。
// テンプレのコメントには答えの語(テスト / デプロイ / main の位置)を含めないので手つかずでは不合格。
// Q3・Q4 は「ラベル行の右側」を見る anchored パターンなので、コメント中の main には反応しない。
export default defineLesson({
  slug: "team-07-ci-cd",
  title: "CI/CDの基本",
  estMinutes: 5,
  runner: "worker",
  files: {
    "notes.md": {
      initial: `# CI/CD ふりかえりノート

# スライドで学んだ言葉を、下の「=」の右に書こう(# はコメント。消さなくてOK)。

# Q1. CI は、push のたびに何を自動で走らせる?(ヒント: プログラムが正しいか調べるもの)
CI =

# Q2. CD は、通過したコードを自動で何する?(ヒント: 利用者のところへ配る)
CD =

# Q3. 取り込み(マージ)の前に自動チェックを必ず通して、こわれた状態を入れないよう守るブランチは?
守るブランチ =

# Q4. なぜ main を守ると、チームは安心して開発できる?(自分の言葉で1行)
理由 =
`,
    },
  },
  checks: [
    {
      type: "source",
      id: "ci-test",
      file: "notes.md",
      pattern: "テスト",
      message: "Q1の答えは「(自動)テスト」です。CI は push のたびにテストを自動で走らせます",
    },
    {
      type: "source",
      id: "cd-deploy",
      file: "notes.md",
      pattern: "(デプロイ|リリース)",
      message: "Q2の答えは「(自動)デプロイ」です。CD は通ったコードを自動で届けます",
    },
    {
      type: "source",
      id: "protect-main",
      file: "notes.md",
      pattern: "^守るブランチ[ \\t]*=[ \\t]*.*main",
      flags: "m",
      message: "Q3の答えは「main」です。守るブランチ = の右に main と書きましょう",
    },
    {
      type: "source",
      id: "reason",
      file: "notes.md",
      pattern: "^理由[ \\t]*=[ \\t]*\\S",
      flags: "m",
      message: "Q4は、なぜ main を守ると安心なのかを、自分の言葉で1行書きましょう",
    },
  ],
  hints: [
    "CI/CD は、テストやデプロイといった作業を「人の手」ではなく「自動」で行う仕組みです",
    "CI は push のたびに自動テスト、CD は通ったコードを自動でデプロイ。必ず通してから取り込むことで main を守ります",
    "CI = 自動テスト / CD = 自動デプロイ / 守るブランチ = main のように書けば OK です",
  ],
  solution: {
    "notes.md": `# CI/CD ふりかえりノート

# スライドで学んだ言葉を、下の「=」の右に書こう(# はコメント。消さなくてOK)。

# Q1. CI は、push のたびに何を自動で走らせる?(ヒント: プログラムが正しいか調べるもの)
CI = 自動テスト

# Q2. CD は、通過したコードを自動で何する?(ヒント: 利用者のところへ配る)
CD = 自動デプロイ

# Q3. 取り込み(マージ)の前に自動チェックを必ず通して、こわれた状態を入れないよう守るブランチは?
守るブランチ = main

# Q4. なぜ main を守ると、チームは安心して開発できる?(自分の言葉で1行)
理由 = こわれたコードがみんなに広がるのを、取り込む前に止められるから
`,
  },
});
