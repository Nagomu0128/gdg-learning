// 比較セマンティクス(DesignDoc §5.3)。正規形に落としてから比較する。

import type { TextCheck } from "./types";

/** 既定: 前後 trim + 連続空白(改行含む)を半角スペース 1 つに畳む。exact:true で無効化 */
export function normalizeText(s: string, opts?: { exact?: boolean }): string {
  if (opts?.exact) return s;
  return s.replace(/\s+/g, " ").trim();
}

export function textMatches(actual: string, check: TextCheck): boolean {
  const normalize = (s: string) => {
    let out = normalizeText(s, { exact: check.exact });
    if (check.ignoreCase) out = out.toLowerCase();
    return out;
  };
  const subject = normalize(actual);
  if (check.equals !== undefined) {
    if (subject !== normalize(check.equals)) return false;
  }
  if (check.contains !== undefined) {
    if (!subject.includes(normalize(check.contains))) return false;
  }
  if (check.pattern !== undefined) {
    const flags = check.flags ?? (check.ignoreCase ? "i" : "");
    if (!new RegExp(check.pattern, flags).test(subject)) return false;
  }
  return true;
}

/** deepEqual。NaN === NaN は真(§5.3)。プレーンなデータ(structured clone 範囲)前提 */
export function deepEqualWithNaN(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a === "number" && typeof b === "number") {
    return Number.isNaN(a) && Number.isNaN(b);
  }
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object") {
    return false;
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqualWithNaN(v, b[i]));
  }
  const ak = Object.keys(a as Record<string, unknown>);
  const bk = Object.keys(b as Record<string, unknown>);
  if (ak.length !== bk.length) return false;
  return ak.every(
    (k) =>
      Object.hasOwn(b as object, k) &&
      deepEqualWithNaN((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]),
  );
}

/**
 * console check の照合(CONTRACTS §2)。
 * 各期待行は normalizeText 後の完全一致で存在すること。
 * ordered=true のときは expected が actual の部分列(順序保存)であること。
 */
export function consoleLinesMatch(actual: string[], expected: string[], ordered: boolean): boolean {
  const normActual = actual.map((s) => normalizeText(s));
  const normExpected = expected.map((s) => normalizeText(s));
  if (ordered) {
    let i = 0;
    for (const line of normActual) {
      if (i < normExpected.length && line === normExpected[i]) i++;
    }
    return i === normExpected.length;
  }
  const pool = [...normActual];
  for (const line of normExpected) {
    const idx = pool.indexOf(line);
    if (idx === -1) return false;
    pool.splice(idx, 1);
  }
  return true;
}
