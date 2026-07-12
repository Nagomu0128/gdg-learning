import { defineCourse } from "@codesteps/lesson-kit";

// slug は公開後不変(§4.1)。lessons の順序 = 学習順序。変更はオーケストレーターのみ。
export default defineCourse({
  slug: "ts-basics",
  title: "TypeScript入門",
  description:
    "JavaScript に「型」という安全装置を。型注釈の書き方から、関数・オブジェクトの型付けまで、TypeScript の基本を一歩ずつ学びます。",
  order: 11,
  level: "intermediate",
  lessons: [
    "ts-01-hello-types",
    "ts-02-annotations",
    "ts-03-arrays-objects",
    "ts-04-function-types",
    "ts-05-union-narrowing",
    "ts-06-literal-alias",
    "ts-07-interface",
    "ts-08-optional-readonly",
    "ts-09-generics",
    "ts-10-typed-module",
  ],
});
