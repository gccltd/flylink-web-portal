# Security Policy

## Reporting a vulnerability

Report vulnerabilities through GitHub's private vulnerability reporting
(Security tab → "Report a vulnerability") on this repository. Do not open a
public issue for a security problem, and do not include exploit details in
any public channel.

## What this repository does and does not hold

- This repository contains only the desktop web portal frontend. It holds no
  production credentials, no private keys, no backend database and no user
  data.
- The portal frontend talks to the subscription control plane over
  same-origin relative `/api/portal/*` calls. It never embeds a backend base
  URL, token or secret.
- The local preview client ships only placeholder values for development and
  tests. A placeholder that looks like a real credential is a bug — report
  it the same way.

## Supported versions

Only the current `main` branch is supported. Security fixes land on `main`;
there are no maintained release branches.
