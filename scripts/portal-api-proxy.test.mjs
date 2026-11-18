import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createPortalApiProxyHandler } from "../api/portal-proxy.js";

const PREVIEW_HOST = "flylink-web-portal-pr-123-gccltd.vercel.app";
const PREVIEW_ORIGIN = "https://" + PREVIEW_HOST;
const SESSION_CONTEXT = "portalctx_" + "a".repeat(64);
const ENV = {
  VERCEL_ENV: "preview",
  VERCEL_URL: PREVIEW_HOST,
  VERCEL_BRANCH_URL: "flylink-web-portal-git-feat-preview-real-portal-api-proxy-gccltd.vercel.app",
};

function makeRequest({
  path,
  method = "GET",
  body,
  headers = {},
  query = {},
} = {}) {
  const params = new URLSearchParams({ __portal_path: path });
  for (const [key, value] of Object.entries(query)) params.append(key, String(value));
  return {
    method,
    url: "/api/portal-proxy?" + params.toString(),
    body,
    headers: {
      host: PREVIEW_HOST,
      origin: PREVIEW_ORIGIN,
      "sec-fetch-site": "same-origin",
      "x-portal-request": "browser-v1",
      ...headers,
    },
  };
}

function makeResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: undefined,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    end(body) {
      this.body = Buffer.isBuffer(body) ? body.toString("utf8") : String(body ?? "");
    },
  };
}

function upstreamResponse({ status = 200, body = { ok: true }, headers = {}, cookies = [] } = {}) {
  const values = new Map(Object.entries({ "content-type": "application/json; charset=utf-8", ...headers }).map(([k, v]) => [k.toLowerCase(), v]));
  return {
    status,
    headers: {
      get(name) { return values.get(String(name).toLowerCase()) ?? null; },
      getSetCookie() { return cookies; },
    },
    async arrayBuffer() { return Buffer.from(JSON.stringify(body)); },
  };
}

