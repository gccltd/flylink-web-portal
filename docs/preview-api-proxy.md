# Vercel Portal API proxy

## Scope

This proxy serves the Vercel Preview deployment and the project's explicitly configured production domain. It does not change the existing Portal origin, DNS, Nginx routing, Mobile deployment, backend configuration, or payment callbacks.

The browser keeps calling same-origin /api/portal/*. vercel.json rewrites those requests to the single api/portal-proxy.js function. The function forwards only approved Portal routes to the fixed upstream https://portal.gccwebos.com.

## Session and origin boundary

- The Vercel project must retain Deployment Protection / SSO for Preview deployments.
- Preview requests require VERCEL_ENV=preview and a Host matching VERCEL_URL or VERCEL_BRANCH_URL.
- Production requests require VERCEL_ENV=production and a Host matching only VERCEL_PROJECT_PRODUCTION_URL. Branch aliases, per-deployment URLs, and arbitrary hosts are rejected in production.
- The project must expose Vercel system environment variables so VERCEL_PROJECT_PRODUCTION_URL is available at runtime; if it is missing, production proxy requests fail closed.
- Browser requests must be same-origin, carry Sec-Fetch-Site: same-origin, and include the Portal browser marker.
- The proxy validates the browser's exact Preview or production Origin, then sends the backend's already-trusted https://portal.gccwebos.com Origin and same-origin Fetch Metadata upstream.
- Only the __Host-PortalSession cookie is forwarded. Vercel SSO cookies and unrelated cookies are never forwarded.
- The backend's Set-Cookie for __Host-PortalSession is returned to the requesting Vercel host. Because the cookie is host-only, Preview and Vercel production sessions remain separate from each other and from the existing Portal host.
- PLATFORM_PORTAL_BROWSER_ORIGIN remains the existing Portal origin. No backend environment change is needed.

## Operation policy (Preview and production)

Allowed:

- Login challenge, password login, second-factor completion, session restoration, and logout.
- Approved account, security, resource, offer, wallet, ledger, order, recharge-order, deferred-transition, and referral reads.
- Server-generated checkout quote previews. These create a short-lived quote record, but do not create an order, hold coins, or debit a balance.

Blocked with 403 `preview_read_only` in both environments:

- Registration and verification-email sends.
- Account/resource mutations and subscription-link reveal/refresh/disable actions.
- TOTP enrollment changes.
- Purchase/order creation or cancellation.
- Recharge-order creation/capture and payment operations.
- Support-ticket creation and referral-link creation.

The proxy does not follow upstream redirects, does not cache API responses, has a bounded request/response size, and uses a fixed upstream origin rather than a caller-controlled URL. Backend rate limits and quote expiry remain authoritative.

## Known follow-up boundary

The existing desktop HTTP client still contains legacy /api/portal/payments/* calls that are not part of the current backend route set. The proxy will not invent or emulate those endpoints; they remain a separately tracked client/backend contract reconciliation item. Payment writes remain disabled in both Preview and production until a dedicated test-account, sandbox acceptance, and separate authorization phase.

## Verification

scripts/portal-api-proxy.test.mjs covers Preview and production host allowlists, fail-closed behavior when the production host is missing, Host/Origin/Fetch Metadata checks, session-cookie filtering, upstream Origin transformation, query preservation, approved login/quote methods, blocked business writes in both environments, response cookie handling, redirect rejection, and the Vercel rewrite contract.
