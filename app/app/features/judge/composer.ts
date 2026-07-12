// srcdoc 合成器(DesignDoc §6.1、SPEC B §1)。app のメインスレッドでのみ実行される
// (instrumentLoops = acorn を使うため、判定バンドルには入れない)。
// TS / TSX / JSX は「sucrase 変換 → instrumentLoops → インライン化」の順(L-runtime):
// acorn は TS を読めないため、必ず変換が先。エディタ・source check には元ソースを渡す
// (変換後コードはサンドボックス実行にのみ使う)。

import type { FileMap, SyntaxDiag } from "@codesteps/lesson-kit";
import { instrumentLoops, LOOP_LIMIT_MESSAGE_JP, LOOP_PROTECT_ERROR_MESSAGE } from "@codesteps/lesson-kit";
import { PREVIEW_CONSOLE_KIND } from "./protocol";
import { scriptLangOf, type Transpiler } from "./transpile";

export type ComposeMode = "preview" | "judge";

export type ComposeInput = {
  /** hidden 含む実行対象の全ファイル(呼び出し側で initial / 編集値をマージ済み) */
  files: FileMap;
  lessonSlug: string;
  /** window.location.origin(CSP img-src / script-src と <base> に使用) */
  origin: string;
  nonce: string;
  mode: ComposeMode;
  /** mode === "judge" のとき必須 */
  judgeBundle?: string;
  /** files に .ts/.tsx/.jsx を含むとき必須(ensureTranspiler / loadTranspiler で取得) */
  transpile?: Transpiler;
};

export type ComposeOutput = { html: string; jsSyntaxError: SyntaxDiag | null };

/** インライン <script> の中身に閉じタグが含まれてもドキュメントが壊れないようにする(CONTRACTS §3.3) */
export function escapeInlineScript(code: string): string {
  // JS 文字列/正規表現内では \/ === / なので意味は変わらない。大文字小文字は原文を保つ
  return code.replace(/<\/script/gi, (m) => `<\\${m.slice(1)}`);
}

/** <script> へ埋め込む JSON。`<` を < にして閉じタグ注入を防ぐ(CONTRACTS §3.3) */
export function escapeJsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

const SCRIPT_RE = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
const LINK_RE = /<link\b[^>]*\/?>/gi;

function attrValue(attrs: string, name: string): string | null {
  const re = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const m = re.exec(attrs);
  if (m === null) return null;
  return m[2] ?? m[3] ?? m[4] ?? null;
}

/** `./style.css` → `style.css`(files キーとの突き合わせ用の最小正規化) */
function normalizeRef(ref: string): string {
  return ref.startsWith("./") ? ref.slice(2) : ref;
}

/**
 * console.log/info/warn/error を `__CONSOLE__` に捕捉し、error / unhandledrejection も
 * error として捕捉するフックスクリプト(SPEC B §1)。ループ保護超過(§6.6)は
 * `__LOOP_LIMIT_HIT__` フラグ + 学習者向けメッセージに変換する。
 */
