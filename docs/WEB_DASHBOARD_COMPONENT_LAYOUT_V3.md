# FlyLink Web Dashboard v3 — Component layout specification

- Source: **second desktop Web user-center concept** `image-gen-2(20261117-110726).png`, dated 2026-11-17. The screenshot is a visual reference; the displayed 70 Coins, plan names, dates, prices and completed orders are illustrative only, never fixture data for production.
- Scope: dedicated `/web` desktop user center. The `/portal` compatibility surface must retain its pre-existing presentation; no Android changes, API changes, transaction logic, payment changes, account changes or invented business records.
- UI baseline: PR #16, `bc22982d2002c91c0fb916f94986b67178be45c3`.

## Layout hierarchy

1. Full-width global topbar and left sidebar remain owned by the Shell. The brand robot stays **top-left**; user avatar remains separate at top-right.
2. Greeting + one account-overview panel: current plan, actual remaining-traffic state, available wallet balance; four actions (renew/browse plans, top-up, orders, start). Do not show a hypothetical traffic balance or invented order amount.
3. Below the overview, **independent 45/55 columns**, not two synchronized grid rows:
   - Left: Plan Marketplace preview (at most **3 server offers**) followed immediately by Wallet.
   - Right: Recent activity (at most **3 server projections**) followed immediately by Start Using.
4. Renewal / purchase modal is shown by the existing transaction workflow **on invocation only**; never persist a decorative mock checkout across the dashboard.
5. Labels, error/loading/empty states, pricing, amount states and existing button destinations must retain their original source and behavior.

## Desktop component sizing

| Component | Reference-matched contract |
| --- | --- |
| Content | max width 1380px; 16px main gap; relative to existing Shell |
| Greeting | 23–30px title, 13px body |
| Overview | minimum height 216px; 22px radius; 24/26px top/side inset; 3 cells + 4 actions |
| Overview cells | 1.38 : 1 : 0.94 on wide desktop, subtle separators; responsive collapse |
| Action row | four equal actions, 44px min height, 8px gap, cyan-blue-violet primary |
| Marketplace | minimum height 348px; 19px radius; compact 85px minimum offer rows; first 3 real offers only |
| Recent orders | minimum height 278px; up to 3 rows, 66px minimum each; amount/status right aligned where present |
| Wallet | minimum height 166px; balance and recharge CTA on one row |
| Start Using | minimum height 216px; static gradient orbit accent (no animation) |
| Borders | subtle translucent cool-blue, 1px; minimal low-spread shadows |
| Typography | 17px section titles, 13–14px item titles, 11–12px metadata |

## Responsive decisions

- **≥1440px:** 184px Shell sidebar from PR #16; 45/55 two-column dashboard, three overview cells, skyline background.
- **1200–1439px:** 176px Shell sidebar; keep overview and columns, backed by static skyline.
- **1101–1199px:** independent two columns with tighter offer preview and no skyline fetch.
- **721–1100px:** compact 76px icon rail when <=1023px; single column with order *Marketplace → Orders → Wallet → Start*, keeping accessible navigation labels.
- **≤720px:** single-column Web layout and CSS-gradient background; existing Web navigation behavior remains (no Android-app bottom navigation introduced).
- **Light/dark:** separate high-contrast card and text colors. Motion: no continuous animation; honor reduced-motion. Data preference: skyline absent when reduced-data media query matches.

## Acceptance

- Lint, Vitest, Desktop Web build, build verifier pass on the exact PR HEAD.
- Browser visual review for 768 / 1024 / 1280 / 1440 / 1920px, both light and dark. Requires authenticated access to Vercel Preview if protected by SSO; build green is not equivalent to pixel review.
- The source-only layout contract validates card classes, responsive behavior and /web-scoped selectors, **not** pixel-level rendering.
- Keep PR Draft until actual visual QA and independent review; no production deployment or merge.
