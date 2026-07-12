import { defineCourse } from "@codesteps/lesson-kit";

// slug は公開後不変(§4.1)。lessons の順序 = 学習順序。変更はオーケストレーターのみ。
export default defineCourse({
  slug: "react-intermediate",
  title: "React中級",
  description:
    "React入門の次の一歩。副作用(useEffect)・オブジェクトや配列の state・コンポーネント間での関数の受け渡し・useRef / useReducer まで、動く UI を組み立てる実戦的なパターンを学びます。",
  order: 14,
  level: "advanced",
  lessons: [
    "react-int-01-effect",
    "react-int-02-object-state",
    "react-int-03-list-add",
    "react-int-04-list-remove",
    "react-int-05-callback-props",
    "react-int-06-derived",
    "react-int-07-ref",
    "react-int-08-controlled-form",
    "react-int-09-reducer",
    "react-int-10-todo",
  ],
});
