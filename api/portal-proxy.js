import { isIP } from "node:net";

const UPSTREAM_ORIGIN = "https://portal.gccwebos.com";
const PORTAL_COOKIE_NAME = "__Host-PortalSession";
const PORTAL_CONTEXT_PATTERN = /^portalctx_[0-9a-f]{64}$/u;
const MAX_REQUEST_BODY_BYTES = 64 * 1024;
const MAX_RESPONSE_BODY_BYTES = 1024 * 1024;
const UPSTREAM_TIMEOUT_MS = 8_000;

const READABLE_PATHS = [
  /^\/api\/portal\/browser-session$/u,
  /^\/api\/portal\/ads-consent$/u,
  /^\/api\/portal\/security\/current$/u,
  /^\/api\/portal\/access-requests\/current$/u,
  /^\/api\/portal\/resources\/current(?:\/overview)?$/u,
  /^\/api\/portal\/catalog\/offers(?:\/[A-Za-z0-9_-]+)?$/u,
  /^\/api\/portal\/commerce\/model$/u,
  /^\/api\/portal\/commerce\/plan-switch\/state$/u,
  /^\/api\/portal\/commerce\/orders(?:\/[A-Za-z0-9_-]+)?$/u,
  /^\/api\/portal\/commerce\/deferred\/offers(?:\/[A-Za-z0-9_-]+)?$/u,
  /^\/api\/portal\/commerce\/deferred\/transitions(?:\/[A-Za-z0-9_-]+)?$/u,
  /^\/api\/portal\/coins\/wallet$/u,
  /^\/api\/portal\/coins\/wallet\/ledger$/u,
  /^\/api\/portal\/coins\/recharge\/offers$/u,
  /^\/api\/portal\/coins\/recharge\/orders(?:\/[A-Za-z0-9_-]+)?$/u,
  /^\/api\/portal\/referral(?:\/(?:profile|performance))?$/u,
];

const ALLOWED_POST_PATHS = new Set([
  "/api/portal/browser-session/logout",
  "/api/portal/human-challenges",
  "/api/portal/password/session",
  "/api/portal/password/second-factor",
  "/api/portal/session",
  "/api/portal/commerce/checkout-preview",
  "/api/portal/commerce/deferred/checkout-preview",
]);

function readHeader(req, name) {
  const value = req?.headers?.[name.toLowerCase()];
  if (Array.isArray(value)) return value.length === 1 ? value[0] : undefined;
  return typeof value === "string" ? value : undefined;
}

