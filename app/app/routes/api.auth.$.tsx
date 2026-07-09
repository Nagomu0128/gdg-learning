// Better Auth キャッチオール(auth.handler(request) へ委譲)。CONTRACTS §4.3 / DesignDoc §8.1。所有者: C。
import { getAuth } from "~/features/auth/auth.server";
import type { Route } from "./+types/api.auth.$";

export async function loader({ request, context }: Route.LoaderArgs) {
  return getAuth(context.cloudflare.env).handler(request);
}

export async function action({ request, context }: Route.ActionArgs) {
  return getAuth(context.cloudflare.env).handler(request);
}
