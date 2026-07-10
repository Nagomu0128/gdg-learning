import { defineCourse } from "@codesteps/lesson-kit";

// slug は公開後不変(§4.1)。lessons の順序 = 学習順序。変更はオーケストレーターのみ。
export default defineCourse({
  slug: "js-basics",
  title: "JavaScript入門",
  description:
    "プログラミングの基礎をJavaScriptで。変数・条件分岐・ループ・関数から、ページを動かすDOM操作まで一歩ずつ学びます。",
  order: 3,
  level: "basic",
  lessons: [
    "js-01-hello",
    "js-02-variables",
    "js-03-calc",
    "js-04-if",
    "js-05-loop",
    "js-06-function",
    "js-07-array",
    "js-08-object",
    "js-09-array-methods",
    "js-10-fizzbuzz",
    "js-11-dom",
    "js-12-events",
  ],
});