export function buildConsoleHook(opts: { nonce: string; relay: boolean; scope: "page" | "worker" }): string {
  const relaySend = opts.scope === "page" ? 'window.parent.postMessage(msg, "*");' : "self.postMessage(msg);";
  return [
    "(function () {",
    "  var entries = [];",
    "  globalThis.__CONSOLE__ = entries;",
    "  globalThis.__LOOP_LIMIT_HIT__ = false;",
    `  var relay = ${opts.relay ? "true" : "false"};`,
    `  var nonce = ${JSON.stringify(opts.nonce)};`,
    `  var loopMarker = ${JSON.stringify(LOOP_PROTECT_ERROR_MESSAGE)};`,
    `  var loopMessage = ${JSON.stringify(LOOP_LIMIT_MESSAGE_JP)};`,
    "  function toText(args) {",
    "    var parts = [];",
    "    for (var i = 0; i < args.length; i++) {",
    "      var v = args[i];",
    '      if (v !== null && typeof v === "object") {',
    "        try { var s = JSON.stringify(v); parts.push(s === undefined ? String(v) : s); } catch (err) { parts.push(String(v)); }",
    "      } else { parts.push(String(v)); }",
    "    }",
    '    return parts.join(" ");',
    "  }",
    "  function push(level, text) {",
    "    var entry = { level: level, text: text };",
    "    entries.push(entry);",
    "    if (relay) {",
    `      try { var msg = { kind: ${JSON.stringify(PREVIEW_CONSOLE_KIND)}, nonce: nonce, entry: entry }; ${relaySend} } catch (err) {}`,
    "    }",
    "  }",
    "  var c = globalThis.console;",
    '  var levels = ["log", "info", "warn", "error"];',
    "  for (var i = 0; i < levels.length; i++) {",
    "    (function (level) {",
    "      var original = c[level];",
    "      c[level] = function () {",
    "        push(level, toText(arguments));",
    "        if (original) { try { original.apply(c, arguments); } catch (err) {} }",
    "      };",
    "    })(levels[i]);",
    "  }",
    "  function captureError(message) {",
    '    var text = message == null ? "エラーが発生しました" : String(message);',
    "    if (text.indexOf(loopMarker) !== -1) {",
    "      globalThis.__LOOP_LIMIT_HIT__ = true;",
    '      push("error", loopMessage);',
    "    } else {",
    '      push("error", text);',
    "    }",
    "  }",
    "  globalThis.__CAPTURE_ERROR__ = function (err) {",
    "    captureError(err && err.message != null ? err.message : err);",
    "  };",
    '  globalThis.addEventListener("error", function (e) {',
    "    captureError(e && (e.message || (e.error && e.error.message)));",
    "  });",
    '  globalThis.addEventListener("unhandledrejection", function (e) {',
    "    var r = e ? e.reason : null;",
    "    captureError(r && r.message != null ? r.message : r);",
    "  });",
    "})();",
  ].join("\n");
}

function buildCspMeta(origin: string): string {
  // §6.5: 外部ネットワークを遮断 [決定性]。画像は data: と自オリジン(lesson-assets)のみ。
  // script-src の ${origin} は自オリジン配信の vendor スクリプト(/vendor/*.js — L-runtime)用で、
  // 外部オリジンは引き続き遮断される(決定性維持)
  const csp = `default-src 'none'; script-src 'unsafe-inline' ${origin}; style-src 'unsafe-inline'; img-src data: ${origin}`;
  return `<meta http-equiv="Content-Security-Policy" content="${csp}">`;
}

/** ヘッダ(CSP → base → コンソールフック)を <head> 内へ注入する。骨格が無ければ先頭に置く */
function injectHeader(html: string, header: string): string {
  const headMatch = /<head\b[^>]*>/i.exec(html);
  if (headMatch !== null) {
    const at = headMatch.index + headMatch[0].length;
    return html.slice(0, at) + header + html.slice(at);
  }
  // 注意: doctype より前に注入すると doctype が無視され quirks mode になる(computed style が揺れる)
  const doctypeMatch = /^\s*<!doctype[^>]*>/i.exec(html);
  if (doctypeMatch !== null) {
    const at = doctypeMatch.index + doctypeMatch[0].length;
    return html.slice(0, at) + header + html.slice(at);
  }
  return header + html;
}

/**
 * 複数ファイルを 1 枚の srcdoc HTML に合成する(§6.1)。
 * - `<link rel="stylesheet" href="X">` → files 内 X の `<style>` インライン化
 * - `<script src="Y">` → files 内 Y のループ保護済みインライン化(存在しない参照はそのまま残す)
 * - jsSyntaxError 時は JS を一切注入しない(HTML / CSS は描画される — CONTRACTS §3.2)
 */
