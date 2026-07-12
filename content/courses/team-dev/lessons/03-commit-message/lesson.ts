import { defineLesson } from "@codesteps/lesson-kit";

// 作文系レッスン(runner worker + .txt)。source check で「規約に沿った1行か」を判定する。
// コミットメッセージの type は英語 prefix(feat/fix/...)、要約は日本語という現実的な運用に合わせる。
// テンプレは type 行が無いので手つかずでは不合格。1行書くと合格する。
export default defineLesson({
  slug: "team-03-commit-message",
  title: "良いコミットメッセージ",
  estMinutes: 5,
  runner: "worker",
  files: {
    "message.txt": {
      initial: `# 良いコミットメッセージを1行、書いてみよう。
# 形式は Conventional Commits:  <type>: <日本語の要約>
# type は英語(feat / fix / docs / refactor / test / chore など)。一覧はスライドにあります。
# ↓ この下の行に、実際のコミットメッセージを1行で書こう(# の行は消さなくてOK)

`,
    },
  },
  checks: [
    {
      type: "source",
      id: "conventional-prefix",
      file: "message.txt",
      pattern: "^(feat|fix|docs|refactor|test|chore|style)(\\(.+\\))?:\\s?.+",
      flags: "m",
      message:
        "1行目を Conventional Commits の形にしましょう。feat: のように <type>: で始めます(type は英語)",
    },
    {
      type: "source",
      id: "japanese-summary",
      file: "message.txt",
      pattern: "^(feat|fix|docs|refactor|test|chore|style)(\\(.+\\))?:\\s*.*[ぁ-んァ-ヶ一-龠]",
      flags: "m",
      message: "type: のあとに、何をしたかを日本語の要約で書きましょう(例: feat: ログイン画面を追加)",
    },
  ],
  hints: [
    "コミットメッセージは「何をしたか」が一目で分かるのが大事です。先頭に種類を表す type を付けます",
    "形は <type>: <日本語の要約>。type は feat(機能追加)/ fix(バグ修正)/ docs(ドキュメント)などの英語です",
    "たとえば feat: ログインフォームに入力チェックを追加 のように、1行で書けば完成です",
  ],
  solution: {
    "message.txt": `# 良いコミットメッセージを1行、書いてみよう。
# 形式は Conventional Commits:  <type>: <日本語の要約>
# type は英語(feat / fix / docs / refactor / test / chore など)。一覧はスライドにあります。
# ↓ この下の行に、実際のコミットメッセージを1行で書こう(# の行は消さなくてOK)
feat: ログインフォームに入力チェックを追加
`,
  },
});
