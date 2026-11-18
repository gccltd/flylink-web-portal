# Portal API adapter boundary

This note states where the desktop portal's `/api/portal/*` calls go in
each deployment. It describes facts only; it is not a production
cutover plan, and this round performs no production switch.

## The client does not change by environment

The browser client keeps the existing same-origin calls
(`user-portal-http.ts` and the commerce / wallet / recharge clients):
every request goes to `/api/portal/*` on the same origin that serves
the page. There is no per-environment base URL, no client-side
environment switch, and no client-side fallback. What changes between
Preview and production is only what answers those paths server-side.

## Preview: Vercel serverless mock (synthetic data only)

A Vercel Preview deployment answers `/api/portal/*` with the mock in
`portal-mock-handler.js`, exposed through eleven thin files under
`api/portal/` (one per explicit route, plus a `[...all]` catch-all).
It mirrors the lucky local preview server (`serve-portal.mjs`) and
returns the design-mock dataset only: a synthetic `preview-user`
session, the 200 GB annual plan, a 70 Coins balance, and the renewal
quote 200 list / −20 credit / 180 due / 110 shortfall with a 10-minute
expiry. The numbers in the design screenshot are mock data and must
never be read as real account state.

Stubbed routes (all GET unless noted):

- `/api/portal/browser-session` — synthetic preview session
- `/api/portal/commerce/model` — `legacy`
- `/api/portal/access-requests/current` — one usable 200 GB entitlement
- `/api/portal/security/current` — empty security state
- `/api/portal/resources/current` — available 200 GB / 365-day resource
- `/api/portal/catalog/offers` and `/api/portal/catalog/offers/:ref` —
  the three plan offers (50 / 100 / 200 GB)
- `/api/portal/commerce/plan-switch/state` — current 200 GB offer,
  `current_renew` (charge 180, credit 20)
- `POST /api/portal/commerce/checkout-preview` — renewal quote for the
  200 GB offer; plain quotes for the two monthly offers
- `/api/portal/coins/wallet` — 70 paidCoins summary

Any other `/api/portal/*` path returns 503
`{"error": "preview-no-backend"}`. No order is created, no payment is
taken, and no ledger / recharge data is served, so the marketplace,
wallet ledger, orders, and recharge surfaces stay honestly unavailable
instead of showing fabricated business data. The mock holds no state,
reads no credentials, and performs no business calculation beyond
returning the fixed dataset.

## Production: the real Portal backend

A production deployment answers the same `/api/portal/*` paths with
the real Portal backend (the BWH subscription control plane, production
state pr799, under the existing Portal contract). The client, the path
set, and the server projections (offers, quotes, plan-switch state,
wallet read model) are the same shape the Preview mock imitates; the
difference is that production returns real account data and performs
real settlement. No backend change is part of this round, and nothing
in this round points a production host at the mock.

## Known gap: P3-1, the mock has no environment guard

The mock carries no environment guard (no check on deployment
environment or hostname anywhere in `portal-mock-handler.js` or
`api/`). That is accepted for Preview-only use, and it was already
recorded before this round. Before any production domain is attached
to this Vercel project, a guard must be added so the mock can never
answer on production. This round does not add the guard and does not
attach a production domain.

## What this round changed, and did not change

- Changed: the client UI described in the implementation log (topbar,
  dark default, dashboard cards, wallet-first quote rows, collapsible
  business notes). The API paths and the client adapter are unchanged.
- Not changed: `server/`, authentication / session handling, commerce
  projections, the mock dataset, and the production deployment. The
  Vercel Preview remains a mock-backed preview.
