// 開発用ログイン(CONTRACTS §4.3)。env.DEV_LOGIN === "1" のときだけ有効。所有者: C。
// E2E・手動確認の唯一のログイン経路。固定 dev ユーザーを signIn(なければ signUp)し、
// Better Auth が返す Set-Cookie を移植して /courses へ 302 する。
import { getAuth } from "~/features/auth/auth.server";
import type { Route } from "./+types/api.dev-login";

const DEV_EMAIL = "dev@example.com";
const DEV_NAME = "開発ユーザー";
const DEV_PASSWORD = "codesteps-dev-login";

export function loader() {
  return new Response("Not Found", { status: 404 });
}

export async function action({ request, context }: Route.ActionArgs) {
  const env = context.cloudflare.env;
  if (env.DEV_LOGIN !== "1") {
    return new Response("Not Found", { status: 404 });
  }

  const auth = getAuth(env);
  const headers = new Headers(request.headers);

  let res: Response | null = null;
  try {
    res = await auth.api.signInEmail({
      body: { email: DEV_EMAIL, password: DEV_PASSWORD },
      headers,
      asResponse: true,
    });
  } catch {
    res = null;
  }
  if (!res?.ok) {
    // 初回はユーザーが存在しないので作成(autoSignIn でセッションも確立される)
    try {
      res = await auth.api.signUpEmail({
        body: { email: DEV_EMAIL, password: DEV_PASSWORD, name: DEV_NAME },
        headers,
        asResponse: true,
      });
    } catch {
      res = null;
    }
  }
  if (!res?.ok) {
    return new Response("開発ログインに失敗しました", { status: 500 });
  }

  const out = new Headers();
  for (const cookie of res.headers.getSetCookie()) {
    out.append("Set-Cookie", cookie);
  }
  out.set("Location", "/courses");
  return new Response(null, { status: 302, headers: out });
}
