import { defineCourse } from "@codesteps/lesson-kit";

// slug は公開後不変(§4.1)。lessons の順序 = 学習順序。変更はオーケストレーターのみ。
export default defineCourse({
  slug: "react-basics",
  title: "React入門",
  description:
    "画面を「部品」で組み立てる React の考え方を。最初のコンポーネントから JSX・props・状態管理まで、UI づくりの定番を学びます。",
  order: 13,
  level: "intermediate",
  lessons: [
    "react-01-first-component",
    "react-02-jsx",
    "react-03-fragment-list",
    "react-04-props",
    "react-05-state",
    "react-06-events",
    "react-07-conditional",
    "react-08-render-list",
    "react-09-form-input",
    "react-10-counter-app",
  ],
});
