// バッジ定義の server 実体: content-meta のコース一覧を buildAchievements に注入して組み立てる。
// achievements.ts 本体のクライアント安全(server 専用 import なし)を守るため、
// content-meta.server への依存はこのモジュールに閉じる。
import { listCourseMeta } from "~/features/progress/content-meta.server";
import { type AchievementDef, buildAchievements } from "./achievements";

// content-meta はビルド時埋め込みで不変のため、モジュール初期化時に一度だけ組み立てる
export const ACHIEVEMENTS: AchievementDef[] = buildAchievements(
  listCourseMeta().map((course) => ({ slug: course.slug, title: course.title, level: course.level })),
);
