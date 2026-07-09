// submissions.code の保持ポリシー(DesignDoc §7.5)。純粋関数 — 抽出条件の SSOT。
// runRetention(index.server.ts)の SQL はこの規則を写したもの。変更時は両方を揃えること。
//   条件: created_at < now - 90日 AND code IS NOT NULL
//   除外: 各 user × lesson の最新の合格提出(id は ULID = 時系列ソート可能なので max(id) が最新)

export const RETENTION_DAYS = 90;
export const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

export type RetentionRow = {
  id: string;
  userId: string;
  lessonSlug: string;
  passed: number; // 0 / 1
  createdAt: number; // epoch ms
  hasCode: boolean;
};

function groupKey(row: RetentionRow): string {
  // lessonSlug は /^[a-z0-9-]+$/ なので "/" は区切りとして安全
  return `${row.userId}/${row.lessonSlug}`;
}

/** code を NULL 化すべき提出 id を返す */
export function computeRetentionTargets(rows: RetentionRow[], nowMs: number): string[] {
  const cutoff = nowMs - RETENTION_MS;
  const latestPassedByKey = new Map<string, string>();
  for (const row of rows) {
    if (row.passed !== 1) continue;
    const key = groupKey(row);
    const current = latestPassedByKey.get(key);
    if (current === undefined || row.id > current) {
      latestPassedByKey.set(key, row.id);
    }
  }
  return rows
    .filter((row) => {
      if (!row.hasCode || row.createdAt >= cutoff) return false;
      return latestPassedByKey.get(groupKey(row)) !== row.id;
    })
    .map((row) => row.id);
}
