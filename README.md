# flylink-web-portal

FlyLink VPN desktop web user portal — an independent desktop frontend for
subscription, wallet, orders and account management.

This repository holds only the desktop web portal. It talks to the
subscription control plane over same-origin relative API calls; the backend
(`proxy-gateway-minimal`), the marketing site, the mobile portal and the
admin console live in their own repositories and are not part of this one.

Source baseline: the desktop portal subtree of
`FlyLink-com/proxy-gateway-minimal`, migrated at PR #892 head
`d19de675226775a5ea4d720643f5fa8a03fb1f99` (branch
`fix/portal-desktop-redesign`). The migrated code is unchanged apart from the
flattened layout (`admin/` prefix removed), the package name/scripts, and the
path rewrites that flattening required.

## Current capabilities

- User portal: subscription overview, data-pack purchase, plan switch state,
  orders, wallet balance, Coins recharge, referrals, personal center and
  security panels (TOTP enrollment, password session, second factor).
- Registration and login flows served from the same entry.
- Coins purchase dialog with server-provided quote, expiry countdown and
  payment handoff.
- Ads consent preference panel and ads click attribution handoff.
- Local preview client (`src/features/user-portal/user-portal-*.ts` preview
  files) used by tests and local development only — it never ships in the
  production build and talks to no real backend.

## Tech stack

- React 19 + TypeScript (strict) + Vite 8
- Vitest 4 + jsdom + Testing Library
- ESLint 9 flat config
- Node 22 (see `.nvmrc` — use `node v22.23.1` or newer 22.x)

## Development

```sh
npm install        # or: npm ci (clean install from the lockfile)
npm run dev        # Vite dev server for the desktop portal (port 4176, base /web/)
npm test           # vitest run (jsdom)
npm run lint       # eslint src
npm run build      # tsc --noEmit && vite build --config vite.portal-web.config.ts
npm run verify:portal:web   # validate the dist-portal-web output
npm run preview    # serve the production build locally (port 4176)
```

The build output is `dist-portal-web/` and is served under the `/web/` base
path. The legacy entry `portal/index.html` (base `/`) is kept for the
pre-existing mobile/legacy entry point that shares the same JavaScript entry.

## Environment

Build-time variables only (see `.env.example`):

- `VITE_PORTAL_RECHARGE_TRUSTED_ACTION_ORIGINS_JSON` — optional JSON map of
  recharge adapter keys to trusted action origins. Defaults to `{}`.
- `VITE_PUBLIC_ADS_CLICK_BINDING_ENABLED` — optional, only `"true"` enables
  the public ads click-binding handoff. Defaults to `"false"`.

`VITE_PORTAL_RECHARGE_CONFIG_BINDING` is injected at build time by the Vite
plugin in `vite.portal.config.ts` — do not set it by hand. It is not listed
in `.env.example` for that reason.

The portal frontend reads no other `VITE_` variables. API calls use relative
`/api/portal/*` paths against the same origin; there is no backend base URL
to configure in this repository.

## Architecture

```text
Web UI (React, src/)
  -> Adapter (user-portal-client / commerce-client / wallet-client / recharge client)
  -> Portal API Contract (commerce/api-contract, wallet/api-contract, recharge client)
  -> proxy-gateway-minimal (subscription control plane, separate repository)
```

Business calculations are not re-implemented in the frontend: prices,
quotes, balances, plan-switch state and order state are rendered from the
server-provided models and contracts. The frontend validates shapes and
expiry (for example `quote.expiresAt`) but never recomputes what the user
should be charged.

## License

License: pending project owner confirmation. This repository currently has
no `LICENSE` file, and being publicly visible does not grant any right to
copy, modify, distribute or use the code commercially. Do not assume a
license until the owner publishes one. Attribution for adapted admin-shell
layout patterns lives in `NOTICE.md`.

<!-- desktop redesign probe 2 2026-11-18 -->
