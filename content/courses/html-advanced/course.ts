import { defineCourse } from "@codesteps/lesson-kit";

// slug は公開後不変(§4.1)。lessons の順序 = 学習順序。変更はオーケストレーターのみ。
export default defineCourse({
  slug: "html-advanced",
  title: "HTML上級",
  description:
    "HTML の表現力を最大まで。details / dialog / template / data-* 属性・メタ情報・レスポンシブ画像・ランドマークを学びます。",
  order: 7,
  level: "advanced",
  lessons: [
    "html-adv-01-details",
    "html-adv-02-dialog",
    "html-adv-03-data-attr",
    "html-adv-04-template",
    "html-adv-05-meta",
    "html-adv-06-table-a11y",
    "html-adv-07-fieldset",
    "html-adv-08-srcset",
    "html-adv-09-landmarks",
    "html-adv-10-product",
  ],
});
