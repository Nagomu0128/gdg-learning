// HTML 構造リンター(DesignDoc §5.4 の思想を提出前ブロックへ拡張)。
// ブラウザは壊れた HTML を自動修復するため、`<h1>hello</h1` のような不完全マークアップでも
// DOM 検査の check には合格してしまう。提出判定の前段で「構造が壊れているケースだけ」をブロックする。
//
// 設計原則: 偽陽性ゼロ側に倒す(§5.4 の非対称コスト)。WHATWG のトークン化挙動に合わせ、
// 省略可能な終了タグ・引用符なし属性値・boolean 属性・テキスト中の `<` `>` `&`・コメント内の
// タグ様文字列など、合法な書き方は絶対に咎めない。
// 判定バンドル(esbuild IIFE)に同梱されるため依存ゼロの純粋 TS(zod / acorn 禁止)。

import {
  findZenkakuIn,
  isWs,
  type MarkupDiag,
  makeLineLookup,
  type ZenkakuFinding,
  zenkakuSuggestionFor,
} from "./markup-lint-shared";
import { formatZenkakuDiagnosis } from "./zenkaku";

// scripts(tsconfig.node)からの deep import 用ファサード: このモジュール 1 つで HTML / CSS 両リンターに届くようにする
export { KNOWN_CSS_PROPERTIES, lintCss, suggestCssProperty } from "./markup-lint-css";
export type { MarkupDiag } from "./markup-lint-shared";

/** 終了タグ不要の void 要素(WHATWG) */
const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);

/** 中身を RAWTEXT / RCDATA として素通しする要素(対応する終了タグまでタグ解釈しない) */
const RAWTEXT_ELEMENTS = new Set(["script", "style", "title", "textarea"]);

/** 終了タグを省略できる要素(WHATWG)。EOF・祖先の閉じタグで自動クローズし、エラーにしない */
const OMISSIBLE_END_TAGS = new Set([
  "html",
  "head",
  "body",
  "li",
  "dt",
  "dd",
  "p",
  "rt",
  "rp",
  "optgroup",
  "option",
  "colgroup",
  "caption",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "td",
  "th",
]);

/** 開始タグが現れると開いている <p> を自動クローズするブロック要素(WHATWG 13.1.2.4) */
const P_AUTO_CLOSERS = new Set([
  "address",
  "article",
  "aside",
  "blockquote",
  "details",
  "div",
  "dl",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "hr",
  "main",
  "menu",
  "nav",
  "ol",
  "p",
  "pre",
  "section",
  "table",
  "ul",
]);

/** スタック最上段 top が、新しく来た開始タグ incoming によって自動クローズされるか */
function autoClosesTop(top: string, incoming: string): boolean {
  switch (top) {
    case "li":
      return incoming === "li";
    case "dt":
    case "dd":
      return incoming === "dt" || incoming === "dd";
    case "p":
      return P_AUTO_CLOSERS.has(incoming);
    case "td":
    case "th":
      return incoming === "td" || incoming === "th" || incoming === "tr";
    case "tr":
      return incoming === "tr";
    case "option":
      return incoming === "option" || incoming === "optgroup";
    default:
      return false;
  }
}

function isAsciiLetter(ch: string | undefined): boolean {
  if (ch === undefined) return false;
  return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z");
}

/** タグ名トークンから構造処理用の正規名を得る(全角混入時は半角へ写像して回復) */
function cleanTagName(raw: string): string {
  let mapped = "";
  for (const ch of raw) {
    mapped += zenkakuSuggestionFor(ch, true) ?? ch;
  }
  const m = /^[a-zA-Z][a-zA-Z0-9-]*/.exec(mapped);
  return m === null ? "" : m[0].toLowerCase();
}

/**
 * タグ名トークンに含まれる不正な最初の文字(全角写像後)。合法なら null。
 * `<a,>` `</a,>` のようなゴミ文字はブラウザ上「名前の一部」または「無視される属性」として
 * 静かに回復されてしまうため、ガードレールとしては明示的にブロックする(ADR #18)。
 */
function firstInvalidNameChar(raw: string): string | null {
  let mapped = "";
  for (const ch of raw) {
    mapped += zenkakuSuggestionFor(ch, true) ?? ch;
  }
  const m = /^[a-zA-Z][a-zA-Z0-9-]*/.exec(mapped);
  const matched = m === null ? 0 : m[0].length;
  if (matched >= mapped.length) return null;
  return mapped[matched] ?? null;
}

