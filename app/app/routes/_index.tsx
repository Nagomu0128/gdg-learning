// LP(サービス紹介)。コース閲覧はログイン必須(ADR #17)のため、LP は静的な紹介 + ログイン導線に徹する。
import { Link } from "react-router";
import { getOptionalUser } from "~/features/auth/auth.server";
import { authClient } from "~/features/auth/auth-client";
import { getCoursesOverview } from "~/features/progress/index.server";
import { SITE_NAME } from "~/lib/site";
import type { Route } from "./+types/_index";

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = context.cloudflare.env;
  const user = await getOptionalUser(request, env);
  // コース紹介の文言・レッスン数のみ利用(コース本体はログイン後 — ADR #17)
  const courses = await getCoursesOverview(env, user?.id ?? null);
  return { user, courses, devLoginEnabled: env.DEV_LOGIN === "1" };
}

const GDG = {
  blue: "var(--gdg-blue)",
  red: "var(--gdg-red)",
  yellow: "var(--gdg-yellow)",
  green: "var(--gdg-green)",
} as const;

const STEPS = [
  {
    color: GDG.blue,
    title: "スライドで理解する",
    body: "紙芝居形式のスライドを、自分のペースでめくりながら学びます。",
  },
  {
    color: GDG.red,
    title: "エディタで書く",
    body: "環境構築なし。ブラウザのエディタで書けば、隣にすぐ結果が映ります。",
  },
  {
    color: GDG.yellow,
    title: "「できた!」で判定",
    body: "提出した瞬間に自動判定。直すべき場所を日本語で1つずつ示します。",
  },
  {
    color: GDG.green,
    title: "クリアして次へ",
    body: "合格したら次のレッスンへ。連続学習の記録とバッジが積み上がります。",
  },
] as const;

const COURSE_ACCENT: Record<string, string> = {
  "html-basics": GDG.red,
  "css-basics": GDG.blue,
  "js-basics": GDG.yellow,
};

