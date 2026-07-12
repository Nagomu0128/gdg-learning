// TS / TSX / JSX のクライアントサイドトランスパイル(sucrase — docs/specs/L-runtime.md)。
// パイプラインは「sucrase 変換 → instrumentLoops(acorn は TS を読めない)→ インライン化」の順。
// sucrase はバンドル肥大を避けるため dynamic import で code-split し、`.ts/.tsx/.jsx` を
// 含まないレッスンではチャンク自体を読み込まない。
// JSX は classic runtime(React.createElement / React.Fragment。vendor の React UMD グローバル前提)。

import type { FileMap, SyntaxDiag } from "@codesteps/lesson-kit";
import { diagnoseJsParseError, generalSyntaxErrorMessage } from "@codesteps/lesson-kit";

/** サンドボックスで実行されるスクリプトの言語種別(null = スクリプトではない) */
export type ScriptLang = "js" | "ts" | "tsx" | "jsx";

export function scriptLangOf(fileName: string): ScriptLang | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".js")) return "js";
  if (lower.endsWith(".tsx")) return "tsx";
  if (lower.endsWith(".ts")) return "ts";
  if (lower.endsWith(".jsx")) return "jsx";
  return null;
}

/** 変換が必要な言語(js はそのまま instrumentLoops へ) */
export type TranspileLang = Exclude<ScriptLang, "js">;

export type TranspileResult = { ok: true; code: string } | { ok: false; error: SyntaxDiag };

/** 同期トランスパイラ(loadTranspiler が解決した後に composer / worker-runner へ渡す) */
export type Transpiler = (source: string, lang: TranspileLang) => TranspileResult;

/** files に TS / TSX / JSX ファイルが含まれるか(= sucrase のロードが必要か) */
export function needsTranspile(files: FileMap): boolean {
  return Object.keys(files).some((name) => {
    const lang = scriptLangOf(name);
    return lang !== null && lang !== "js";
  });
}

/** sucrase の構文エラーを既存の SyntaxDiag(行番号つき日本語)へ変換する(loop-protect と同じ規則) */
function toSyntaxDiag(source: string, e: unknown): SyntaxDiag {
  const loc = (e as { loc?: { line?: number; column?: number } }).loc;
  let line = typeof loc?.line === "number" && loc.line >= 1 ? loc.line : null;
  let column = typeof loc?.column === "number" ? loc.column : 0;
  if (line === null) {
    const m = /\((\d+):(\d+)\)/.exec(e instanceof Error ? e.message : String(e));
    if (m !== null) {
      line = Number.parseInt(m[1] ?? "1", 10);
      column = Number.parseInt(m[2] ?? "0", 10);
    }
  }
  const at = line ?? 1;
  const zenkaku = diagnoseJsParseError(source, { line: at, column });
  return zenkaku ?? { line: at, message: generalSyntaxErrorMessage(at) };
}

const TRANSFORMS: Record<TranspileLang, ("typescript" | "jsx")[]> = {
  ts: ["typescript"],
  tsx: ["typescript", "jsx"],
  jsx: ["jsx"],
};

let cached: Transpiler | null = null;
let loading: Promise<Transpiler> | null = null;

/** ロード済みなら同期で返す(composer は同期関数のため、呼び出し側が先に loadTranspiler で温める) */
export function loadedTranspiler(): Transpiler | null {
  return cached;
}

/**
 * sucrase を dynamic import してトランスパイラを返す(メモ化)。
 * `.ts/.tsx/.jsx` を含まないレッスンでは呼ばないこと(チャンクを読まない)。
 */
export function loadTranspiler(): Promise<Transpiler> {
  if (cached !== null) return Promise.resolve(cached);
  if (loading !== null) return loading;
  loading = import("sucrase").then(({ transform }) => {
    const transpiler: Transpiler = (source, lang) => {
      try {
        const { code } = transform(source, {
          transforms: TRANSFORMS[lang],
          // classic runtime: React.createElement / React.Fragment(vendor UMD のグローバルを参照)
          jsxRuntime: "classic",
          production: true,
          // 構文の downlevel はしない(sucrase は行番号を保存するため診断の行がずれない)
          disableESTransforms: true,
        });
        return { ok: true, code };
      } catch (e) {
        return { ok: false, error: toSyntaxDiag(source, e) };
      }
    };
    cached = transpiler;
    return transpiler;
  });
  return loading;
}

/** files が必要とするときだけ sucrase をロードする(不要なら即 resolve) */
export async function ensureTranspiler(files: FileMap): Promise<Transpiler | null> {
  if (!needsTranspile(files)) return loadedTranspiler();
  return loadTranspiler();
}