type OpenElement = { name: string; line: number; pos: number };
type PendingDiag = MarkupDiag & { pos: number };

/**
 * HTML の構造エラー(ブロック用)。位置順。空配列 = OK。
 * 検出するのは「壊れている」ケースのみ: タグの `>` 抜け・属性引用符の閉じ忘れ・
 * 閉じ忘れ要素・対応しない終了タグ・交差ネスト・void 要素の終了タグ・閉じないコメント・タグ内全角。
 */
export function lintHtml(source: string): MarkupDiag[] {
  const diags: PendingDiag[] = [];
  const lineAt = makeLineLookup(source);
  const stack: OpenElement[] = [];
  const n = source.length;

  const report = (pos: number, message: string): void => {
    diags.push({ pos, line: lineAt(pos), message });
  };
  const reportZenkaku = (pos: number, finding: ZenkakuFinding): void => {
    const line = lineAt(pos);
    diags.push({ pos, line, message: formatZenkakuDiagnosis(line, finding.char, finding.suggestion) });
  };

  /** 壊れた終了タグの静かな回復: 対応する開始タグがあれば黙って外す(連鎖エラー防止) */
  const silentClose = (name: string): void => {
    if (name === "") return;
    for (let k = stack.length - 1; k >= 0; k--) {
      if ((stack[k] as OpenElement).name === name) {
        stack.splice(k, 1);
        return;
      }
    }
  };

  /** RAWTEXT 要素の終了タグ(`</name` + 空白/`>`/`/`/EOF)の開始位置を探す。無ければ -1 */
  const findRawtextEnd = (name: string, from: number): number => {
    let k = from;
    while (k < n) {
      const idx = source.indexOf("</", k);
      if (idx === -1) return -1;
      const candidate = source.slice(idx + 2, idx + 2 + name.length).toLowerCase();
      const after = source[idx + 2 + name.length];
      if (candidate === name && (after === undefined || isWs(after) || after === ">" || after === "/")) {
        return idx;
      }
      k = idx + 2;
    }
    return -1;
  };

  /** コメント / doctype / その他の `<!...>` を消費する。閉じないコメントのみエラー */
  const consumeMarkupDeclaration = (lt: number): number => {
    if (source.startsWith("<!--", lt)) {
      const bodyStart = lt + 4;
      // WHATWG: `<!-->` と `<!--->` は(パースエラーだが)閉じたコメント — ブロックしない
      if (source.startsWith(">", bodyStart)) return bodyStart + 1;
      if (source.startsWith("->", bodyStart)) return bodyStart + 2;
      const normal = source.indexOf("-->", bodyStart);
      const bang = source.indexOf("--!>", bodyStart);
      if (normal === -1 && bang === -1) {
        report(lt, `${lineAt(lt)}行目の <!-- が --> で閉じられていません`);
        return n;
      }
      if (normal !== -1 && (bang === -1 || normal < bang)) return normal + 3;
      return bang + 4;
    }
    // doctype(大小無視)・CDATA などの `<!...>` は `>` まで読み飛ばす(エラーにしない)
    const end = source.indexOf(">", lt + 2);
    return end === -1 ? n : end + 1;
  };

  /** 完了した開始タグをスタックへ反映する(自動クローズ → push)。RAWTEXT かどうかを返す */
  const applyStartTag = (name: string, lt: number): boolean => {
    if (name === "") return false;
    while (stack.length > 0 && autoClosesTop((stack[stack.length - 1] as OpenElement).name, name)) {
      stack.pop();
    }
    if (VOID_ELEMENTS.has(name)) return false;
    stack.push({ name, line: lineAt(lt), pos: lt });
    return RAWTEXT_ELEMENTS.has(name);
  };

  /** 開始タグを消費する。戻り値は走査再開位置 */
  const consumeStartTag = (lt: number): number => {
    let j = lt + 1;
    const nameStart = j;
    while (j < n) {
      const ch = source[j] as string;
      if (isWs(ch) || ch === "/" || ch === ">" || ch === "<") break;
      j++;
    }
    const rawName = source.slice(nameStart, j);
    // タグ名・属性名など「構文を構成すべき領域」の全角のみ拾う(属性値の中は拾わない — §5.4)
    let zenkaku: ZenkakuFinding | null = findZenkakuIn(rawName, true);
    let zenkakuPos = zenkaku === null ? -1 : nameStart + zenkaku.index;
    // start-tag-garbage-name: `<a,>` 等。全角は zenkaku 側の診断を優先する
    const invalidNameChar = zenkaku === null ? firstInvalidNameChar(rawName) : null;
    if (invalidNameChar !== null) {
      report(
        lt,
        `${lineAt(lt)}行目の <${rawName} のタグ名に「${invalidNameChar}」が入っています。<${cleanTagName(rawName) || "タグ名"}> のように書きましょう`,
      );
    }
    const noteZenkaku = (finding: ZenkakuFinding | null, basePos: number): void => {
      if (zenkaku === null && finding !== null) {
        zenkaku = finding;
        zenkakuPos = basePos + finding.index;
      }
    };
    const emitTokenDiag = (fallback: () => void): void => {
      if (zenkaku !== null) reportZenkaku(zenkakuPos, zenkaku);
      else fallback();
    };
    const notClosedMessage = (): string =>
      `${lineAt(lt)}行目の <${rawName} が「>」で閉じられていません。タグの終わりに「>」を書きましょう`;

    for (;;) {
      while (j < n && isWs(source[j] as string)) j++;
      if (j >= n) {
        // eof-in-open-tag: タグが未完のまま EOF — 要素としては開かない
        emitTokenDiag(() => report(lt, notClosedMessage()));
        return n;
      }
      const ch = source[j] as string;
      if (ch === ">") {
        j++;
        break;
      }
      if (ch === "/") {
        // `/>` は void 以外でも合法(HTML5 では単に無視される)— エラーにせず開始タグ扱い
        j++;
        continue;
      }
      if (ch === "<") {
        // lt-in-open-tag: `>` より先に次の `<` が出現(`<h1 hello</h1>`)
        emitTokenDiag(() => report(lt, notClosedMessage()));
        // 開始タグとして扱い、`<` から走査を再開(後続の終了タグと対応させて連鎖を防ぐ)
        applyStartTag(cleanTagName(rawName), lt);
        return j;
      }
      // 属性名
      const attrStart = j;
      while (j < n) {
        const c = source[j] as string;
        if (isWs(c) || c === "=" || c === ">" || c === "/" || c === "<") break;
        j++;
      }
      const attrRaw = source.slice(attrStart, j);
      noteZenkaku(findZenkakuIn(attrRaw, true), attrStart);
      while (j < n && isWs(source[j] as string)) j++;
      if (source[j] === "=") {
        j++;
        while (j < n && isWs(source[j] as string)) j++;
        const quote = source[j];
        if (quote === '"' || quote === "'") {
          const valueStart = j;
          const close = source.indexOf(quote, j + 1);
          if (close === -1) {
            // eof-in-attr-quote: 引用符が閉じないままタグの外(EOF)へ
            emitTokenDiag(() =>
              report(
                valueStart,
                `${lineAt(valueStart)}行目: ${attrRaw} の値を囲む「${quote}」が閉じられていません。値の終わりにもう1つ「${quote}」を書きましょう`,
              ),
            );
            return n;
          }
          j = close + 1;
        } else {
          // 引用符なしの属性値(合法)。先頭が全角クオートの場合のみ打ち間違いとして拾う
          const first = source[j];
          if (first !== undefined) {
            const suggestion = zenkakuSuggestionFor(first, false);
            if (suggestion === '"' || suggestion === "'") {
              noteZenkaku({ index: 0, char: first, suggestion }, j);
            }
          }
          while (j < n) {
            const c = source[j] as string;
            if (isWs(c) || c === ">" || c === "<") break;
            j++;
          }
        }
      }
    }

    // タグ完了
    if (zenkaku !== null) reportZenkaku(zenkakuPos, zenkaku);
    const name = cleanTagName(rawName);
    const isRawtext = applyStartTag(name, lt);
    if (isRawtext) {
      const end = findRawtextEnd(name, j);
      if (end === -1) {
        report(lt, `${lineAt(lt)}行目の <${name}> が閉じられていません。終了タグ </${name}> を書きましょう`);
        stack.pop();
        return n;
      }
      return end;
    }
    return j;
  };

  /** 終了タグを消費する。戻り値は走査再開位置 */
  const consumeEndTag = (lt: number): number => {
    let j = lt + 2;
    const nameStart = j;
    while (j < n) {
      const ch = source[j] as string;
      if (isWs(ch) || ch === ">" || ch === "<" || ch === "/") break;
      j++;
    }
    const rawName = source.slice(nameStart, j);
    const zenkaku = findZenkakuIn(rawName, true);
    // `>` までの残りを記録する(WHATWG は終了タグ内の属性等を無視して回復するが、
    // 初学者には常にミスなのでガードレールとしてはブロック対象 — ADR #18)
    const extraStart = j;
    while (j < n) {
      const ch = source[j] as string;
      if (ch === ">" || ch === "<") break;
      j++;
    }
    const extra = source.slice(extraStart, j);
    const name = cleanTagName(rawName);

    if (j >= n || source[j] === "<") {
      // eof-in-end-tag: `</h1` のまま EOF(または次のタグへ突入)
      if (zenkaku !== null) reportZenkaku(nameStart + zenkaku.index, zenkaku);
      else {
        report(
          lt,
          `${lineAt(lt)}行目の </${rawName} が「>」で閉じられていません。タグの終わりに「>」を書きましょう`,
        );
      }
      silentClose(name);
      return j >= n ? n : j;
    }
    j++; // ">"

    if (zenkaku !== null) {
      reportZenkaku(nameStart + zenkaku.index, zenkaku);
      silentClose(name);
      return j;
    }
    // end-tag-garbage: `</a,>`(名前にゴミ文字)や `</p ,>`(名前の後に余計な文字)。
    // ブラウザは静かに回復するが、初学者には常にミスなのでブロックする
    const invalidNameChar = firstInvalidNameChar(rawName);
    if (invalidNameChar !== null) {
      report(
        lt,
        `${lineAt(lt)}行目の </${rawName}> に「${invalidNameChar}」が入っています。終了タグは </${name || "タグ名"}> とだけ書きましょう`,
      );
      silentClose(name);
      return j;
    }
    if (extra.trim() !== "") {
      report(
        lt,
        `${lineAt(lt)}行目の終了タグ </${name}> に余計な文字が入っています。終了タグは </${name}> とだけ書きましょう`,
      );
      silentClose(name);
      return j;
    }
    if (name === "") return j;
    if (VOID_ELEMENTS.has(name)) {
      report(lt, `${lineAt(lt)}行目: <${name}> は終了タグが不要なタグです。</${name}> を削除しましょう`);
      return j;
    }

    let foundIndex = -1;
    for (let k = stack.length - 1; k >= 0; k--) {
      if ((stack[k] as OpenElement).name === name) {
        foundIndex = k;
        break;
      }
    }
    if (foundIndex === -1) {
      report(
        lt,
        `${lineAt(lt)}行目の </${name}> に対応する開始タグ <${name}> がありません。開始タグを書くか、この終了タグを削除しましょう`,
      );
      return j;
    }
    // 上に乗っている要素のうち、終了タグを省略できないものがあれば交差ネスト
    let blocker: OpenElement | null = null;
    for (let k = stack.length - 1; k > foundIndex; k--) {
      const el = stack[k] as OpenElement;
      if (!OMISSIBLE_END_TAGS.has(el.name)) {
        blocker = el;
        break;
      }
    }
    if (blocker !== null) {
      report(
        lt,
        `${lineAt(lt)}行目の </${name}>: 先に ${blocker.line}行目の <${blocker.name}> を </${blocker.name}> で閉じましょう`,
      );
      // 対象要素だけ外す(残りは後続の終了タグ・EOF 検査に委ねる)
      stack.splice(foundIndex, 1);
    } else {
      // 省略可能な終了タグの自動クローズ(<ul><li>a<li>b</ul> はエラーにしない)
      stack.length = foundIndex;
    }
    return j;
  };

  let i = 0;
  while (i < n) {
    const lt = source.indexOf("<", i);
    if (lt === -1) break;
    const next = source[lt + 1];
    if (next === "!") {
      i = consumeMarkupDeclaration(lt);
    } else if (next === "/") {
      // `</` + 英字のみ終了タグ。`</>` 等はテキスト扱い(ブロックしない)
      i = isAsciiLetter(source[lt + 2]) ? consumeEndTag(lt) : lt + 1;
    } else if (isAsciiLetter(next)) {
      i = consumeStartTag(lt);
    } else {
      // `<3`・`1 < 2`・`< ` などの `<` はテキスト(WHATWG 準拠 — エラーにしない)
      i = lt + 1;
    }
  }

  // EOF: 終了タグを省略できない要素が開いたままならエラー
  for (const el of stack) {
    if (!OMISSIBLE_END_TAGS.has(el.name)) {
      report(
        el.pos,
        `${el.line}行目の <${el.name}> が閉じられていません。終了タグ </${el.name}> を書きましょう`,
      );
    }
  }

  return diags.sort((a, b) => a.pos - b.pos).map(({ line, message }) => ({ line, message }));
}
