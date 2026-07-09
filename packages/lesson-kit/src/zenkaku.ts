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

/** 全角英数字(ａ-ｚＡ-Ｚ０-９)なら対応する半角を返す。構文を模した領域の診断でのみ使う */
function fullwidthAlnumSuggestion(char: string): string | null {
  const code = char.codePointAt(0) ?? 0;
  if (
    (code >= 0xff10 && code <= 0xff19) || // ０-９
    (code >= 0xff21 && code <= 0xff3a) || // Ａ-Ｚ
    (code >= 0xff41 && code <= 0xff5a) // ａ-ｚ
  ) {
    return String.fromCharCode(code - 0xfee0);
  }
  return null;
}

function zenkakuSuggestionFor(char: string): string | null {
  return ZENKAKU_MAP.get(char) ?? fullwidthAlnumSuggestion(char);
}

/** ソース全体から全角記号(ZENKAKU_MAP 対象)を列挙する。エディタの警告波線用 */
export function findZenkakuChars(source: string): ZenkakuHit[] {
  const hits: ZenkakuHit[] = [];
  let line = 1;
  let lastNewline = -1;
  for (let i = 0; i < source.length; i++) {
    const ch = source[i] as string;
    if (ch === "\n") {
      line++;
      lastNewline = i;
      continue;
    }
    const suggestion = ZENKAKU_MAP.get(ch);
    if (suggestion !== undefined) {
      hits.push({ index: i, line, column: i - lastNewline, char: ch, suggestion });
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

type CharHit = { char: string; suggestion: string };

/** 行内の ZENKAKU_MAP 対象文字のうち、column(0/1 基準どちらでも可)に最も近いものを返す */
function nearestMapHit(text: string, column: number): CharHit | null {
  let best: (CharHit & { distance: number }) | null = null;
  let index = 0;
  for (const ch of text) {
    const suggestion = ZENKAKU_MAP.get(ch);
    if (suggestion !== undefined) {
      const distance = Math.abs(index - column);
      if (best === null || distance < best.distance) {
        best = { char: ch, suggestion, distance };
      }
    }
    index += ch.length;
  }
  return best;
}

function firstMapHit(text: string): CharHit | null {
  for (const ch of text) {
    const suggestion = ZENKAKU_MAP.get(ch);
    if (suggestion !== undefined) return { char: ch, suggestion };
  }
  return null;
}

/**
 * JS の parse エラー位置周辺に全角記号があれば診断を返す(§5.4)。
 * parse が通ったコードの文字列内全角は構造的に正当(この関数は parse 失敗時のみ呼ばれる)。
 * 走査順: エラー行(column に最も近い記号)→ 前後 1 行 → 全角英数字(エラー行優先)。
 */
export function diagnoseJsParseError(
  source: string,
  errorPos: { line: number; column: number },
): ZenkakuDiagnosis | null {
  const lines = source.split("\n");
  if (lines[errorPos.line - 1] === undefined) return null;
  // エラー行を優先で走査、なければ前後 1 行も見る(acorn はトークン開始位置を指すため)
  const candidates: { line: number; text: string }[] = [];
  for (const n of [errorPos.line, errorPos.line - 1, errorPos.line + 1]) {
    const text = lines[n - 1];
    if (text !== undefined) candidates.push({ line: n, text });
  }
  for (const { line, text } of candidates) {
    const hit = line === errorPos.line ? nearestMapHit(text, errorPos.column) : firstMapHit(text);
    if (hit) return { line, message: formatDiagnosis(line, hit.char, hit.suggestion) };
  }
  // 記号が無い場合のみ全角英数字(ｌｅｔ 等)を疑う
  for (const { line, text } of candidates) {
    for (const ch of text) {
      const suggestion = fullwidthAlnumSuggestion(ch);
      if (suggestion !== null) {
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
 * 診断はマッチした構文様の領域内の全角文字を指す(同一行の本文中の正当な全角を誤って指さない)。
 */
export function diagnoseMarkupZenkaku(source: string): ZenkakuDiagnosis | null {
  const lines = source.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const text = lines[i] as string;
    // 行内で最も早い位置のマッチを採用する
    let earliest: { index: number; matched: string } | null = null;
    for (const re of MARKUP_LIKE_PATTERNS) {
      const m = re.exec(text);
      if (m !== null && (earliest === null || m.index < earliest.index)) {
        earliest = { index: m.index, matched: m[0] };
      }
    }
    if (earliest === null) continue;
    for (const ch of earliest.matched) {
      const suggestion = zenkakuSuggestionFor(ch);
      if (suggestion !== null) {
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
