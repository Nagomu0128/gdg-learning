// text check の全角診断(J-judge-hardening)。§5.4 と同じ症状駆動の原則。
// zenkaku.ts から分離している理由: zenkaku.ts は markup-lint 経由で tsconfig.node の
// スクリプトからも型検査されるため、DOM 型に触れる types.ts を import できない。
// 本モジュールは判定ランタイム / エディタ(ブラウザ側)専用。

import { textMatches } from "./normalize";
import type { TextCheck } from "./types";
import { ZENKAKU_MAP } from "./zenkaku";

const ZENKAKU_SPACE = "　";

/** ZENKAKU_MAP + 全角英数字ブロック(FF01-FF5E)を半角に写す。対象外の文字は null */
function halfWidthCharFor(ch: string): string | null {
  const mapped = ZENKAKU_MAP.get(ch);
  if (mapped !== undefined) return mapped;
  const code = ch.codePointAt(0) ?? 0;
  if (code >= 0xff01 && code <= 0xff5e) return String.fromCharCode(code - 0xfee0);
  return null;
}

/** 全角英数字・記号・全角スペースを半角へ変換する(それ以外の文字は保持) */
export function toHalfWidth(s: string): string {
  let out = "";
  for (const ch of s) {
    out += halfWidthCharFor(ch) ?? ch;
  }
  return out;
}

function zenkakuMessageFor(ch: string, half: string): string {
  if (ch === ZENKAKU_SPACE) {
    return "全角スペースが入っています。半角スペースに直しましょう";
  }
  return `「${ch}」が全角で入力されています。半角の「${half}」に直しましょう`;
}

/**
 * text check 失敗時の全角診断(症状駆動 — §5.4 と同じ原則)。
 * 「actual を半角化すると check が合格する」ときだけ発火するため偽陽性がない
 * (期待値側が全角を要求するケースでは半角化が合格を生まないので発火しない)。
 * 例: 期待「3個です」に対し「３個です」→「「３」が全角で入力されています。…」
 *
 * 指摘する 1 文字は「実際に合否を反転させる文字」を選ぶ。actual の先頭全角を機械的に指すと、
 * 例えば contains:"3" / actual="Ｈｅｌｌｏ３" で「Ｈ」を指して(直しても合格しない)誤誘導になる。
 */
export function diagnoseTextZenkaku(actual: string, check: TextCheck): string | null {
  const converted = toHalfWidth(actual);
  if (converted === actual) return null; // 全角なし
  if (!textMatches(converted, check)) return null; // 半角化しても不合格 = 全角が原因ではない

  const chars = [...actual];
  const candidates = chars
    .map((ch, index) => ({ ch, index, half: halfWidthCharFor(ch) }))
    .filter((c): c is { ch: string; index: number; half: string } => c.half !== null);

  // 1) その 1 文字だけ半角化すると合格に転じる文字を最優先(単独で効く文字)
  for (const c of candidates) {
    const one = chars.slice();
    one[c.index] = c.half;
    if (textMatches(one.join(""), check)) return zenkakuMessageFor(c.ch, c.half);
  }
  // 2) 単独では足りない(複数箇所が全角)場合: その文字だけ全角のまま残すと不合格になる = 効いている文字
  for (const c of candidates) {
    const kept = chars.map((ch, index) => (index === c.index ? ch : (halfWidthCharFor(ch) ?? ch)));
    if (!textMatches(kept.join(""), check)) return zenkakuMessageFor(c.ch, c.half);
  }
  // 3) 保険: 先頭の全角文字(guard 上、合否に効く文字は必ず存在するが念のため)
  const first = candidates[0];
  return first ? zenkakuMessageFor(first.ch, first.half) : null;
}
