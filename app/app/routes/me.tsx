// マイページ(進捗・バッジ・ストリーク・自分の解答)。CONTRACTS §6: MypageData + { user }(requireUser)。
// ユーザーコードは必ずテキストとしてエスケープ描画(React の {} 描画。dangerouslySetInnerHTML 禁止 §10.2)。
import { Link } from "react-router";
import { requireUser } from "~/features/auth/auth.server";
import { getMypage } from "~/features/progress/index.server";
import { CourseProgressBar } from "~/features/progress/progress-bar";
import type { Route } from "./+types/me";

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = context.cloudflare.env;
  const user = await requireUser(request, env);
  const mypage = await getMypage(env, user.id);
  return { user, ...mypage };
}

const COURSE_ACCENT: Record<string, string> = {
  "html-basics": "var(--gdg-red)",
  "css-basics": "var(--gdg-blue)",
  "js-basics": "var(--gdg-yellow)",
};

export default function MyPage({ loaderData }: Route.ComponentProps) {
  const { user, stats, badges, courses, solutions, resume } = loaderData;
  const badgeTotal = badges.earned.length + badges.locked.length;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-bold text-2xl text-slate-900 tracking-tight">マイページ</h1>
        <p className="text-slate-500 text-sm">{user.name} さん、おかえりなさい</p>
      </div>

      {/* つづきから + 統計 */}
      <section className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex items-center justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {resume ? (
            <>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-medium text-slate-500 text-xs">
                  <span
                    aria-hidden="true"
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: "var(--gdg-blue)" }}
                  />
                  つづきから
                </p>
                <p className="mt-2 truncate font-bold text-slate-900 text-xl">{resume.lessonTitle}</p>
                <p className="mt-0.5 text-slate-500 text-sm">{resume.courseTitle}</p>
              </div>
              <Link
                to={
                  resume.target === "slides"
                    ? `/courses/${resume.courseSlug}/${resume.lessonSlug}/slides/1`
                    : `/courses/${resume.courseSlug}/${resume.lessonSlug}/exercise`
                }
                data-testid="resume-button"
                className="shrink-0 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-sm text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
              >
                {resume.target === "slides" ? "はじめる" : "つづける"} →
              </Link>
            </>
          ) : (
            <div className="flex w-full flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-bold text-lg text-slate-900">🎉 すべてのレッスンを完了しました!</p>
                <p className="mt-0.5 text-slate-500 text-sm">復習はコース一覧からいつでもできます。</p>
              </div>
              <Link
                to="/courses"
                data-testid="resume-button"
                className="shrink-0 rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 text-sm transition-colors hover:bg-slate-50"
              >
                コース一覧へ
              </Link>
            </div>
          )}
        </div>

        <section
          aria-label="学習の統計"
          className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 shadow-sm"
        >
          <div className="flex flex-col justify-center bg-white p-4 text-center">
            <p className="text-slate-500 text-xs">合格レッスン</p>
            <p className="mt-1 font-bold text-2xl text-slate-900" data-testid="total-passed">
              {stats.totalPassed}
            </p>
          </div>
          <div className="flex flex-col justify-center bg-white p-4 text-center">
            <p className="text-slate-500 text-xs">ストリーク</p>
            <p className="mt-1 font-bold text-2xl text-slate-900">
              🔥<span data-testid="streak-current">{stats.currentStreak}</span>
              <span className="ml-0.5 font-normal text-slate-500 text-sm">日</span>
            </p>
          </div>
          <div className="flex flex-col justify-center bg-white p-4 text-center">
            <p className="text-slate-500 text-xs">最長</p>
            <p className="mt-1 font-bold text-2xl text-slate-900">
              <span data-testid="streak-longest">{stats.longestStreak}</span>
              <span className="ml-0.5 font-normal text-slate-500 text-sm">日</span>
            </p>
          </div>
        </section>
      </section>

      {/* コース別進捗 */}
      <section className="mt-10">
        <h2 className="font-bold text-lg text-slate-900 tracking-tight">コース別の進捗</h2>
        {courses.length === 0 ? (
          <p className="mt-4 text-slate-500 text-sm">コースは準備中です。</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {courses.map((course) => (
              <Link
                key={course.slug}
                to={`/courses/${course.slug}`}
                data-testid={`mypage-course-${course.slug}`}
                className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                style={{ borderTopWidth: 3, borderTopColor: COURSE_ACCENT[course.slug] ?? "var(--gdg-blue)" }}
              >
                <p className="font-semibold text-slate-900">{course.title}</p>
                <div className="mt-3">
                  <CourseProgressBar passed={course.passedCount} total={course.lessonCount} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* バッジ */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-bold text-lg text-slate-900 tracking-tight">バッジ</h2>
          <p className="text-slate-500 text-xs tabular-nums">
            {badges.earned.length} / {badgeTotal}
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {badges.earned.map((badge) => (
            <div
              key={badge.id}
              data-testid={`badge-${badge.id}`}
              className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
            >
              <span className="text-2xl" aria-hidden="true">
                {badge.icon}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900 text-sm">{badge.title}</p>
                <p className="truncate text-slate-600 text-xs">{badge.description}</p>
              </div>
            </div>
          ))}
          {badges.locked.map((badge) => (
            <div
              key={badge.id}
              data-testid={`badge-locked-${badge.id}`}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              title={`条件: ${badge.description}`}
            >
              <span className="text-2xl opacity-40 grayscale" aria-hidden="true">
                {badge.icon}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-400 text-sm">{badge.title}</p>
                <p className="truncate text-slate-400 text-xs">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 自分の解答(最新の合格コード) */}
      <section className="mt-10">
        <h2 className="font-bold text-lg text-slate-900 tracking-tight">自分の解答</h2>
        {solutions.length === 0 ? (
          <p className="mt-4 text-slate-500 text-sm">合格したレッスンの解答がここに表示されます。</p>
        ) : (
          <div className="mt-4 space-y-2">
            {solutions.map((solution) => (
              <details
                key={solution.lessonSlug}
                data-testid={`solution-${solution.lessonSlug}`}
                className="rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <summary className="cursor-pointer px-4 py-2.5 font-medium text-slate-800 text-sm hover:text-indigo-600">
                  {solution.lessonTitle}
                </summary>
                <div className="space-y-3 border-slate-200 border-t px-4 py-3">
                  {Object.entries(solution.code).map(([fileName, content]) => (
                    <div key={fileName}>
                      <p className="font-mono text-slate-500 text-xs">{fileName}</p>
                      <pre className="mt-1 overflow-x-auto rounded-lg bg-slate-900 p-4 text-slate-100 text-sm">
                        <code>{content}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
