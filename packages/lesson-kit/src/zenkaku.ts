// 全角診断(DesignDoc §5.4)— 症状駆動。無条件プリチェックはしない(偽陽性の非対称コスト)。
// 検出ロジックと文言は判定・エディタの両方から共有される [ポカヨケ]。

export type ZenkakuHit = {
  index: number;
  line: number;
  column: number;
  char: string;
  suggestion: string;
};

export type ZenkakuDiagnosis = { line: number; message: string };

/** 全角記号 → 対応する半角の対応表(§5.4 の対象文字 + 頻出ミス) */
export const ZENKAKU_MAP: ReadonlyMap<string, string> = new Map([
  ["＜", "<"],
  ["＞", ">"],
  ["（", "("],
  ["）", ")"],
  ["＂", '"'],
  ["”", '"'],
  ["“", '"'],
  ["＇", "'"],
  ["’", "'"],
  ["‘", "'"],
  ["＝", "="],
  ["；", ";"],
  ["：", ":"],
  ["｛", "{"],
  ["｝", "}"],
  ["［", "["],
  ["］", "]"],
  ["＋", "+"],
  ["－", "-"],
  ["＊", "*"],
  ["／", "/"],
  ["％", "%"],
  ["！", "!"],
  ["？", "?"],
  ["＆", "&"],
  ["｜", "|"],
  ["．", "."],
  ["，", ","],
  ["　", " "],
]);

const ZENKAKU_SPACE = "　";

function lineColOf(source: string, index: number): { line: number; column: number } {
  let line = 1;
  let last = -1;
  for (let i = 0; i < index; i++) {
    if (source[i] === "\n") {
      line++;
      last = i;
    }
  }
  return { line, column: index - last };
}

/** ソース全体から全角記号(ZENKAKU_MAP 対象)を列挙する。エディタの警告波線用 */
export function findZenkakuChars(source: string): ZenkakuHit[] {
  const hits: ZenkakuHit[] = [];
  for (let i = 0; i < source.length; i++) {
    const ch = source[i] as string;
    const suggestion = ZENKAKU_MAP.get(ch);
    if (suggestion !== undefined) {
      const { line, column } = lineColOf(source, i);
      hits.push({ index: i, line, column, char: ch, suggestion });
    }
  }
  return hits;
}

/** 全角スペースの範囲列挙。エディタの常時背景ハイライト用(ブロックしない — §5.4) */
export function findZenkakuSpaces(source: string): { from: number; to: number }[] {
  const ranges: { from: number; to: number }[] = [];
  let start = -1;
  for (let i = 0; i <= source.length; i++) {
    if (source[i] === ZENKAKU_SPACE) {
      if (start === -1) start = i;
    } else if (start !== -1) {
      ranges.push({ from: start, to: i });
      start = -1;
    }
  }
  return ranges;
}

function formatDiagnosis(line: number, char: string, suggestion: string): string {
  const shown = char === ZENKAKU_SPACE ? "全角スペース" : `全角の「${char}」`;
  const fix = suggestion === " " ? "半角スペース" : `半角の「${suggestion}」`;
  return `${line}行目に${shown}が入っています。${fix}に直しましょう`;
}

/**
 * JS の parse エラー位置周辺に全角記号があれば診断を返す(§5.4)。
 * parse が通ったコードの文字列内全角は構造的に正当(この関数は parse 失敗時のみ呼ばれる)。
 */
export function diagnoseJsParseError(
  source: string,
  errorPos: { line: number; column: number },
): ZenkakuDiagnosis | null {
  const lines = source.split("\n");
  const lineText = lines[errorPos.line - 1];
  if (lineText === undefined) return null;
  // エラー行を優先で走査、なければ前後1行も見る(acorn はトークン開始位置を指すため)
  const candidates: { line: number; text: string }[] = [
    { line: errorPos.line, text: lineText },
    ...(lines[errorPos.line - 2] !== undefined
      ? [{ line: errorPos.line - 1, text: lines[errorPos.line - 2] as string }]
      : []),
    ...(lines[errorPos.line] !== undefined ? [{ line: errorPos.line + 1, text: lines[errorPos.line] as string }] : []),
  ];
  for (const { line, text } of candidates) {
    for (const ch of text) {
      const suggestion = ZENKAKU_MAP.get(ch);
      if (suggestion !== undefined) {
        return { line, message: formatDiagnosis(line, ch, suggestion) };
      }
    }
  }
  return null;
}

// タグ・宣言の構文を模した全角列(＜ｈ１＞ / ｃｏｌｏｒ： 等)の検出パターン。
// 本文テキスト中の正当な全角(「（例）」等)を誤検出しないよう、構文形のみに限定する(§5.4)。
const MARKUP_LIKE_PATTERNS: RegExp[] = [
  /＜[／/]?[a-zA-Zａ-ｚＡ-Ｚ０-９0-9]+[＞>]?/u, // 全角の < で始まるタグ様の列
  /<[／]?[ａ-ｚＡ-Ｚ０-９]+>/u, // 半角<>内に全角英数字のタグ名
  /[a-zA-Z-ａ-ｚ－]+[：][^\n]*[；;]/u, // CSS 宣言様(全角コロン)
  /[a-zA-Z-ａ-ｚ－]+:[^\n]*；/u, // CSS 宣言様(全角セミコロン)
  /＝[＂”'"]/u, // 属性代入様(全角イコール)
  /=[＂”]/u, // 属性値の全角クオート
];

/**
 * HTML / CSS ソースからタグ・宣言構文を模した全角列を検出する。
 * element / attribute / style check の失敗時にのみ呼ぶこと(§5.4)。
 */
export function diagnoseMarkupZenkaku(source: string): ZenkakuDiagnosis | null {
  const lines = source.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const text = lines[i] as string;
    if (!MARKUP_LIKE_PATTERNS.some((re) => re.test(text))) continue;
    for (const ch of text) {
      const suggestion = ZENKAKU_MAP.get(ch);
      if (suggestion !== undefined) {
        return { line: i + 1, message: formatDiagnosis(i + 1, ch, suggestion) };
      }
    }
  }
  return null;
}

export function generalSyntaxErrorMessage(line: number): string {
  return `${line}行目に文法エラーがあります。タグや記号の書き方を見直してみましょう`;
}

export { formatDiagnosis as formatZenkakuDiagnosis };
