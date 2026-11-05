import { describe, expect, it } from "vitest";
import { parseFormPayload } from "@/lib/form-payload";
import { withSecurityHeaders } from "@/lib/security-headers";
import { deviceRequestSchema } from "@/lib/device-requests.functions";

describe("Public submission boundaries", () => {
  it.each(["{invalid-json", "[" + "0,".repeat(10000) + "0]"])(
    "rejects malformed or oversized JSON before validation",
    (payload) => {
      const data = new FormData();
      data.set("payload", payload);
      expect(() => parseFormPayload(data)).toThrow();
    },
  );

  it("accepts a bounded JSON form payload", () => {
    const data = new FormData();
    data.set("payload", '{"name":"Hospital"}');
    expect(parseFormPayload(data)).toEqual({ name: "Hospital" });
  });

  it.each(["RQ-2026-%", "RQ-2026-10_1", "%", "RQ-2026-1001,phone.eq.123"])(
    "rejects wildcard or filter syntax in application references: %s",
    (applicationReference) => {
      expect(
        deviceRequestSchema.safeParse({
          applicationReference,
          phone: "9800000000",
          deviceCategory: "gps",
          gpsQuantity: 2,
          dashcamQuantity: 0,
          vehicleQuantity: 2,
          description: "",
        }).success,
      ).toBe(false);
    },
  );
});

describe("Response security boundaries", () => {
  it.each(["/admin", "/admin/applications", "/admin/device-requests/example"])(
    "prevents shared caching on %s",
    (path) => {
      const response = withSecurityHeaders(
        new Request(`https://site.test${path}`),
        new Response("admin", { headers: { "Cache-Control": "public, max-age=3600" } }),
      );
      expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    },
  );

  it("prevents caching authenticated and mutation responses", () => {
    for (const init of [{ headers: { authorization: "Bearer test" } }, { method: "POST" }]) {
      const response = withSecurityHeaders(
        new Request("https://site.test/api", init),
        new Response("result"),
      );
      expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    }
  });

  it("preserves redirects and existing stricter CSP while adding HTTPS protections", () => {
    const response = withSecurityHeaders(
      new Request("https://site.test/admin"),
      new Response(null, {
        status: 302,
        headers: { Location: "/admin", "Content-Security-Policy": "default-src 'none'" },
      }),
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/admin");
    expect(response.headers.get("Content-Security-Policy")).toBe("default-src 'none'");
    expect(response.headers.get("Strict-Transport-Security")).toBe("max-age=31536000");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("preserves public response bodies and caching and blocks arbitrary framing", async () => {
    const response = withSecurityHeaders(
      new Request("http://localhost:8080/"),
      new Response("public content", { headers: { "Cache-Control": "public, max-age=60" } }),
    );
    expect(await response.text()).toBe("public content");
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=60");
    expect(response.headers.get("Strict-Transport-Security")).toBeNull();
    expect(response.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'self'");
    expect(response.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });
});
