// コメント除去(docs/specs/J-judge-hardening.md)。
// source check の `ignoreComments: true` が使う純粋ユーティリティ。
// 判定バンドルに入るため acorn は使わない(軽量ステートマシン)。
//
// 置換規則: コメントは「1 個の空白」に置き換える(パーサにとってコメント=空白であることに合わせ、
// 除去によって前後のトークンが結合して偽マッチが生まれるのを防ぐ)。コメント内の改行は保持し、
// 行番号ベースの診断が除去後もずれないようにする。
//
// 安全側の原則: 判定に迷う `/` は「コメントとして削らない」側に倒す。誤ってコードを消すより、
// コメントを消し残す方が偽陽性が起きにくい(ignoreComments はコメント誤マッチ対策が目的で、
// コメントが少々残ってもパターン一致には通常無害)。
//
// 正規表現リテラルの追跡と安全側の非対称性(must-fix / 再発防止):
// - JS の `/` は簡易ヒューリスティックで除算/正規表現を判定する。直前の「意味のあるトークン」が
//   明確な値(識別子/数値/文字列/正規表現/`]`)なら除算、それ以外(演算子・`(`・`,`・`=`・
//   `return`/`default`/`case` 等のキーワード直後、および曖昧な `}`・`)`)なら正規表現の開始として
//   scanJsRegex を試し、失敗(改行/未終端/EOF)したら除算にフォールバックする。
// - 非対称性が肝: 「正規表現を除算と誤判定」は危険 — 外側ループが正規表現本体に入り込み、本体(特に
//   文字クラス)の `//` や `/*` をコメント開始と誤検出して実コードを削除する(例:`function f(){}` の
//   直後の `/[a//z]/.test(x)`)。逆に「除算を正規表現と誤判定」は安全 — scanJsRegex は本体を逐語保持し、
//   改行に当たれば null を返して除算に自己修正するため、最悪でも「コメントを消し残す」止まり。
//   よって曖昧な `/` は必ず正規表現側に倒す(「迷ったら削らない」)。
// - ただし本物の `//`・`/* */` の検出は除算/正規表現の判定より先に効かせるので、明確な値の直後の
//   コメント(`1 / 2; /* c */ x`)は従来どおり除去される。
// - HTML の属性値内 `<!--`(例: content="Use <!-- ...")や raw-text 要素(<script>/<style>)内の
//   `<!--` はコメント開始と誤認しない(引用符・タグ境界・raw-text 境界を認識)。
// - HTML 内のインライン <script> / <style> の JS / CSS コメントは除去対象外(raw-text として逐語保持。
//   HTML コメントのみ除去)。
//
// 残る制限(意図的な割り切り。いずれも「コメントを消し残す」安全側の失敗で、コードは決して削らない):
// - 曖昧位置(`}`・`)`・キーワード・後置 `++`/`--` 等の演算子的文脈)直後に本物の除算があり、同一行に
//   `//`・`/* */` コメントが続く場合(`f() / 2; /* c */ x`・`x++ / 2; // c`)、正規表現とみなした走査が
//   そのコメントを取り込み、消し残すことがある(後置 `++`/`--` は `+`/`-` が演算子として prevWasValue を
//   下ろすため `}`/`)` と同じ挙動になる)。これは `{}/re/` や `if(x)/re/` のコード削除を防ぐために曖昧位置を
//   regex 側へ倒した副作用であり、「コードは絶対に削らない」を優先した意図的なトレードオフ(ignoreComments は
//   元来 best-effort で、コメントが多少残っても pattern 一致には通常無害。安全側への劣化)。改行を挟めば
//   scanJsRegex が null を返して除算に戻り、コメントは正しく除去される。明確な値(識別子/数値)直後は
//   曖昧でなく常に除算なので、この限りではない。

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

