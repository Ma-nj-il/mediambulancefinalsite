export function withSecurityHeaders(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  const url = new URL(request.url);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  if (!headers.has("Content-Security-Policy")) {
    // Permit the existing trusted editor previews while blocking arbitrary framing.
    headers.set(
      "Content-Security-Policy",
      "base-uri 'self'; object-src 'none'; frame-ancestors 'self' https://lovable.dev https://*.lovable.dev https://gptengineer.app https://*.gptengineer.app",
    );
  }
  if (url.protocol === "https:") {
    headers.set("Strict-Transport-Security", "max-age=31536000");
  }
  if (
    url.pathname === "/admin" ||
    url.pathname.startsWith("/admin/") ||
    request.headers.has("authorization") ||
    headers.has("set-cookie") ||
    !["GET", "HEAD"].includes(request.method)
  ) {
    headers.set("Cache-Control", "private, no-store");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
