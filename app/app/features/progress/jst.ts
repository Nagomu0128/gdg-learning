// JST 日付ユーティリティ(DesignDoc §2.5, §9.2 / CONTRACTS §5)。
// 記録は UTC epoch ms、日付境界の判定のみ JST(+9h して YYYY-MM-DD 化)。純粋関数。

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** epoch ms を JST の日付文字列 "YYYY-MM-DD" に変換する */
export function jstDateString(epochMs: number): string {
  return new Date(epochMs + JST_OFFSET_MS).toISOString().slice(0, 10);
}

/** "YYYY-MM-DD" の前日を返す(月・年跨ぎ、うるう年対応) */
export function jstYesterday(dateStr: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) {
    throw new Error(`invalid date string: ${dateStr}`);
  }
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
