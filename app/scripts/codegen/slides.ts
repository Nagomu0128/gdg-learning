// STUB(D が実装): MDX スライドをコンパイルしてレッスン単位チャンクの loadSlide を生成する。
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const generatedDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../app/generated");

const SLIDES_CLIENT = `// 自動生成ファイル(scripts/codegen が出力。コミットしない)
// loadSlide はスタブ(D の codegen が本実装を生成する)。n は 1 始まり。
import type * as React from "react";

export function loadSlide(lessonSlug: string, n: number): Promise<{ default: React.ComponentType }> {
  throw new Error(\`unknown slide: \${lessonSlug}/\${n}\`);
}
`;

export async function generateSlides(): Promise<void> {
  await mkdir(generatedDir, { recursive: true });
  await writeFile(path.join(generatedDir, "slides.client.ts"), SLIDES_CLIENT, "utf8");
}
