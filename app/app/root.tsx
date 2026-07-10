import type { ReactNode } from "react";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
  useRouteLoaderData,
} from "react-router";
import { getOptionalUser } from "~/features/auth/auth.server";
import { LoginButton } from "~/features/auth/login-button";
import { SITE_NAME } from "~/lib/site";
import type { Route } from "./+types/root";
import "./app.css";

export async function loader({ request, context }: Route.LoaderArgs) {
  const env = context.cloudflare.env;
  const user = await getOptionalUser(request, env);
  return { user, devLoginEnabled: env.DEV_LOGIN === "1" };
}

export function Layout({ children }: { children: ReactNode }) {
  // ErrorBoundary 描画時は loader データが無いことがある
  const data = useRouteLoaderData<typeof loader>("root");
  const user = data?.user ?? null;
  // 学習画面(スライド・演習)はフッターを出さない(route の handle で宣言)
  const hideFooter = useMatches().some(
    (m) => (m.handle as { hideFooter?: boolean } | undefined)?.hideFooter === true,
  );

  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <title>{SITE_NAME}</title>
        <Meta />
        <Links />
      </head>
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
        <header className="border-slate-200 border-b bg-white">
          {/* Google 4色のアクセントバー(GDG ブランド) */}
          <div
            aria-hidden="true"
            className="h-1 w-full"
            style={{
              background:
                "linear-gradient(90deg, var(--gdg-blue) 0 25%, var(--gdg-red) 25% 50%, var(--gdg-yellow) 50% 75%, var(--gdg-green) 75% 100%)",
            }}
          />
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
            <div className="flex items-center gap-6">
              <Link
                to="/"
                className="flex items-center gap-2.5 rounded focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
              >
                <img src="/gdg.svg" alt="" className="h-7 w-7" />
                <span className="font-bold text-lg text-slate-900 tracking-tight">{SITE_NAME}</span>
              </Link>
              {/* コース閲覧はログイン必須(ADR #17)のため、ナビはログイン後のみ。マイページはユーザーメニュー内 */}
              {user ? (
                <nav aria-label="メイン" className="flex items-center gap-4 text-slate-600 text-sm">
                  <Link
                    to="/courses"
                    className="rounded hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
                  >
                    コース一覧
                  </Link>
                </nav>
              ) : null}
            </div>
            <LoginButton user={user} devLoginEnabled={data?.devLoginEnabled ?? false} />
          </div>
        </header>
        <div className="flex-1">{children}</div>
        {hideFooter ? null : (
          <footer className="border-slate-200 border-t bg-white">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-6 py-4 text-slate-500 text-sm">
              <p>© 2026 {SITE_NAME}</p>
              <nav aria-label="フッター" className="flex items-center gap-4">
                {/* MVP ではダミーページ不要(SPEC C §3) */}
                <a href="#top" className="hover:text-slate-700">
                  利用規約
                </a>
                <a href="#top" className="hover:text-slate-700">
                  プライバシーポリシー
                </a>
              </nav>
            </div>
          </footer>
        )}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "エラーが発生しました";
  let details = "予期しないエラーが発生しました。";

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "ページが見つかりません" : `エラー ${error.status}`;
    details =
      error.status === 404 ? "お探しのページは存在しないか、移動しました。" : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="font-bold text-2xl text-slate-900">{message}</h1>
      <p className="mt-2 text-slate-600">{details}</p>
      <p className="mt-6">
        <Link to="/" className="font-medium text-indigo-600 hover:underline">
          トップページへ戻る
        </Link>
      </p>
    </main>
  );
}
