import type { ReactNode } from "react";
import { isRouteErrorResponse, Link, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { SITE_NAME } from "~/lib/site";
import type { Route } from "./+types/root";
import "./app.css";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{SITE_NAME}</title>
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-slate-200 border-b bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
            <Link to="/" className="font-bold text-indigo-600 text-lg">
              {SITE_NAME}
            </Link>
            {/* STUB(C が実装): LoginButton(Google + DEV_LOGIN 時のみ開発ログイン) */}
          </div>
        </header>
        {children}
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
    </main>
  );
}
