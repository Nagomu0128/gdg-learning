// 認証(CONTRACTS §4.3 / DesignDoc §8)。所有者: C。
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { redirect } from "react-router";
import { getDb, schema } from "~/db";
import type { Env } from "~/lib/env";
import type { AuthUser } from "./types";

export type { AuthUser } from "./types";

export type BetterAuth = ReturnType<typeof betterAuth>;

// env オブジェクトは isolate 内で同一参照が来るため WeakMap でメモ化(§4.3)。
const authCache = new WeakMap<Env, BetterAuth>();

export function getAuth(env: Env): BetterAuth {
  const cached = authCache.get(env);
  if (cached) return cached;

  const devLogin = env.DEV_LOGIN === "1";
  const options: BetterAuthOptions = {
    database: drizzleAdapter(getDb(env), { provider: "sqlite", schema }),
    secret: env.BETTER_AUTH_SECRET,
    // 未設定時は request から導出される(§8.1)
    baseURL: env.BETTER_AUTH_URL || undefined,
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    // 開発ログイン用モック — 本番では無効(SPEC C §2)
    emailAndPassword: { enabled: devLogin },
    // §8.2: 署名付き Cookie キャッシュ TTL 5分(毎リクエストの D1 参照を回避)
    session: { cookieCache: { enabled: true, maxAge: 300 } },
    // dev では任意ポートの localhost から叩けるように request origin を信頼する(本番は既定のまま)
    ...(devLogin
      ? { trustedOrigins: (request?: Request) => (request ? [new URL(request.url).origin] : []) }
      : {}),
  };
  const auth = betterAuth(options);
  authCache.set(env, auth);
  return auth;
}

export async function getOptionalUser(request: Request, env: Env): Promise<AuthUser | null> {
  const auth = getAuth(env);
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return null;
  const { id, name, email, image } = session.user;
  return { id, name, email, image: image ?? null };
}

export async function requireUser(request: Request, env: Env): Promise<AuthUser> {
  const user = await getOptionalUser(request, env);
  if (!user) throw redirect("/");
  return user;
}
