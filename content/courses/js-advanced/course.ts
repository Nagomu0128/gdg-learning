import { defineCourse } from "@codesteps/lesson-kit";

// slug は公開後不変(§4.1)。lessons の順序 = 学習順序。変更はオーケストレーターのみ。
export default defineCourse({
  slug: "js-advanced",
  title: "JavaScript上級",
  description:
    "本格的なプログラミングへ。クラス・クロージャ・Promise / async・エラー処理・Map / Set・正規表現・状態駆動の UI を学びます。",
  order: 9,
  level: "advanced",
  lessons: [
    "js-adv-01-class",
    "js-adv-02-inheritance",
    "js-adv-03-closure",
    "js-adv-04-higher-order",
    "js-adv-05-promise",
    "js-adv-06-async-await",
    "js-adv-07-try-catch",
    "js-adv-08-map-set",
    "js-adv-09-regex",
    "js-adv-10-delegation",
    "js-adv-11-render-state",
    "js-adv-12-todo",
  ],
});