export function composeDocument(input: ComposeInput): ComposeOutput {
  const { files, mode } = input;
  if (mode === "judge" && input.judgeBundle === undefined) {
    throw new Error("composeDocument: judge モードには judgeBundle が必要です");
  }

  const htmlName = Object.keys(files).find((n) => n.toLowerCase().endsWith(".html"));
  const base = htmlName !== undefined ? (files[htmlName] ?? "") : "";

  // パス1: 全スクリプトファイル(.js/.ts/.tsx/.jsx)を実行形へ。
  // 順序は「sucrase 変換 → instrumentLoops」(acorn は TS を読めない)。
  // ループ保護はプレビューにも必ず適用(§6.2)
  const jsResults = new Map<string, string>();
  let jsSyntaxError: SyntaxDiag | null = null;
  for (const name of Object.keys(files)) {
    const lang = scriptLangOf(name);
    if (lang === null) continue;
    let source = files[name] ?? "";
    if (lang !== "js") {
      if (input.transpile === undefined) {
        throw new Error(
          `composeDocument: ${name} の変換には transpile が必要です(ensureTranspiler を先に await する)`,
        );
      }
      const transpiled = input.transpile(source, lang);
      if (!transpiled.ok) {
        if (jsSyntaxError === null) jsSyntaxError = transpiled.error;
        continue;
      }
      source = transpiled.code;
    }
    const result = instrumentLoops(source);
    if (result.ok) {
      jsResults.set(name, result.code);
    } else if (jsSyntaxError === null) {
      jsSyntaxError = result.error;
    }
  }

  // パス1b: HTML 内インライン <script> にもループ保護を適用(タイプ途中の while(true) 対策)
  const inlineResults = new Map<number, string>();
  for (const m of base.matchAll(SCRIPT_RE)) {
    const attrs = m[1] ?? "";
    const body = m[2] ?? "";
    if (attrValue(attrs, "src") !== null) continue;
    if (body.trim() === "") continue;
    const result = instrumentLoops(body);
    if (result.ok) {
      inlineResults.set(m.index, result.code);
    } else if (jsSyntaxError === null) {
      jsSyntaxError = result.error;
    }
  }

  // パス2: <script> の置換(offset は base 基準なので link 置換より先に行う)
  let html = base.replace(
    SCRIPT_RE,
    (matched: string, attrs: string, body: string, offset: number): string => {
      const src = attrValue(attrs ?? "", "src");
      if (src !== null) {
        const name = normalizeRef(src);
        if (!(name in files)) return matched; // 存在しない参照はそのまま残す(§6.1)
        if (jsSyntaxError !== null) return "";
        const code = jsResults.get(name);
        if (code === undefined) return "";
        return `<script>\n${escapeInlineScript(code)}\n</script>`;
      }
      if ((body ?? "").trim() === "") return matched;
      if (jsSyntaxError !== null) return "";
      const code = inlineResults.get(offset);
      if (code === undefined) return "";
      return `<script>\n${escapeInlineScript(code)}\n</script>`;
    },
  );

  // パス3: <link rel="stylesheet"> のインライン化
  html = html.replace(LINK_RE, (tag: string): string => {
    if (!/\brel\s*=\s*("stylesheet"|'stylesheet'|stylesheet)/i.test(tag)) return tag;
    const href = attrValue(tag, "href");
    if (href === null) return tag;
    const css = files[normalizeRef(href)];
    if (css === undefined) return tag; // 存在しない参照はそのまま残す(§6.1)
    return `<style>\n${css}\n</style>`;
  });

  // 注入順序は CONTRACTS §3.3: ①CSP ②<base> ③コンソールフック(判定時は続けて④バンドル ⑤bootstrap)。
  // 判定バンドルは <head>(=ユーザー本文より前)へ注入する [フェイルセーフ/多層防御]:
  // 本文側に注入すると、壊れた終了タグ(`</a,` 等)がブラウザのトークナイザに後続の
  // <script> 開始タグごと食われて判定が実行されず、原因不明のタイムアウトに化ける。
  // ランタイムは whenDocumentSettled() で load を待つため head 実行で問題ない。
  let header =
    buildCspMeta(input.origin) +
    `<base href="${input.origin}/lesson-assets/${input.lessonSlug}/">` +
    `<script>\n${buildConsoleHook({ nonce: input.nonce, relay: mode === "preview", scope: "page" })}\n</script>`;
  if (mode === "preview") {
    // プレビュー用の files 注入(L-runtime): hidden の再生スクリプト(git レッスンの
    // preview.js 等)が提出ファイルの原文を読めるようにする。判定時の files は
    // __JUDGE__.start({ files }) 経由で渡る(custom check は ctx.files を使う)
    header += `<script>\nglobalThis.__FILES__ = ${escapeJsonForScript(files)};\n</script>`;
  }
  if (mode === "judge" && input.judgeBundle !== undefined) {
    header +=
      `<script>\n${escapeInlineScript(input.judgeBundle)}\n</script>` +
      `<script>\nglobalThis.__JUDGE__.start({ nonce: ${escapeJsonForScript(input.nonce)}, files: ${escapeJsonForScript(files)} });\n</script>`;
  }
  html = injectHeader(html, header);

  return { html, jsSyntaxError };
}
