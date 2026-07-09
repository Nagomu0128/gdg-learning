/**
 * E2E が期待する UI セレクタの一元管理(SPEC K §3)。
 *
 * 確定済み契約:
 * - validate-summary: B 所有の dev.validate.tsx が出す data-testid(CONTRACTS §8 で確定)
 *
 * 想定(E / D / F の実装と統合フェーズで突き合わせて調整する。docs/RUNBOOK.md「E2E が期待する UI」参照):
 * - ボタン・リンクはアクセシブルネーム(表示文言)でマッチする。文言は CONTRACTS §7 /
 *   SPEC E・F に書かれた UI 文言(「できた!」「クリア!」等)を正とする。
 */
export const TESTID = {
  /** 教材自己整合性検証ページのサマリ(確定契約) */
  validateSummary: "validate-summary",
} as const;

export const UI_TEXT = {
  /** 演習画面の提出ボタン(CONTRACTS §7「できた!」) */
  submitButton: /できた/,
  /** 合格時のクリア画面見出し(SPEC E §4「クリア!」) */
  clearHeading: /クリア/,
  /** クリア画面のストリーク表示(SPEC E §4。「N日連続」またはストリーク併記を想定) */
  streakText: /連続|ストリーク/,
  /** first_pass バッジのタイトル(SPEC F §2 の例示「はじめの一歩」) */
  firstPassBadgeTitle: /はじめの一歩/,
  /** 最終スライドから演習への導線リンク(D 実装。「演習」を含む文言を想定) */
  exerciseLink: /演習/,
  /** コースカード(html-basics のタイトル。content/courses/html-basics/course.ts が SSOT) */
  htmlCourseTitle: /HTML入門/,
} as const;
