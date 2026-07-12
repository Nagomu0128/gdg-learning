import { defineCourse } from "@codesteps/lesson-kit";

// slug は公開後不変(§4.1)。lessons の順序 = 学習順序。変更はオーケストレーターのみ。
export default defineCourse({
  slug: "libs-basics",
  title: "ライブラリ入門",
  description:
    "先人の書いたコードを借りて、速く・正確に作る。script タグでのライブラリ導入から、dayjs・lodash・zod の使いどころまでを学びます。",
  order: 15,
  level: "intermediate",
  lessons: [
    "lib-01-script-tag",
    "lib-02-dayjs-format",
    "lib-03-dayjs-calc",
    "lib-04-lodash-array",
    "lib-05-lodash-collection",
    "lib-06-zod-schema",
    "lib-07-zod-validate",
    "lib-08-combine",
  ],
});
