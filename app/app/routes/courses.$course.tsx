// コース詳細(レッスン一覧 + 進捗バー)。CONTRACTS §6: loader は { user, course } を返す(404 対応)。
// flatRoutes ではこのルートが courses.$course.$lesson.* の親レイアウトになるため、
// 子ルート(スライド・演習)がマッチしているときは Outlet だけを描画する。
import { Link, Outlet, useParams } from "react-router";
import { getOptionalUser } from "~/features/auth/auth.server";
import { getCourseDetail, type LessonStatus } from "~/features/progress/index.server";
import { CourseProgressBar } from "~/features/progress/progress-bar";
import type { Route } from "./+types/courses.$course";

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const env = context.cloudflare.env;
  const user = await getOptionalUser(request, env);
  const course = await getCourseDetail(env, user?.id ?? null, params.course);
  if (!course) {
    throw new Response("コースが見つかりません", { status: 404 });
  }
  return { user, course };
}

const STATUS_ICON: Record<LessonStatus, { mark: string; label: string; className: string }> = {
  passed: { mark: "✓", label: "合格", className: "bg-emerald-100 text-emerald-700" },
  in_progress: { mark: "▶", label: "学習中", className: "bg-indigo-100 text-indigo-700" },
  not_started: { mark: "○", label: "未着手", className: "bg-slate-100 text-slate-500" },
};

export default function CourseDetailPage({ loaderData, params }: Route.ComponentProps) {
  // 子ルート(slides / exercise)がマッチしているときはそのまま描画を委譲する
  const childParams = useParams();
  if (childParams.lesson) {
    return <Outlet />;
  }

  const { course } = loaderData;
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <nav className="text-slate-500 text-sm">
        <Link to="/courses" className="hover:text-indigo-600 hover:underline">
          コース一覧
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span className="text-slate-700">{course.title}</span>
      </nav>

      <header className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="font-bold text-2xl text-slate-900">{course.title}</h1>
        <p className="mt-2 text-slate-600 text-sm leading-relaxed">{course.description}</p>
        <div className="mt-4">
          <CourseProgressBar
            passed={course.passedCount}
            total={course.lessonCount}
            testId="course-progress"
          />
        </div>
      </header>

      <ol className="mt-6 space-y-3">
        {course.lessons.map((lesson) => {
          const icon = STATUS_ICON[lesson.status];
          return (
            <li
              key={lesson.slug}
              data-testid={`lesson-item-${lesson.slug}`}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-semibold text-sm ${icon.className}`}
                role="img"
                title={icon.label}
                aria-label={icon.label}
              >
                {icon.mark}
              </span>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/courses/${params.course}/${lesson.slug}/slides/1`}
                  className="font-semibold text-slate-900 hover:text-indigo-600 hover:underline"
                >
                  {lesson.order}. {lesson.title}
                </Link>
                <p className="mt-0.5 text-slate-500 text-xs">約{lesson.estMinutes}分</p>
              </div>
              {lesson.status !== "not_started" && (
                <Link
                  to={`/courses/${params.course}/${lesson.slug}/exercise`}
                  data-testid={`lesson-exercise-link-${lesson.slug}`}
                  className="shrink-0 rounded-xl border border-indigo-200 px-3 py-1.5 font-semibold text-indigo-600 text-sm transition-colors hover:bg-indigo-50"
                >
                  演習へ
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </main>
  );
}
