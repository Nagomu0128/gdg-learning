// Worker バインディング契約(CONTRACTS §4.2)。wrangler.jsonc(C 所有)が SSOT。
// wrangler types の生成型に依存せず契約を固定するため、明示的に定義する。
export type Env = {
  DB: D1Database;
  RATE_LIMIT_KV: KVNamespace;
  ANALYTICS?: AnalyticsEngineDataset;
  ASSETS: Fetcher;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL?: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  DEV_LOGIN?: string;
};
