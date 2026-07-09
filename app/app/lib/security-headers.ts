// アプリ本体のセキュリティヘッダ(DesignDoc §10.2 / SPEC C §4)。純粋関数 — vitest 対象。
// CSP メモ: srcdoc iframe は親ドキュメントの CSP を継承するため、script-src の 'unsafe-inline' は
// サンドボックス実行(§6)の前提条件。frame-src は「新規タブで開く」等の blob:/data: を許可。
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://lh3.googleusercontent.com",
  "frame-src blob: data:",
  "worker-src blob:",
  "connect-src 'self'",
].join("; ");

export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  "Content-Security-Policy": CONTENT_SECURITY_POLICY,
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
};

/** レスポンスにセキュリティヘッダを付与した新しい Response を返す(元ヘッダは保持)。 */
export function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
