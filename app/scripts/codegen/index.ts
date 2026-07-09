// 教材 codegen エントリ(CONTRACTS §8)。tsx で実行。`--validate-only` で検証のみ。
// STUB(scaffold): 空レジストリを出力し、コンテンツ未生成でも typecheck/build を通す。
// B が lessons.ts / judge-bundle.ts / validate.ts を、D が slides.ts を差し替える。
import { generateLessons } from "./lessons";
import { generateSlides } from "./slides";

const validateOnly = process.argv.includes("--validate-only");

async function main(): Promise<void> {
  if (validateOnly) {
    // STUB(B が実装): 検証ステージ1(zod parse + slug 重複 + course.lessons と実ディレクトリの 1:1)
    console.log("[codegen] --validate-only: 検証スタブ(B が実装)。何もせず正常終了します");
    return;
  }
  await generateLessons();
  await generateSlides();
  console.log("[codegen] 完了(スタブ出力)");
}

main().catch((err) => {
  console.error("[codegen] 失敗:", err);
  process.exit(1);
});
