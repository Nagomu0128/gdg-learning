// 認証(CONTRACTS §4.3)。STUB(C が実装)。
import type { betterAuth } from "better-auth";
import { redirect } from "react-router";
import type { Env } from "~/lib/env";

export type BetterAuth = ReturnType<typeof betterAuth>;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

// STUB(C が実装): socialProviders.google + cookieCache 5分。env 単位でメモ化。
export function getAuth(_env: Env): BetterAuth {
  throw new Error("STUB: C が実装(~/features/auth getAuth)");
}

// STUB(C が実装): 現状は常に未ログイン扱いで "/" へ redirect を throw する正直な仮実装。
export async function requireUser(_request: Request, _env: Env): Promise<AuthUser> {
  throw redirect("/");
}

// STUB(C が実装): 現状は常に null(未ログイン)。
export async function getOptionalUser(_request: Request, _env: Env): Promise<AuthUser | null> {
  return null;
}