/** `<` の直後がタグ(開始/終了/宣言)の始まりを示す文字かどうか。素の `<`(テキスト)と区別する */
function isHtmlTagStart(next: string | undefined): boolean {
  if (next === undefined) return false;
  return (
    (next >= "a" && next <= "z") ||
    (next >= "A" && next <= "Z") ||
    next === "/" ||
    next === "!" ||
    next === "?"
  );
}

/** `<` から始まるタグを `>` まで走査(属性値の引用符を尊重)。終端の次位置・小文字タグ名・終了タグかを返す */
function scanHtmlTag(source: string, start: number): { end: number; name: string; isEnd: boolean } {
  const n = source.length;
  let i = start + 1;
  const isEnd = source[i] === "/";
  if (isEnd) i += 1;
  let name = "";
  while (i < n) {
    const ch = source[i] as string;
    if ((ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || (ch >= "0" && ch <= "9")) {
      name += ch;
      i += 1;
      continue;
    }
    break;
  }
  let quote: '"' | "'" | null = null;
  while (i < n) {
    const ch = source[i] as string;
    if (quote !== null) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === ">") {
      i += 1;
      break;
    }
    i += 1;
  }
  return { end: i, name: name.toLowerCase(), isEnd };
}

/** raw-text 要素の終了タグ `</name` の開始位置を返す(なければ末尾) */
function findRawTextClose(source: string, from: number, name: string): number {
  const idx = source.toLowerCase().indexOf(`</${name}`, from);
  return idx === -1 ? source.length : idx;
}

