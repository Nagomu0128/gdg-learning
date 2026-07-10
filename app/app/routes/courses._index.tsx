// コース一覧。CONTRACTS §6: loader は { user, courses } を返す。ログイン必須(ADR #17)。
// コースはレベル(基礎編/中級編/上級編/応用編 — ADR #19)ごとのセクションで表示する。
import { Link } from "react-router";
import { requireUser } from "~/features/auth/auth.server";
import { getCoursesOverview } from "~/features/progress/index.server";
import { groupCoursesByLevel } from "~/features/progress/levels";
import { CourseProgressBar } from "~/features/progress/progress-bar";
import type { Route } from "./+types/courses._index";

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = context.cloudflare.env;
  const user = await requireUser(request, env);
  const courses = await getCoursesOverview(env, user.id);
  return { user, courses };
}

export default function CoursesIndex({ loaderData }: Route.ComponentProps) {
  const { courses } = loaderData;
  const sections = groupCoursesByLevel(courses);
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-bold text-2xl text-slate-900">コース一覧</h1>
      <p className="mt-1 text-slate-600 text-sm">好きなコースからはじめましょう。</p>
      {sections.length === 0 ? (
        <p className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-slate-500 text-sm shadow-sm">
          コースは準備中です。
        </p>
      ) : (
        sections.map((section) => (
          <section key={section.level} data-testid={`level-section-${section.level}`} className="mt-10">
            <h2 className="font-bold text-lg text-slate-900 tracking-tight">{section.label}</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {section.courses.map((course) => (
                <div
                  key={course.slug}
                  data-testid={`course-card-${course.slug}`}
                  className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <h3 className="font-semibold text-lg text-slate-900">{course.title}</h3>
                  <p className="mt-2 flex-1 text-slate-600 text-sm leading-relaxed">{course.description}</p>
                  <div className="mt-4">
                    <CourseProgressBar passed={course.passedCount} total={course.lessonCount} />
                  </div>
                  <Link
                    to={`/courses/${course.slug}`}
                    className="mt-4 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-center font-semibold text-sm text-white transition-colors hover:bg-indigo-700"
                  >
                    {course.passedCount > 0 ? "つづける" : "はじめる"}
                  </Link>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  );
}
