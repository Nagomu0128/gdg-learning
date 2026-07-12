import { defineCourse } from "@codesteps/lesson-kit";

// slug は公開後不変(§4.1)。lessons の順序 = 学習順序。
export default defineCourse({
  slug: "libs-intermediate",
  title: "ライブラリ活用",
  description:
    "入門で触れた dayjs・lodash・zod を一歩踏み込んで使いこなす。並べ替え・データ変換・ネストしたスキーマ・カスタム検証から、複数ライブラリを組み合わせた集計までを学びます。",
  order: 16,
  level: "advanced",
  lessons: [
    "lib-int-01-dayjs-tokens",
    "lib-int-02-lodash-order",
    "lib-int-03-lodash-keyby",
    "lib-int-04-lodash-get",
    "lib-int-05-zod-nested",
    "lib-int-06-zod-refine",
    "lib-int-07-combine-aggregate",
    "lib-int-08-mini-app",
  ],
});