function stripHtmlComments(source: string): string {
  const n = source.length;
  let out = "";
  let i = 0;
  while (i < n) {
    const ch = source[i] as string;
    // <!-- --> はデータ状態(タグ外)でのみコメント。属性値内・raw-text 内の <!-- はここへ来ない
    if (ch === "<" && source.startsWith("<!--", i)) {
      const end = source.indexOf("-->", i + 4);
      // 未終端コメントは末尾まで(ブラウザの寛容パースと同じ扱い)
      const commentEnd = end === -1 ? n : end + 3;
      out += commentReplacement(source.slice(i, commentEnd));
      i = commentEnd;
      continue;
    }
    // 開始/終了タグ・宣言(<!doctype> 等)は `>` まで逐語コピー(引用符を尊重)し、内部の <!-- を無視する
    if (ch === "<" && isHtmlTagStart(source[i + 1])) {
      const tag = scanHtmlTag(source, i);
      out += source.slice(i, tag.end);
      i = tag.end;
      // raw-text 要素(<script>/<style>)の開始タグは終了タグまで逐語保持(内部を CSS/JS として扱わない)
      if (!tag.isEnd && (tag.name === "script" || tag.name === "style")) {
        const close = findRawTextClose(source, i, tag.name);
        out += source.slice(i, close);
        i = close;
      }
      continue;
    }
    out += ch;
    i += 1;
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

// これらのキーワードの直後の `/` は除算ではなく正規表現リテラルの開始とみなす(式が続く位置)。
//
// 【この集合が閉じている根拠 — value→division 分岐がコード削除を起こさないことの証明】
// コード削除が起きうる唯一の経路は「実 regex を除算と誤判定 → `/` を出力後、regex 本体を素の
// モードで走査 → 本体内の `//`/`/*` を誤検出」。除算と誤判定するのは prevWasValue===true(=値の後)
// のときだけ。そして JS では「値(非予約語の識別子・数値・文字列・テンプレート・`]`・正規表現)の
// 直後に正規表現リテラルが合法に続くこと」は無い(必ず除算)。識別子の形をしていて式(= 正規表現)に
// 先行しうるのは予約語だけなので、式に先行しうる予約語をここに網羅すれば value→division 分岐は
// 原理的に実 regex を除算と誤判定しない = コード削除ゼロになる(閉じた集合。以後の後追い追加は不要)。
//
// 【ECMAScript 予約語との網羅監査】直後に式が来うる予約語:
//   単項演算子系: typeof / void / delete / await / yield / new
//   二項・for-of/in 系: in / instanceof / of
//   文→式の導入: return / throw / case / default(export default /re/)/ do / else
//   クラス継承: extends(class X extends /re/ {})
// 不要な予約語(regex 位置に `/` が来ない): if / while / for / switch / with / catch / function /
//   class / const / let / var / try / finally / import / export / break / continue / debugger / enum
//   (直後は必ず `(` か 識別子 か `{`)。文脈キーワード(async / get / set / static / as / from / using 等)も
//   直後に必ず `/` 以外の必須トークン(識別子・`function`・`(`・`{` 等)が続くため対象外。this / super /
//   true / false / null は「値」なので除算側(集合に入れない)。判断に迷うものは安全側 = 集合に入れる
//   (regex 側は最悪でもコメント消し残しのみ)。
const JS_REGEX_PRECEDING_KEYWORDS = new Set([
  "return",
  "typeof",
  "instanceof",
  "in",
  "of",
  "new",
  "delete",
  "void",
  "do",
  "else",
  "yield",
  "await",
  "case",
  "default", // export default /re/ ・ switch の default: /re/
  "extends", // class X extends /re/ {}
  "throw",
]);

/** JS の識別子・数値を構成しうる文字(非 ASCII も語の一部とみなし、走査を壊さない) */
function isJsWordChar(ch: string): boolean {
  return (
    (ch >= "a" && ch <= "z") ||
    (ch >= "A" && ch <= "Z") ||
    (ch >= "0" && ch <= "9") ||
    ch === "_" ||
    ch === "$" ||
    ch.charCodeAt(0) > 0x7f
  );
}

/** source[start] を quote 始まりの文字列とみなし終端の次位置を返す。素の改行 / 末尾で止める(安全側) */
function scanJsString(source: string, start: number, quote: string): number {
  const n = source.length;
  let i = start + 1;
  while (i < n) {
    const ch = source[i] as string;
    if (ch === "\\") {
      i += 2; // エスケープ(行継続 \<改行> 含む)は次の 1 文字を飛ばす
      continue;
    }
    if (ch === quote) return i + 1;
    if (ch === "\n" || ch === "\r") return i; // 素の改行で終端(未終端文字列 — 行を跨がない)
    i += 1;
  }
  return n;
}

/**
 * source[start] === "/" を正規表現リテラルとみなし終端の次位置を返す。
 * 文字クラス `[...]` 内の `/` は非デリミタとして扱い、`\` エスケープ(\/ や \[)を尊重する。
 * 改行混入・未終端など正規表現として成立しない場合は null(呼び出し側は除算として扱う = 安全側)。
 */
function scanJsRegex(source: string, start: number): number | null {
  const n = source.length;
  let i = start + 1;
  let inClass = false;
  while (i < n) {
    const ch = source[i] as string;
    if (ch === "\n" || ch === "\r") return null; // 正規表現リテラルは改行を含まない
    if (ch === "\\") {
      i += 2; // エスケープは次の 1 文字を飛ばす
      continue;
    }
    if (ch === "[") {
      inClass = true;
    } else if (ch === "]") {
      inClass = false;
    } else if (ch === "/" && !inClass) {
      i += 1;
      while (i < n && /[a-z]/i.test(source[i] as string)) i += 1; // フラグ
      return i;
    }
    i += 1;
  }
  return null; // 未終端
}

function stripJsComments(source: string): string {
  const n = source.length;
  let out = "";
  let i = 0;
  let inTemplate = false; // テンプレートリテラル `...` の生テキスト内か
  const templateStack: number[] = []; // 各 ${ 補間の外側のブレース深度
  let braceDepth = 0;
  // 直前の「意味のあるトークン」が明確な値(識別子/数値/文字列/正規表現/`]`)なら true → `/` は除算。
  // それ以外(演算子・`(`・キーワード直後、および曖昧な `}`・`)`)は false → `/` は正規表現の開始として
  // scanJsRegex を試し、失敗したら除算にフォールバックする(安全側の非対称性は下記コメント参照)。
  let prevWasValue = false;

  while (i < n) {
    const ch = source[i] as string;

    if (inTemplate) {
      out += ch;
      if (ch === "\\" && i + 1 < n) {
        out += source[i + 1] as string;
        i += 2;
        continue;
      }
      if (ch === "$" && source[i + 1] === "{") {
        out += "{";
        templateStack.push(braceDepth);
        braceDepth = 0;
        inTemplate = false;
        prevWasValue = false; // 補間の先頭は式の位置
        i += 2;
        continue;
      }
      if (ch === "`") {
        inTemplate = false;
        prevWasValue = true; // テンプレートリテラルは値
      }
      i += 1;
      continue;
    }

    // 空白(コメントと同じく prevWasValue は据え置き)
    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r" || ch === "\f" || ch === "\v") {
      out += ch;
      i += 1;
      continue;
    }

    // 文字列
    if (ch === '"' || ch === "'") {
      const end = scanJsString(source, i, ch);
      out += source.slice(i, end);
      i = end;
      prevWasValue = true;
      continue;
    }

    // テンプレートリテラル開始
    if (ch === "`") {
      out += ch;
      inTemplate = true;
      i += 1;
      continue;
    }

    // 行コメント(`//` は式位置でも常にコメント — 空の正規表現 // は JS に存在しない)
    if (ch === "/" && source[i + 1] === "/") {
      const end = source.indexOf("\n", i + 2);
      i = end === -1 ? n : end; // 改行の手前まで(改行自体は残す)
      out += " ";
      continue;
    }
    // ブロックコメント
    if (ch === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      const commentEnd = end === -1 ? n : end + 2;
      out += commentReplacement(source.slice(i, commentEnd));
      i = commentEnd;
      continue;
    }
    // 正規表現リテラル or 除算
    if (ch === "/") {
      if (!prevWasValue) {
        const end = scanJsRegex(source, i);
        if (end !== null) {
          out += source.slice(i, end); // 正規表現は逐語コピー(内部の // /* を削らない)
          i = end;
          prevWasValue = true;
          continue;
        }
      }
      out += ch; // 除算(または正規表現と判定できなかった `/` — 安全側)
      i += 1;
      prevWasValue = false;
      continue;
    }

    // 識別子・キーワード・数値(1 トークンとしてまとめて消費し、キーワード判定を可能にする)
    if (isJsWordChar(ch)) {
      let j = i + 1;
      while (j < n && isJsWordChar(source[j] as string)) j += 1;
      const word = source.slice(i, j);
      out += word;
      i = j;
      prevWasValue = !JS_REGEX_PRECEDING_KEYWORDS.has(word);
      continue;
    }

    // ブレース(テンプレート補間の対応を追跡)
    if (ch === "{") {
      braceDepth += 1;
      out += ch;
      i += 1;
      prevWasValue = false;
      continue;
    }
    if (ch === "}") {
      if (braceDepth === 0 && templateStack.length > 0) {
        // 補間の終わり: テンプレートリテラル本文へ戻る
        braceDepth = templateStack.pop() as number;
        out += ch;
        i += 1;
        inTemplate = true;
        continue;
      }
      braceDepth = Math.max(0, braceDepth - 1);
      out += ch;
      i += 1;
      // } は曖昧(ブロック終端=正規表現 / 式終端=除算)。正規表現側に倒す(安全側 — 下記)。
      prevWasValue = false;
      continue;
    }

    // その他の区切り文字。) も曖昧(if(x) の後=正規表現 / f() の後=除算)なので正規表現側に倒す。
    // ] だけは明確な値終端(arr[i] / 2 の除算)なので値扱いにする。
    out += ch;
    i += 1;
    prevWasValue = ch === "]";
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