function normalizedHost(value) {
  if (typeof value !== "string" || !value.trim() || /[\s/@?#,]/u.test(value)) return null;
  try {
    const parsed = new URL("https://" + value.trim());
    if (parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) return null;
    return parsed.host.toLowerCase();
  } catch {
    return null;
  }
}

function sendJson(res, status, body, extraHeaders = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Vary", "Cookie, Origin");
  for (const [name, value] of Object.entries(extraHeaders)) {
    if (value !== undefined && value !== null) res.setHeader(name, value);
  }
  res.end(JSON.stringify(body));
}

function resolvePortalRequestUrl(requestUrl, requestHost) {
  let parsed;
  try {
    parsed = new URL(requestUrl || "/", "https://" + requestHost);
  } catch {
    return { error: "invalid_request_url" };
  }

  const capturedPaths = parsed.searchParams.getAll("__portal_path");
  if (capturedPaths.length !== 1) return { error: "invalid_portal_path" };

  const capturedPath = capturedPaths[0];
  if (!capturedPath || capturedPath.length > 512 || /[%\\?#\u0000-\u001f]/u.test(capturedPath)) {
    return { error: "invalid_portal_path" };
  }

  const segments = capturedPath.split("/");
  if (segments.some((segment) => !/^[A-Za-z0-9_-]+$/u.test(segment))) {
    return { error: "invalid_portal_path" };
  }

  const pathname = "/api/portal/" + segments.join("/");
  const query = new URLSearchParams();
  for (const [key, value] of parsed.searchParams) {
    if (key !== "__portal_path") query.append(key, value);
  }

  return { pathname, query };
}

function readPortalCookie(cookieHeader) {
  if (!cookieHeader) return { cookie: undefined };
  const matches = String(cookieHeader)
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.startsWith(PORTAL_COOKIE_NAME + "="));

  if (matches.length > 1) return { error: "duplicate_portal_cookie" };
  if (matches.length === 0) return { cookie: undefined };

  const value = matches[0].slice(PORTAL_COOKIE_NAME.length + 1);
  if (!/^[A-Za-z0-9_-]{43}$/u.test(value)) {
    return { error: "invalid_portal_cookie" };
  }
  return { cookie: matches[0] };
}

function isAllowedRead(pathname) {
  return READABLE_PATHS.some((pattern) => pattern.test(pathname));
}

function requestBody(req, contentType) {
  if (!contentType || !/^application\/json(?:\s*;|$)/iu.test(contentType)) {
    return { error: "json_content_type_required", status: 415 };
  }

  const body = req?.body;
  if (body === undefined || body === null) return { body: "{}" };
  if (typeof body === "string") {
    if (Buffer.byteLength(body, "utf8") > MAX_REQUEST_BODY_BYTES) {
      return { error: "request_body_too_large", status: 413 };
    }
    try {
      JSON.parse(body);
    } catch {
      return { error: "invalid_json_body", status: 400 };
    }
    return { body };
  }
  if (typeof body !== "object" || Array.isArray(body) || Buffer.isBuffer(body)) {
    return { error: "invalid_json_body", status: 400 };
  }

  let serialized;
  try {
    serialized = JSON.stringify(body);
  } catch {
    return { error: "invalid_json_body", status: 400 };
  }
  if (Buffer.byteLength(serialized, "utf8") > MAX_REQUEST_BODY_BYTES) {
    return { error: "request_body_too_large", status: 413 };
  }
  return { body: serialized };
}

function getSetCookies(headers) {
  if (typeof headers?.getSetCookie === "function") return headers.getSetCookie();
  const single = headers?.get?.("set-cookie");
  return single ? [single] : [];
}

export function createPortalApiProxyHandler({
  fetchImpl = globalThis.fetch,
  env = process.env,
  upstreamOrigin = UPSTREAM_ORIGIN,
} = {}) {
  return async function portalApiProxy(req, res) {
    const method = String(req?.method || "GET").toUpperCase();
    const requestHost = normalizedHost(readHeader(req, "host"));
    const allowedHosts = new Set(
      [env.VERCEL_URL, env.VERCEL_BRANCH_URL]
        .map(normalizedHost)
        .filter(Boolean),
    );

    if (env.VERCEL_ENV !== "preview" || !requestHost || !allowedHosts.has(requestHost)) {
      sendJson(res, 404, { error: "preview_proxy_unavailable" });
      return;
    }

    if (readHeader(req, "sec-fetch-site") !== "same-origin") {
      sendJson(res, 403, { error: "preview_origin_rejected" });
      return;
    }

    const browserOrigin = readHeader(req, "origin");
    if (browserOrigin !== undefined && browserOrigin !== "https://" + requestHost) {
      sendJson(res, 403, { error: "preview_origin_rejected" });
      return;
    }
    if (browserOrigin === undefined && !["GET", "HEAD"].includes(method)) {
      sendJson(res, 403, { error: "preview_origin_required" });
      return;
    }

    if (readHeader(req, "x-portal-request") !== "browser-v1") {
      sendJson(res, 403, { error: "portal_browser_request_required" });
      return;
    }
    if (readHeader(req, "x-portal-session") !== undefined || readHeader(req, "authorization") !== undefined) {
      sendJson(res, 400, { error: "unsupported_session_transport" });
      return;
    }

    const resolved = resolvePortalRequestUrl(req?.url, requestHost);
    if (resolved.error) {
      sendJson(res, 400, { error: resolved.error });
      return;
    }

    if (method === "GET") {
      if (!isAllowedRead(resolved.pathname)) {
        sendJson(res, 404, { error: "preview_endpoint_not_enabled" });
        return;
      }
    } else if (method === "POST") {
      if (!ALLOWED_POST_PATHS.has(resolved.pathname)) {
        sendJson(res, 403, { error: "preview_read_only" });
        return;
      }
    } else {
      sendJson(res, 405, { error: "method_not_allowed" }, { Allow: "GET, POST" });
      return;
    }

    const cookie = readPortalCookie(readHeader(req, "cookie"));
    if (cookie.error) {
      sendJson(res, 400, { error: cookie.error });
      return;
    }

    const sessionContext = readHeader(req, "x-portal-session-context");
    if (sessionContext !== undefined && !PORTAL_CONTEXT_PATTERN.test(sessionContext)) {
      sendJson(res, 400, { error: "invalid_portal_session_context" });
      return;
    }

    const upstreamUrl = new URL(resolved.pathname, upstreamOrigin);
    upstreamUrl.search = resolved.query.toString();

    const headers = new Headers({
      Accept: readHeader(req, "accept") || "application/json",
      Origin: upstreamOrigin,
      "Sec-Fetch-Site": "same-origin",
      "X-Portal-Request": "browser-v1",
    });
    if (sessionContext) headers.set("X-Portal-Session-Context", sessionContext);
    if (cookie.cookie) headers.set("Cookie", cookie.cookie);

    let body;
    if (method === "POST") {
      const parsedBody = requestBody(req, readHeader(req, "content-type"));
      if (parsedBody.error) {
        sendJson(res, parsedBody.status, { error: parsedBody.error });
        return;
      }
      body = parsedBody.body;
      headers.set("Content-Type", "application/json");
    }

    const realIp = readHeader(req, "x-real-ip");
    if (realIp && isIP(realIp) !== 0) {
      headers.set("X-Real-IP", realIp);
      headers.set("X-Forwarded-For", realIp);
    }

    let upstream;
    try {
      upstream = await fetchImpl(upstreamUrl, {
        method,
        headers,
        body,
        redirect: "manual",
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      });
    } catch {
      sendJson(res, 502, { error: "portal_upstream_unavailable" });
      return;
    }

    if (upstream.status >= 300 && upstream.status < 400) {
      sendJson(res, 502, { error: "portal_upstream_redirect_blocked" });
      return;
    }

    let responseBody;
    try {
      responseBody = Buffer.from(await upstream.arrayBuffer());
    } catch {
      sendJson(res, 502, { error: "portal_upstream_response_invalid" });
      return;
    }
    if (responseBody.byteLength > MAX_RESPONSE_BODY_BYTES) {
      sendJson(res, 502, { error: "portal_upstream_response_too_large" });
      return;
    }

    res.statusCode = upstream.status;
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Vary", "Cookie, Origin");
    const contentType = upstream.headers.get("content-type");
    if (contentType) res.setHeader("Content-Type", contentType);
    const retryAfter = upstream.headers.get("retry-after");
    if (retryAfter) res.setHeader("Retry-After", retryAfter);

    const setCookies = getSetCookies(upstream.headers).filter((value) =>
      typeof value === "string" && value.startsWith(PORTAL_COOKIE_NAME + "="),
    );
    if (setCookies.length) res.setHeader("Set-Cookie", setCookies);
    res.end(responseBody);
  };
}

export default createPortalApiProxyHandler();

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "64kb",
    },
  },
};
