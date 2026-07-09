// ログイン UI(CONTRACTS §4.3)。未ログイン: Google ボタン + DEV_LOGIN 時のみ開発ログイン。
// ログイン済み: ユーザー名 + ドロップダウン(マイページ / ログアウト)。所有者: C。
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Button } from "~/components/ui";
import { authClient } from "./auth-client";
import type { AuthUser } from "./types";

export function LoginButton({ user, devLoginEnabled }: { user: AuthUser | null; devLoginEnabled: boolean }) {
  if (user) return <UserMenu user={user} />;

  return (
    <div className="flex items-center gap-2">
      {devLoginEnabled ? (
        // plain form(RR を介さない document POST → 302 追従)
        <form method="post" action="/api/dev-login">
          <Button type="submit" variant="secondary">
            開発ログイン
          </Button>
        </form>
      ) : null}
      <Button
        type="button"
        variant="primary"
        onClick={() => {
          void authClient.signIn.social({ provider: "google", callbackURL: "/courses" });
        }}
      >
        Googleでログイン
      </Button>
    </div>
  );
}

function UserMenu({ user }: { user: AuthUser }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-700 text-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
      >
        {user.image ? (
          <img src={user.image} alt="" className="h-6 w-6 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 text-xs"
          >
            {user.name.slice(0, 1)}
          </span>
        )}
        <span className="max-w-32 truncate">{user.name}</span>
        <span aria-hidden="true" className="text-slate-400 text-xs">
          ▾
        </span>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-sm"
        >
          <Link
            to="/me"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-slate-700 text-sm hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
          >
            マイページ
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void authClient.signOut().then(() => {
                window.location.assign("/");
              });
            }}
            className="block w-full px-4 py-2 text-left text-slate-700 text-sm hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
          >
            ログアウト
          </button>
        </div>
      ) : null}
    </div>
  );
}
