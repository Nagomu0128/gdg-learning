import { defineCourse } from "@codesteps/lesson-kit";

// slug は公開後不変(§4.1)。lessons の順序 = 学習順序。変更はオーケストレーターのみ。
export default defineCourse({
  slug: "html-basics",
  title: "HTML入門",
  description:
    "Webページの骨組みをつくるHTML。見出し・リンク・画像・リストなどの基本タグを、手を動かしながらゼロから学びます。",
  order: 1,
  level: "basic",
  lessons: [
    "html-01-first-page",
    "html-02-headings",
    "html-03-links",
    "html-04-images",
    "html-05-lists",
    "html-06-table",
    "html-07-form",
    "html-08-semantic",
    "html-09-id-class",
    "html-10-profile",
  ],
});
