// LP(サービス紹介)。CONTRACTS §6: loader は { user, courses } を返す。未ログインでも閲覧可。
import { Link } from "react-router";
import { getOptionalUser } from "~/features/auth/auth.server";
import { getCoursesOverview } from "~/features/progress/index.server";
import { SITE_NAME, SITE_TAGLINE } from "~/lib/site";
import type { Route } from "./+types/_index";

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = context.cloudflare.env;
  const user = await getOptionalUser(request, env);
  const courses = await getCoursesOverview(env, user?.id ?? null);
  return { user, courses };
}

const FEATURES = [
  {
    icon: "📖",
    title: "スライドで学ぶ",
    body: "紙芝居形式のスライドで、ひとつずつ着実に理解できます。自分のペースで進めましょう。",
  },
  {
    icon: "⌨️",
    title: "ブラウザ内エディタ",
    body: "環境構築は不要。ブラウザの中のエディタでコードを書き、その場でプレビューできます。",
  },
  {
    icon: "✅",
    title: "すぐに判定",
    body: "「できた!」を押した瞬間に自動judge。どこを直せばよいかを日本語でフィードバックします。",
  },
];

export default function Index({ loaderData }: Route.ComponentProps) {
  const { user, courses } = loaderData;
  return (
    <main>
      {/* ヒーロー */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center sm:py-24">
          <h1 className="font-bold text-4xl text-slate-900 sm:text-5xl">{SITE_NAME}</h1>
          <p className="mt-4 text-lg text-slate-600 sm:text-xl">{SITE_TAGLINE}</p>
          <p className="mt-2 text-slate-500 text-sm">
            HTML・CSS・JavaScript をゼロからステップアップ。すべて無料で学べます。
          </p>
          <div className="mt-8">
            <Link
              to="/courses"
              data-testid="cta-start"
              className="inline-block rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              {user ? "学習をつづける" : "無料ではじめる"}
            </Link>
          </div>
        </div>
      </section>

      {/* 特徴 3 カード */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="text-center font-bold text-2xl text-slate-900">学び方はシンプル</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-3xl" aria-hidden="true">
                {f.icon}
              </div>
              <h3 className="mt-3 font-semibold text-lg text-slate-900">{f.title}</h3>
              <p className="mt-2 text-slate-600 text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* コース紹介 */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="text-center font-bold text-2xl text-slate-900">コース</h2>
        {courses.length === 0 ? (
          <p className="mt-6 text-center text-slate-500 text-sm">コースは準備中です。</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {courses.map((course) => (
              <Link
                key={course.slug}
                to={`/courses/${course.slug}`}
                data-testid={`lp-course-${course.slug}`}
                className="block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="font-semibold text-lg text-slate-900">{course.title}</h3>
                <p className="mt-2 text-slate-600 text-sm leading-relaxed">{course.description}</p>
                <p className="mt-3 text-slate-500 text-xs">全 {course.lessonCount} レッスン</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* サイト共通フッターは root.tsx(C 所有)が描画する */}
    </main>
  );
}
