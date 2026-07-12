// コメント除去(docs/specs/J-judge-hardening.md)。
// source check の `ignoreComments: true` が使う純粋ユーティリティ。
// 判定バンドルに入るため acorn は使わない(軽量ステートマシン)。
//
// 置換規則: コメントは「1 個の空白」に置き換える(パーサにとってコメント=空白であることに合わせ、
// 除去によって前後のトークンが結合して偽マッチが生まれるのを防ぐ)。コメント内の改行は保持し、
// 行番号ベースの診断が除去後もずれないようにする。
//
// 既知の制限(意図的なトレードオフ):
// - JS の正規表現リテラル内の `//` や `/*` はコメント開始と誤認しうる(字句解析では除算と
//   正規表現を区別できないため)。教材コードでは稀であり、誤除去で solution が不合格になる場合は
//   教材 CI ステージ 2(自己整合性検証)が検出する。
// - HTML 内のインライン <script> / <style> の JS / CSS コメントは対象外(HTML コメントのみ除去)。

export type CommentLang = "js" | "css" | "html";

/** ファイル名の拡張子からコメント言語を推定する。不明な拡張子は null */
export function commentLangForFile(fileName: string): CommentLang | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".js") || lower.endsWith(".mjs")) return "js";
  if (lower.endsWith(".css")) return "css";
  if (lower.endsWith(".html") || lower.endsWith(".htm")) return "html";
  return null;
}

/** コメント本文を「改行は保持 + それ以外は 1 空白」の置換文字列にする */
function commentReplacement(comment: string): string {
  const newlines = comment.match(/\n/g);
  return newlines === null ? " " : newlines.join("");
}

function stripHtmlComments(source: string): string {
  let out = "";
  let i = 0;
  while (i < source.length) {
    const start = source.indexOf("<!--", i);
    if (start === -1) {
      out += source.slice(i);
      break;
    }
    out += source.slice(i, start);
    const end = source.indexOf("-->", start + 4);
    // 未終端コメントは末尾まで(ブラウザの寛容パースと同じ扱い)
    const commentEnd = end === -1 ? source.length : end + 3;
    out += commentReplacement(source.slice(start, commentEnd));
    i = commentEnd;
  }
  return out;
}

function stripCssComments(source: string): string {
  let out = "";
  let i = 0;
  let inString: '"' | "'" | null = null;
  while (i < source.length) {
    const ch = source[i] as string;
    if (inString !== null) {
      out += ch;
      if (ch === "\\" && i + 1 < source.length) {
        out += source[i + 1];
        i += 2;
        continue;
      }
      if (ch === inString) inString = null;
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = ch;
      out += ch;
      i += 1;
      continue;
    }
    if (ch === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      const commentEnd = end === -1 ? source.length : end + 2;
      out += commentReplacement(source.slice(i, commentEnd));
      i = commentEnd;
      continue;
    }
    out += ch;
    i += 1;
  }
  return out;
}

function stripJsComments(source: string): string {
  let out = "";
  let i = 0;
  type Mode = '"' | "'" | "`" | null;
  let mode: Mode = null;
  // テンプレートリテラルの `${ ... }` ネスト(補間内はコードとして走査する)
  const templateStack: number[] = [];
  let braceDepth = 0;

  while (i < source.length) {
    const ch = source[i] as string;

    if (mode !== null) {
      out += ch;
      if (ch === "\\" && i + 1 < source.length) {
        out += source[i + 1];
        i += 2;
        continue;
      }
      if (mode === "`" && ch === "$" && source[i + 1] === "{") {
        out += "{";
        templateStack.push(braceDepth);
        braceDepth = 0;
        mode = null;
        i += 2;
        continue;
      }
      if (ch === mode) mode = null;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      mode = ch as Mode;
      out += ch;
      i += 1;
      continue;
    }
    if (ch === "{") {
      braceDepth += 1;
      out += ch;
      i += 1;
      continue;
    }
    if (ch === "}") {
      if (braceDepth === 0 && templateStack.length > 0) {
        // 補間の終わり: テンプレートリテラル本文へ戻る
        braceDepth = templateStack.pop() as number;
        mode = "`";
      } else {
        braceDepth = Math.max(0, braceDepth - 1);
      }
      out += ch;
      i += 1;
      continue;
    }
    if (ch === "/" && source[i + 1] === "/") {
      const end = source.indexOf("\n", i + 2);
      // 行コメントは改行の手前まで(改行自体は残す)
      i = end === -1 ? source.length : end;
      out += " ";
      continue;
    }
    if (ch === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      const commentEnd = end === -1 ? source.length : end + 2;
      out += commentReplacement(source.slice(i, commentEnd));
      i = commentEnd;
      continue;
    }
    out += ch;
    i += 1;
  }
  return out;
}

/** 言語別にコメントを除去する。throw しない(未終端等は寛容に処理) */
export function stripComments(source: string, lang: CommentLang): string {
  switch (lang) {
    case "html":
      return stripHtmlComments(source);
    case "css":
      return stripCssComments(source);
    case "js":
      return stripJsComments(source);
  }
}

/** ファイル名から言語を推定して除去する。不明な拡張子は原文のまま返す */
export function stripCommentsForFile(fileName: string, source: string): string {
  const lang = commentLangForFile(fileName);
  return lang === null ? source : stripComments(source, lang);
}
