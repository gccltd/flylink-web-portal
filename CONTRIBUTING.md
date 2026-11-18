# Contributing to flylink-web-portal

## Setup

- Use Node 22 (`node v22.23.1` or newer 22.x).
- Install dependencies with `npm ci` (clean install from `package-lock.json`).

## Workflow

- Work on a branch; do not push directly to `main`.
- Keep changes scoped to the desktop web portal. The backend
  (`proxy-gateway-minimal`), the marketing site, the mobile portal and the
  admin console are separate repositories — do not bring their code in here.
- Do not redesign the UI or expand the feature scope in a maintenance PR.
  Visual or product changes go through the owner's review first.
- The local preview client (`user-portal-local.ts`,
  `user-portal-preview-client.ts`, `user-portal-preview-data.ts`) is for
  tests and local development only. It must never call a real backend, and
  its placeholder values must never look like real credentials.

## Checks (all must pass)

```sh
npm run lint
npm test
npm run build:portal:web
npm run verify:portal:web
```

GitHub Actions runs install → lint → test → build on pull requests, and
install → test → build on pushes to `main`.

## Secrets

Never commit secrets, tokens, private keys or production credentials. See
`SECURITY.md`. If you suspect a secret was committed, stop and report it
immediately — do not push a "fix" commit on top of it.
