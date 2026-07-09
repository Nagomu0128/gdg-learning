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

export default function MyPage({ loaderData }: Route.ComponentProps) {
  const { user, stats, badges, courses, solutions, resume } = loaderData;
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-bold text-2xl text-slate-900">マイページ</h1>
      <p className="mt-1 text-slate-600 text-sm">{user.name} さん、おかえりなさい!</p>

      {/* つづきから */}
      <section className="mt-6">
        {resume ? (
          <Link
            to={
              resume.target === "slides"
                ? `/courses/${resume.courseSlug}/${resume.lessonSlug}/slides/1`
                : `/courses/${resume.courseSlug}/${resume.lessonSlug}/exercise`
            }
            data-testid="resume-button"
            className="block rounded-xl bg-indigo-600 px-6 py-4 text-center font-bold text-lg text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            つづきから学習する →
          </Link>
        ) : (
          courses.length > 0 && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-center font-semibold text-emerald-700">
              🎉 すべてのレッスンを完了しました!
            </p>
          )
        )}
      </section>

      {/* 統計 */}
      <section className="mt-8" aria-label="学習の統計">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <p className="text-slate-500 text-sm">合格したレッスン</p>
            <p className="mt-1 font-bold text-3xl text-slate-900" data-testid="total-passed">
              {stats.totalPassed}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <p className="text-slate-500 text-sm">現在のストリーク</p>
            <p className="mt-1 font-bold text-3xl text-slate-900">
              🔥 <span data-testid="streak-current">{stats.currentStreak}</span>
              <span className="ml-1 font-normal text-base text-slate-500">日</span>
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <p className="text-slate-500 text-sm">最長ストリーク</p>
            <p className="mt-1 font-bold text-3xl text-slate-900">
              <span data-testid="streak-longest">{stats.longestStreak}</span>
              <span className="ml-1 font-normal text-base text-slate-500">日</span>
            </p>
          </div>
        </div>
      </section>

      {/* バッジ */}
      <section className="mt-10">
        <h2 className="font-bold text-slate-900 text-xl">バッジ</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {badges.earned.map((badge) => (
            <div
              key={badge.id}
              data-testid={`badge-${badge.id}`}
              className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl" aria-hidden="true">
                  {badge.icon}
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{badge.title}</p>
                  <p className="text-slate-600 text-xs">{badge.description}</p>
                </div>
              </div>
            </div>
          ))}
          {badges.locked.map((badge) => (
            <div
              key={badge.id}
              data-testid={`badge-locked-${badge.id}`}
              className="rounded-xl border border-slate-200 bg-slate-100 p-4 opacity-70"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl grayscale" aria-hidden="true">
                  {badge.icon}
                </span>
                <div>
                  <p className="font-semibold text-slate-500">{badge.title}</p>
                  <p className="text-slate-500 text-xs">条件: {badge.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* コース別進捗 */}
      <section className="mt-10">
        <h2 className="font-bold text-slate-900 text-xl">コース別の進捗</h2>
        {courses.length === 0 ? (
          <p className="mt-4 text-slate-500 text-sm">コースは準備中です。</p>
        ) : (
          <div className="mt-4 space-y-4">
            {courses.map((course) => (
              <div
                key={course.slug}
                data-testid={`mypage-course-${course.slug}`}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <Link
                    to={`/courses/${course.slug}`}
                    className="font-semibold text-slate-900 hover:text-indigo-600 hover:underline"
                  >
                    {course.title}
                  </Link>
                </div>
                <div className="mt-3">
                  <CourseProgressBar passed={course.passedCount} total={course.lessonCount} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 自分の解答(最新の合格コード) */}
      <section className="mt-10">
        <h2 className="font-bold text-slate-900 text-xl">自分の解答</h2>
        {solutions.length === 0 ? (
          <p className="mt-4 text-slate-500 text-sm">合格したレッスンの解答がここに表示されます。</p>
        ) : (
          <div className="mt-4 space-y-3">
            {solutions.map((solution) => (
              <details
                key={solution.lessonSlug}
                data-testid={`solution-${solution.lessonSlug}`}
                className="rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <summary className="cursor-pointer px-5 py-3 font-semibold text-slate-900 hover:text-indigo-600">
                  {solution.lessonTitle}
                </summary>
                <div className="space-y-3 border-slate-200 border-t px-5 py-4">
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
