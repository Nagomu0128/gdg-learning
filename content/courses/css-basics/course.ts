import { defineCourse } from "@codesteps/lesson-kit";

// slug は公開後不変(§4.1)。lessons の順序 = 学習順序。変更はオーケストレーターのみ。
export default defineCourse({
  slug: "css-basics",
  title: "CSS入門",
  description:
    "ページに色・形・レイアウトを与えるCSS。セレクタの書き方からボックスモデル、Flexboxまで、飾りながら学びます。",
  order: 2,
  level: "basic",
  lessons: [
    "css-01-color",
    "css-02-text",
    "css-03-selectors",
    "css-04-box",
    "css-05-size",
    "css-06-display",
    "css-07-flex",
    "css-08-flex-center",
    "css-09-hover",
    "css-10-card",
  ],
});