function StartButton({
  loggedIn,
  tone,
  testid,
}: {
  loggedIn: boolean;
  tone: "blue" | "white";
  testid: string;
}) {
  const className =
    tone === "blue"
      ? "inline-flex items-center gap-2 rounded-xl bg-[#4285F4] px-8 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-[#3367d6] focus-visible:outline-2 focus-visible:outline-[#4285F4] focus-visible:outline-offset-2"
      : "inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2";
  if (loggedIn) {
    return (
      <Link to="/courses" data-testid={testid} className={className}>
        学習をつづける <span aria-hidden="true">→</span>
      </Link>
    );
  }
  return (
    <button
      type="button"
      data-testid={testid}
      onClick={() => {
        void authClient.signIn.social({ provider: "google", callbackURL: "/courses" });
      }}
      className={className}
    >
      はじめる <span aria-hidden="true">→</span>
    </button>
  );
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { user, courses, devLoginEnabled } = loaderData;
  const loggedIn = user !== null;

  return (
    <main>
      {/* ヒーロー */}
      <section className="border-slate-200 border-b bg-white">
        <div className="mx-auto grid max-w-5xl items-center gap-12 px-6 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="flex items-center gap-2 font-medium text-slate-500 text-sm">
              <img src="/gdg.svg" alt="" className="h-5 w-5" />
              GDG on Campus Osaka の Web 学習サービス
            </p>
            <h1 className="mt-4 font-bold text-4xl text-slate-900 leading-tight tracking-tight sm:text-5xl">
              つくりながら、
              <br />
              身につける
              <span aria-hidden="true" style={{ color: GDG.blue }}>
                。
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-600 leading-relaxed">
              {SITE_NAME} は、スライドで学んで・ブラウザでそのまま書いて・その場で判定される、 HTML / CSS /
              JavaScript の入門学習サービスです。書いたコードがすぐ動くから、続きます。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <StartButton loggedIn={loggedIn} tone="blue" testid="cta-start" />
              {!loggedIn && devLoginEnabled ? (
                <form method="post" action="/api/dev-login">
                  <button
                    type="submit"
                    className="rounded text-slate-500 text-sm underline-offset-4 hover:text-slate-700 hover:underline"
                  >
                    開発ログイン(ローカル)
                  </button>
                </form>
              ) : null}
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-slate-500 text-sm">
              {["環境構築は不要", "全32レッスン", "ブラウザだけでOK"].map((t, i) => (
                <li key={t} className="flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: [GDG.blue, GDG.red, GDG.green][i] }}
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* エディタのモック(プロダクトの体験を先に見せる) */}
          <div aria-hidden="true" className="hidden lg:block">
            <div className="rounded-2xl border border-slate-200 bg-slate-900 shadow-xl">
              <div className="flex items-center gap-1.5 border-slate-700/60 border-b px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: GDG.red }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: GDG.yellow }} />
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: GDG.green }} />
                <span className="ml-3 font-mono text-slate-400 text-xs">index.html</span>
              </div>
              <pre className="overflow-x-auto px-5 py-4 font-mono text-[13px] leading-7">
                <code>
                  <span className="text-slate-500">{"<!doctype html>"}</span>
                  {"\n"}
                  <span style={{ color: "#8ab4f8" }}>{"<h1>"}</span>
                  <span className="text-slate-100">こんにちは、Web!</span>
                  <span style={{ color: "#8ab4f8" }}>{"</h1>"}</span>
                  {"\n"}
                  <span style={{ color: "#8ab4f8" }}>{"<p>"}</span>
                  <span className="text-slate-100">はじめてのページ</span>
                  <span style={{ color: "#8ab4f8" }}>{"</p>"}</span>
                </code>
              </pre>
              <div className="flex items-center justify-between border-slate-700/60 border-t px-4 py-3">
                <span className="font-medium text-emerald-400 text-sm">✓ 合格です! おめでとうございます</span>
                <span className="rounded-lg bg-white/10 px-3 py-1 font-medium text-slate-200 text-xs">
                  できた!
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 学び方(4ステップ) */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="font-bold text-2xl text-slate-900 tracking-tight">学び方はワンループ</h2>
        <p className="mt-1 text-slate-600 text-sm">1レッスンは5〜8分。この4つをくり返すだけです。</p>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm text-white"
                style={{ backgroundColor: step.color }}
              >
                {i + 1}
              </span>
              <h3 className="mt-3 font-semibold text-base text-slate-900">{step.title}</h3>
              <p className="mt-1.5 text-slate-600 text-sm leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* コース紹介(静的。受講はログイン後 — ADR #17) */}
      <section className="border-slate-200 border-y bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-bold text-2xl text-slate-900 tracking-tight">3つの入門コース</h2>
              <p className="mt-1 text-slate-600 text-sm">
                HTML → CSS → JavaScript の順で、ゼロから積み上げます。
              </p>
            </div>
            <p className="text-slate-400 text-xs">受講にはログインが必要です</p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.slug}
                data-testid={`lp-course-${course.slug}`}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                style={{ borderTopWidth: 3, borderTopColor: COURSE_ACCENT[course.slug] ?? GDG.blue }}
              >
                <h3 className="font-semibold text-lg text-slate-900">{course.title}</h3>
                <p className="mt-2 text-slate-600 text-sm leading-relaxed">{course.description}</p>
                <p className="mt-4 font-medium text-slate-400 text-xs">全 {course.lessonCount} レッスン</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* しめの CTA */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-3xl bg-slate-900 px-8 py-12 text-center sm:py-14">
          <h2 className="font-bold text-2xl text-white tracking-tight sm:text-3xl">
            さっそく、最初のレッスンへ。
          </h2>
          <p className="mt-3 text-slate-300 text-sm">
            Google アカウントでログインすると、進捗・連続学習・バッジが記録されます。
          </p>
          <div className="mt-7">
            <StartButton loggedIn={loggedIn} tone="white" testid="cta-start-bottom" />
          </div>
        </div>
      </section>
    </main>
  );
}
