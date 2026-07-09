import { createRequestHandler } from "react-router";
import { runRetention } from "../app/features/progress/index.server";
import type { Env } from "../app/lib/env";
import { withSecurityHeaders } from "../app/lib/security-headers";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request, env, ctx) {
    const response = await requestHandler(request, {
      cloudflare: { env, ctx },
    });
    return withSecurityHeaders(response);
  },
  async scheduled(_controller, env, ctx) {
    // §7.5 retention(F 実装。STUB throw でも cron 全体は落とさない)
    ctx.waitUntil(
      (async () => {
        try {
          const result = await runRetention(env);
          console.log(`cron retention: cleared=${result.cleared}`);
        } catch (error) {
          console.error("cron retention failed:", error);
        }
      })(),
    );
  },
} satisfies ExportedHandler<Env>;
