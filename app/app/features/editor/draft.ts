// 下書き保存の純粋ロジック(DesignDoc §2.3 / SPEC E §2)。
// localStorage 依存を StorageLike で注入可能にし、node の vitest でテストする。
import type { FileMap } from "@codesteps/lesson-kit";

export type DraftData = { files: FileMap; savedAt: number };

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** 生成モジュール(lessons.client)の files と同形 */
export type LessonFileMap = Record<string, { initial: string; editable: boolean; hidden: boolean }>;

export function draftKey(lessonSlug: string): string {
  return `draft:${lessonSlug}`;
}

/** 下書きを読む。壊れた JSON・不正な形は null(復元しない) */
export function loadDraft(storage: StorageLike, lessonSlug: string): DraftData | null {
  try {
    const raw = storage.getItem(draftKey(lessonSlug));
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const { files, savedAt } = parsed as { files?: unknown; savedAt?: unknown };
    if (typeof files !== "object" || files === null || typeof savedAt !== "number") return null;
    const map: FileMap = {};
    for (const [name, value] of Object.entries(files)) {
      if (typeof value === "string") map[name] = value;
    }
    return { files: map, savedAt };
  } catch {
    return null;
  }
}

export function saveDraft(
  storage: StorageLike,
  lessonSlug: string,
  files: FileMap,
  now: number = Date.now(),
): void {
  try {
    const data: DraftData = { files, savedAt: now };
    storage.setItem(draftKey(lessonSlug), JSON.stringify(data));
  } catch {
    // ストレージ不可(プライベートモード・容量超過)は保存を諦める(学習は続行できる)
  }
}

export function clearDraft(storage: StorageLike, lessonSlug: string): void {
  try {
    storage.removeItem(draftKey(lessonSlug));
  } catch {
    // 破棄失敗は無害(次回 loadDraft の shape 検証で弾かれる可能性があるだけ)
  }
}

/**
 * 実行対象の全ファイル(hidden 含む)の FileMap を作る。
 * editable なファイルのみ下書きの値で復元し、教材更新等で消えた下書きキーは無視する。
 */
export function restoreFiles(lessonFiles: LessonFileMap, draft: DraftData | null): FileMap {
  const map: FileMap = {};
  for (const [name, file] of Object.entries(lessonFiles)) {
    const drafted = draft?.files[name];
    map[name] = file.editable && typeof drafted === "string" ? drafted : file.initial;
  }
  return map;
}

/** 下書き保存・提出(code)の対象 = 編集可能ファイルのみ(CONTRACTS §6.1) */
export function editableSubset(lessonFiles: LessonFileMap, files: FileMap): FileMap {
  const map: FileMap = {};
  for (const [name, file] of Object.entries(lessonFiles)) {
    if (!file.editable) continue;
    const value = files[name];
    if (typeof value === "string") map[name] = value;
  }
  return map;
}
