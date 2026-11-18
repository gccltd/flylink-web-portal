# Vercel Preview Portal API proxy

## Scope

This proxy is available only on Vercel Preview deployments. It does not change the production Portal origin, DNS, Nginx routing, Mobile deployment, backend configuration, payment callbacks, or production Vercel routing.

The browser keeps calling same-origin /api/portal/*. vercel.json rewrites those requests to the single api/portal-proxy.js function. The function forwards only approved Portal routes to the fixed upstream https://portal.gccwebos.com.

## Session and origin boundary

- The Vercel project must retain Deployment Protection / SSO for Preview deployments.
- The proxy requires VERCEL_ENV=preview and a Host matching the current VERCEL_URL or VERCEL_BRANCH_URL.
- Browser requests must be same-origin, carry Sec-Fetch-Site: same-origin, and include the Portal browser marker.
- The proxy validates the browser's Preview Origin, then sends the backend's already-trusted https://portal.gccwebos.com Origin and same-origin Fetch Metadata upstream.
- Only the __Host-PortalSession cookie is forwarded. Vercel SSO cookies and unrelated cookies are never forwarded.
- The backend's Set-Cookie for __Host-PortalSession is returned to the Preview host. Because the cookie is host-only, the Preview session does not share the production Portal cookie jar.
- PLATFORM_PORTAL_BROWSER_ORIGIN remains the existing Portal origin. No backend environment change is needed.

## Preview operation policy

Allowed:

- Login challenge, password login, second-factor completion, session restoration, and logout.
- Approved account, security, resource, offer, wallet, ledger, order, recharge-order, deferred-transition, and referral reads.
- Server-generated checkout quote previews. These create a short-lived quote record, but do not create an order, hold coins, or debit a balance.

Blocked with 403 preview_read_only:

- Registration and verification-email sends.
- Account/resource mutations and subscription-link reveal/refresh/disable actions.
- TOTP enrollment changes.
- Purchase/order creation or cancellation.
- Recharge-order creation/capture and payment operations.
- Support-ticket creation and referral-link creation.

The proxy does not follow upstream redirects, does not cache API responses, has a bounded request/response size, and uses a fixed upstream origin rather than a caller-controlled URL. Backend rate limits and quote expiry remain authoritative.

## Known follow-up boundary

The existing desktop HTTP client still contains legacy /api/portal/payments/* calls that are not part of the current backend route set. The proxy will not invent or emulate those endpoints; they remain a separately tracked client/backend contract reconciliation item. Payment writes remain disabled in Preview until a dedicated test-account and sandbox acceptance phase.

## Verification

scripts/portal-api-proxy.test.mjs covers Preview-only execution, Host/Origin/Fetch Metadata checks, session-cookie filtering, upstream Origin transformation, query preservation, approved login/quote methods, blocked business writes, response cookie handling, redirect rejection, and the Vercel rewrite contract.
