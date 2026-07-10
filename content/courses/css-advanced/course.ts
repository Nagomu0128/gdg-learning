import { defineCourse } from "@codesteps/lesson-kit";

// slug は公開後不変(§4.1)。lessons の順序 = 学習順序。変更はオーケストレーターのみ。
export default defineCourse({
  slug: "css-advanced",
  title: "CSS上級",
  description:
    "設計できる CSS へ。カスタムプロパティ・calc・メディアクエリ・擬似要素・@keyframes・sticky・z-index・Grid 上級を学びます。",
  order: 8,
  level: "advanced",
  lessons: [
    "css-adv-01-variables",
    "css-adv-02-calc",
    "css-adv-03-media",
    "css-adv-04-pseudo-elements",
    "css-adv-05-keyframes",
    "css-adv-06-object-fit",
    "css-adv-07-sticky",
    "css-adv-08-z-index",
    "css-adv-09-grid-plus",
    "css-adv-10-landing",
  ],
});
