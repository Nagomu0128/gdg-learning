import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import type { Env } from "~/lib/env";
import * as schema from "./schema";

export function getDb(env: Env): DrizzleD1Database<typeof schema> {
  return drizzle(env.DB, { schema });
}

export { schema };
