import { defineCourse } from "@codesteps/lesson-kit";

// slug は公開後不変(§4.1)。lessons の順序 = 学習順序。変更はオーケストレーターのみ。
export default defineCourse({
  slug: "git",
  title: "Git実践",
  description:
    "コードの歴史を記録し、安心して変更できるように。init・add・commit の基本から、ブランチ・マージ・リモートまで、チーム開発の土台を学びます。",
  order: 17,
  level: "intermediate",
  lessons: [
    "git-01-init",
    "git-02-add-commit",
    "git-03-status-log",
    "git-04-diff",
    "git-05-branch-create",
    "git-06-switch",
    "git-07-merge-ff",
    "git-08-merge-3way",
    "git-09-merge-conflict",
    "git-10-rebase",
    "git-11-rebase-conflict",
    "git-12-push",
    "git-13-pull-fetch",
    "git-14-team-flow",
  ],
});
