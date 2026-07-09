// STUB(B が実装): content/ を走査してレッスンモジュール群 + レジストリ + content-meta.json を生成する。
// 現状は空レジストリを出力する(CONTRACTS §3.1: scaffold のスタブ codegen は空レジストリを出力)。
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const generatedDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../app/generated");

const CONTENT_META = `${JSON.stringify({ contentVersion: "dev", courses: [] }, null, 2)}\n`;

const LESSONS_CLIENT = `// 自動生成ファイル(scripts/codegen が出力。コミットしない)
// LoadedLesson 型は契約(CONTRACTS §3.1)。loadLesson はスタブ(B の codegen が本実装を生成する)。

export type LoadedLesson = {
  meta: {
    slug: string;
    title: string;
    estMinutes: number;
    runner: "dom" | "worker";
    courseSlug: string;
    order: number;
    slideCount: number;
    hintCount: number;
  };
  files: Record<string, { initial: string; editable: boolean; hidden: boolean }>;
  hints: string[];
  solution: Record<string, string>;
  judgeBundle: string;
};

export function loadLesson(slug: string): Promise<LoadedLesson> {
  throw new Error(\`unknown lesson: \${slug}\`);
}
`;

export async function generateLessons(): Promise<void> {
  await mkdir(generatedDir, { recursive: true });
  await writeFile(path.join(generatedDir, "content-meta.json"), CONTENT_META, "utf8");
  await writeFile(path.join(generatedDir, "lessons.client.ts"), LESSONS_CLIENT, "utf8");
}
