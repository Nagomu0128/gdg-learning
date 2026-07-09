// 全角 lint の純粋ロジック(DesignDoc §5.4 / SPEC E §2)。
// CodeMirror 非依存に分離し、node の vitest でテストする。CM6 への接続は zenkaku-extension.ts。
import { findZenkakuChars, findZenkakuSpaces } from "@codesteps/lesson-kit";

const ZENKAKU_SPACE = "　";

export type ZenkakuLintDiagnostic = {
  from: number;
  to: number;
  severity: "warning";
  message: string;
};

/** 警告文言(ブロックしない予防装置 — §5.4。suggestion は lesson-kit の対応表から) */
export function zenkakuWarningMessage(char: string, suggestion: string): string {
  if (char === ZENKAKU_SPACE) return "全角スペースが入っています。半角スペースに直しましょう";
  return `全角の「${char}」が入っています。半角の「${suggestion}」に直しましょう`;
}

/** findZenkakuChars の結果を lint 診断(warning)に変換する */
export function zenkakuDiagnostics(source: string): ZenkakuLintDiagnostic[] {
  return findZenkakuChars(source).map((hit) => ({
    from: hit.index,
    to: hit.index + hit.char.length,
    severity: "warning" as const,
    message: zenkakuWarningMessage(hit.char, hit.suggestion),
  }));
}

/** 全角スペースの常時背景ハイライト用の範囲(§5.4 の予防装置①) */
export function zenkakuSpaceRanges(source: string): { from: number; to: number }[] {
  return findZenkakuSpaces(source);
}
