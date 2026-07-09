import { createRequestHandler } from "react-router";
import type { Env } from "../app/lib/env";

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
    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
  async scheduled(_controller, _env, _ctx) {
    // STUB(F が runRetention(§7.5)を接続する)
    console.log("cron: retention stub");
  },
} satisfies ExportedHandler<Env>;
