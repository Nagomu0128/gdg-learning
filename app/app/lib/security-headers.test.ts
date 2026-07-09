import { describe, expect, it } from "vitest";
import { CONTENT_SECURITY_POLICY, SECURITY_HEADERS, withSecurityHeaders } from "./security-headers";

describe("security-headers(§10.2)", () => {
  it("CSP にサンドボックス前提のディレクティブが含まれる", () => {
    expect(CONTENT_SECURITY_POLICY).toContain("default-src 'self'");
    expect(CONTENT_SECURITY_POLICY).toContain("script-src 'self' 'unsafe-inline'");
    expect(CONTENT_SECURITY_POLICY).toContain("img-src 'self' data: https://lh3.googleusercontent.com");
    expect(CONTENT_SECURITY_POLICY).toContain("worker-src blob:");
    expect(CONTENT_SECURITY_POLICY).toContain("frame-src blob: data:");
  });

  it("withSecurityHeaders が全ヘッダを付与し、既存ヘッダとステータスを保持する", async () => {
    const original = new Response("hello", {
      status: 201,
      headers: { "Content-Type": "text/plain", "Set-Cookie": "a=1" },
    });
    const result = withSecurityHeaders(original);
    expect(result.status).toBe(201);
    expect(result.headers.get("Content-Type")).toBe("text/plain");
    expect(result.headers.get("Set-Cookie")).toBe("a=1");
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      expect(result.headers.get(name)).toBe(value);
    }
    expect(await result.text()).toBe("hello");
  });

  it("null body(302 等)でも壊れない", () => {
    const original = new Response(null, { status: 302, headers: { Location: "/courses" } });
    const result = withSecurityHeaders(original);
    expect(result.status).toBe(302);
    expect(result.headers.get("Location")).toBe("/courses");
    expect(result.headers.get("X-Frame-Options")).toBe("DENY");
  });
});
