import { defineCourse } from "@codesteps/lesson-kit";

// slug は公開後不変(§4.1)。lessons の順序 = 学習順序。変更はオーケストレーターのみ。
export default defineCourse({
  slug: "ts-intermediate",
  title: "TypeScript中級",
  description:
    "入門で身につけた型注釈の先へ。判別可能なユニオン型・ジェネリクスの制約・ユーティリティ型など、実践で型を設計するための道具を一歩ずつ学びます。",
  order: 12,
  level: "advanced",
  lessons: ["ts-int-01-union-discriminated", "ts-int-02-optional-params"],
});
