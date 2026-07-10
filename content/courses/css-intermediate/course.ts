import { defineCourse } from "@codesteps/lesson-kit";

// slug は公開後不変(§4.1)。lessons の順序 = 学習順序。変更はオーケストレーターのみ。
export default defineCourse({
  slug: "css-intermediate",
  title: "CSS中級",
  description:
    "レイアウトを自在に。セレクタ応用・詳細度・単位の使い分け・position・Flexbox 応用・Grid・transition・transform を学びます。",
  order: 5,
  level: "intermediate",
  lessons: [
    "css-int-01-selectors-plus",
    "css-int-02-specificity",
    "css-int-03-units",
    "css-int-04-position",
    "css-int-05-flex-plus",
    "css-int-06-grid",
    "css-int-07-grid-layout",
    "css-int-08-transitions",
    "css-int-09-transforms",
    "css-int-10-hero",
  ],
});
