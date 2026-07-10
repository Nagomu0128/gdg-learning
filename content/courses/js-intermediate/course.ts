import { defineCourse } from "@codesteps/lesson-kit";

// slug は公開後不変(§4.1)。lessons の順序 = 学習順序。変更はオーケストレーターのみ。
export default defineCourse({
  slug: "js-intermediate",
  title: "JavaScript中級",
  description:
    "データを操り、画面を動かす。配列メソッド・分割代入・文字列加工から、DOM 生成・イベント応用・タイマーまでを学びます。",
  order: 6,
  level: "intermediate",
  lessons: [
    "js-int-01-functions-plus",
    "js-int-02-scope",
    "js-int-03-filter-find",
    "js-int-04-reduce",
    "js-int-05-objects-plus",
    "js-int-06-strings",
    "js-int-07-dom-create",
    "js-int-08-render-list",
    "js-int-09-classlist",
    "js-int-10-input-event",
    "js-int-11-timers",
    "js-int-12-counter",
  ],
});