test("preview GET proxies real Portal reads and preserves query, session context, and only the Portal cookie", async () => {
  let captured;
  const handler = createPortalApiProxyHandler({
    env: ENV,
    fetchImpl: async (url, options) => {
      captured = { url: String(url), options };
      return upstreamResponse({
        body: { ledger: [], page: 2 },
        headers: { "retry-after": "2" },
        cookies: [
          "__Host-PortalSession=rotated_token; Path=/; HttpOnly; Secure; SameSite=Lax",
          "unrelated=value; Path=/",
        ],
      });
    },
  });
  const req = makeRequest({
    path: "coins/wallet/ledger",
    query: { page: 2, limit: 20 },
    headers: {
      cookie: "vercel_sso=private; __Host-PortalSession=" + "a".repeat(43) + "; other=value",
      "x-portal-session-context": SESSION_CONTEXT,
      "x-real-ip": "203.0.113.8",
    },
  });
  const res = makeResponse();

  await handler(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(JSON.parse(res.body), { ledger: [], page: 2 });
  assert.equal(captured.url, "https://portal.gccwebos.com/api/portal/coins/wallet/ledger?page=2&limit=20");
  assert.equal(captured.options.headers.get("origin"), "https://portal.gccwebos.com");
  assert.equal(captured.options.headers.get("sec-fetch-site"), "same-origin");
  assert.equal(captured.options.headers.get("x-portal-request"), "browser-v1");
  assert.equal(captured.options.headers.get("x-portal-session-context"), SESSION_CONTEXT);
  assert.equal(captured.options.headers.get("cookie"), "__Host-PortalSession=" + "a".repeat(43));
  assert.equal(captured.options.headers.get("x-forwarded-for"), "203.0.113.8");
  assert.equal(captured.options.redirect, "manual");
  assert.equal(res.headers["cache-control"], "private, no-store");
  assert.equal(res.headers["retry-after"], "2");
  assert.deepEqual(res.headers["set-cookie"], ["__Host-PortalSession=rotated_token; Path=/; HttpOnly; Secure; SameSite=Lax"]);
});

test("preview login POST forwards JSON but rewrites the upstream Origin to the trusted Portal origin", async () => {
  let captured;
  const handler = createPortalApiProxyHandler({
    env: ENV,
    fetchImpl: async (url, options) => {
      captured = { url: String(url), options };
      return upstreamResponse({ body: { challenge: { challengeRef: "challenge_1" } } });
    },
  });
  const req = makeRequest({
    path: "password/session",
    method: "POST",
    body: { accountId: "test@example.com", password: "not-a-real-secret" },
    headers: { "content-type": "application/json" },
  });
  const res = makeResponse();

  await handler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(captured.url, "https://portal.gccwebos.com/api/portal/password/session");
  assert.equal(captured.options.method, "POST");
  assert.equal(captured.options.body, JSON.stringify(req.body));
  assert.equal(captured.options.headers.get("origin"), "https://portal.gccwebos.com");
});

test("read-only quote preview is allowed but purchase and recharge writes are blocked", async () => {
  let calls = 0;
  const handler = createPortalApiProxyHandler({
    env: ENV,
    fetchImpl: async () => {
      calls += 1;
      return upstreamResponse({ body: { quote: { amountUnits: 10 } } });
    },
  });

  const quoteRes = makeResponse();
  await handler(makeRequest({
    path: "commerce/checkout-preview",
    method: "POST",
    body: { offerRef: "offer_1" },
    headers: { "content-type": "application/json" },
  }), quoteRes);
  assert.equal(quoteRes.statusCode, 200);

  const purchaseRes = makeResponse();
  await handler(makeRequest({
    path: "commerce/orders",
    method: "POST",
    body: { offerRef: "offer_1" },
    headers: { "content-type": "application/json" },
  }), purchaseRes);
  assert.equal(purchaseRes.statusCode, 403);
  assert.deepEqual(JSON.parse(purchaseRes.body), { error: "preview_read_only" });

  const rechargeRes = makeResponse();
  await handler(makeRequest({
    path: "coins/recharge/orders",
    method: "POST",
    body: { offerRef: "recharge_1" },
    headers: { "content-type": "application/json" },
  }), rechargeRes);
  assert.equal(rechargeRes.statusCode, 403);
  assert.equal(calls, 1);

  const productionHost = "flylink-web-portal.vercel.app";
  const productionHandler = createPortalApiProxyHandler({
    env: { ...ENV, VERCEL_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: productionHost },
    fetchImpl: async () => { calls += 1; return upstreamResponse(); },
  });
  const productionPurchaseRes = makeResponse();
  await productionHandler(makeRequest({
    path: "commerce/orders",
    method: "POST",
    body: { offerRef: "offer_1" },
    headers: {
      host: productionHost,
      origin: "https://" + productionHost,
      "content-type": "application/json",
    },
  }), productionPurchaseRes);
  assert.equal(productionPurchaseRes.statusCode, 403);
  assert.deepEqual(JSON.parse(productionPurchaseRes.body), { error: "preview_read_only" });
  assert.equal(calls, 1);
});

test("production proxy accepts only the stable project domain and Preview rejects it", async () => {
  const productionHost = "flylink-web-portal.vercel.app";
  let calls = 0;
  let capturedUrl;
  const productionHandler = createPortalApiProxyHandler({
    env: {
      ...ENV,
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: productionHost,
    },
    fetchImpl: async (url) => {
      calls += 1;
      capturedUrl = String(url);
      return upstreamResponse({ body: { session: null } });
    },
  });

  const productionRes = makeResponse();
  await productionHandler(makeRequest({
    path: "browser-session",
    headers: { host: productionHost, origin: "https://" + productionHost },
  }), productionRes);
  assert.equal(productionRes.statusCode, 200);
  assert.equal(capturedUrl, "https://portal.gccwebos.com/api/portal/browser-session");
  assert.equal(calls, 1);

  for (const host of ["attacker.example", ENV.VERCEL_URL, ENV.VERCEL_BRANCH_URL]) {
    const rejected = makeResponse();
    await productionHandler(makeRequest({
      path: "browser-session",
      headers: { host, origin: "https://" + host },
    }), rejected);
    assert.equal(rejected.statusCode, 404);
  }

  const missingProductionHost = createPortalApiProxyHandler({
    env: { ...ENV, VERCEL_ENV: "production" },
    fetchImpl: async () => { calls += 1; return upstreamResponse(); },
  });
  const missingRes = makeResponse();
  await missingProductionHost(makeRequest({
    path: "browser-session",
    headers: { host: productionHost, origin: "https://" + productionHost },
  }), missingRes);
  assert.equal(missingRes.statusCode, 404);

  const previewHandler = createPortalApiProxyHandler({
    env: { ...ENV, VERCEL_PROJECT_PRODUCTION_URL: productionHost },
    fetchImpl: async () => { calls += 1; return upstreamResponse(); },
  });
  const productionHostOnPreview = makeResponse();
  await previewHandler(makeRequest({
    path: "browser-session",
    headers: { host: productionHost, origin: "https://" + productionHost },
  }), productionHostOnPreview);
  assert.equal(productionHostOnPreview.statusCode, 404);
  assert.equal(calls, 1);
});

test("cross-origin, non-browser, malformed session, and unapproved read requests fail closed", async () => {
  let calls = 0;
  const handler = createPortalApiProxyHandler({
    env: ENV,
    fetchImpl: async () => { calls += 1; return upstreamResponse(); },
  });

  const wrongOriginRes = makeResponse();
  await handler(makeRequest({ path: "browser-session", headers: { origin: "https://attacker.example" } }), wrongOriginRes);
  assert.equal(wrongOriginRes.statusCode, 403);

  const missingMarkerRes = makeResponse();
  await handler(makeRequest({ path: "browser-session", headers: { "x-portal-request": undefined } }), missingMarkerRes);
  assert.equal(missingMarkerRes.statusCode, 403);

  const badContextRes = makeResponse();
  await handler(makeRequest({ path: "browser-session", headers: { "x-portal-session-context": "not-a-context" } }), badContextRes);
  assert.equal(badContextRes.statusCode, 400);

  const unapprovedReadRes = makeResponse();
  await handler(makeRequest({ path: "commerce/orders/abc/subscription" }), unapprovedReadRes);
  assert.equal(unapprovedReadRes.statusCode, 404);
  assert.equal(calls, 0);
});

test("upstream redirects are not followed or exposed to the Preview browser", async () => {
  const handler = createPortalApiProxyHandler({
    env: ENV,
    fetchImpl: async () => upstreamResponse({ status: 302, headers: { location: "https://attacker.example" } }),
  });
  const res = makeResponse();
  await handler(makeRequest({ path: "browser-session" }), res);
  assert.equal(res.statusCode, 502);
  assert.deepEqual(JSON.parse(res.body), { error: "portal_upstream_redirect_blocked" });
  assert.equal(res.headers.location, undefined);
});

test("Vercel rewrite routes Portal API paths to the single protected proxy function", async () => {
  const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
  assert.deepEqual(config.rewrites[0], {
    source: "/api/portal/:path*",
    destination: "/api/portal-proxy?__portal_path=:path*",
  });
});

test("Vercel rewrite capture is not forwarded: browser-session reaches upstream with no query string", async () => {
  // Regression: Vercel appends the rewrite capture as `path=<captured>` to
  // the proxy invocation, and the backend rejects any `?` in the raw URL
  // of browser-session bootstrap and logout with 403. The proxy must drop
  // that routing artifact instead of forwarding it.
  let captured;
  const handler = createPortalApiProxyHandler({
    env: ENV,
    fetchImpl: async (url) => {
      captured = String(url);
      return upstreamResponse({ body: { session: null } });
    },
  });

  const restoreRes = makeResponse();
  await handler(makeRequest({ path: "browser-session", query: { path: "browser-session" } }), restoreRes);
  assert.equal(restoreRes.statusCode, 200);
  assert.equal(captured, "https://portal.gccwebos.com/api/portal/browser-session");

  const logoutRes = makeResponse();
  await handler(makeRequest({
    path: "browser-session/logout",
    method: "POST",
    query: { path: "browser-session/logout" },
    body: {},
    headers: {
      "content-type": "application/json",
      "x-portal-session-context": SESSION_CONTEXT,
    },
  }), logoutRes);
  assert.equal(logoutRes.statusCode, 200);
  assert.equal(captured, "https://portal.gccwebos.com/api/portal/browser-session/logout");
});

test("only allowlisted query parameters reach upstream, per endpoint", async () => {
  let captured;
  const handler = createPortalApiProxyHandler({
    env: ENV,
    fetchImpl: async (url) => {
      captured = String(url);
      return upstreamResponse({ body: { ledger: [] } });
    },
  });

  const ledgerRes = makeResponse();
  await handler(makeRequest({
    path: "coins/wallet/ledger",
    query: { page: 2, limit: 20, path: "coins/wallet/ledger", injected: "no" },
  }), ledgerRes);
  assert.equal(ledgerRes.statusCode, 200);
  assert.equal(captured, "https://portal.gccwebos.com/api/portal/coins/wallet/ledger?page=2&limit=20");

  const currentRes = makeResponse();
  await handler(makeRequest({
    path: "access-requests/current",
    query: { portalUserRef: "user_1", path: "access-requests/current" },
  }), currentRes);
  assert.equal(currentRes.statusCode, 200);
  assert.equal(captured, "https://portal.gccwebos.com/api/portal/access-requests/current?portalUserRef=user_1");
});
