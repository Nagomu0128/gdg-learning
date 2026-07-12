import { defineCourse } from "@codesteps/lesson-kit";

// slug は公開後不変(§4.1)。lessons の順序 = 学習順序。
export default defineCourse({
  slug: "team-dev",
  title: "チーム開発入門",
  description:
    "ひとりの開発から、みんなでの開発へ。ブランチ戦略・コミットメッセージ・プルリクエスト・コードレビューまで、チームで安全に開発を進めるための「考え方」と型を学びます。",
  order: 18,
  level: "intermediate",
  lessons: ["team-01-why"],
});
