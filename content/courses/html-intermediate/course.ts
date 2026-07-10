import { defineCourse } from "@codesteps/lesson-kit";

// slug は公開後不変(§4.1)。lessons の順序 = 学習順序。変更はオーケストレーターのみ。
export default defineCourse({
  slug: "html-intermediate",
  title: "HTML中級",
  description:
    "文書を設計する HTML へ。セクション分け・図版・構造化された表・フォーム部品と入力チェック・アクセシビリティを学びます。",
  order: 4,
  level: "intermediate",
  lessons: [
    "html-int-01-sections",
    "html-int-02-outline",
    "html-int-03-links-plus",
    "html-int-04-figure",
    "html-int-05-nested-lists",
    "html-int-06-table-plus",
    "html-int-07-form-controls",
    "html-int-08-form-validation",
    "html-int-09-a11y",
    "html-int-10-blog",
  ],
});
