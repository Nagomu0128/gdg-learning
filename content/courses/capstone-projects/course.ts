import { defineCourse } from "@codesteps/lesson-kit";

// slug は公開後不変(§4.1)。lessons の順序 = 学習順序。変更はオーケストレーターのみ。
export default defineCourse({
  slug: "capstone-projects",
  title: "応用編: つくってみよう",
  description:
    "HTML・CSS・JavaScript を全部使って、ゼロから自分の作品を組み上げる制作課題。判定は核となる要件だけ — デザインも実装も自由です。",
  order: 10,
  level: "capstone",
  lessons: ["cap-01-profile-card", "cap-02-omikuji", "cap-03-stopwatch", "cap-04-quiz", "cap-05-todo-app"],
});
