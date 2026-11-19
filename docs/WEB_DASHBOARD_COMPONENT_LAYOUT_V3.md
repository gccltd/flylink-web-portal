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


## Visual revision v3.1 — 2026-11-20

The user's follow-up establishes a **light lilac / powder-blue cyber-city
atmosphere**, translucent blue-to-violet **jelly glass**, rounded local scroll
tracks, subtle pointer feedback, and a **denser, more refined** Dashboard.
This supersedes the previous heavy midnight-blue city veil; it does not change
the grid, underlying order/catalog values, routes, or payment flows.

- **Backdrop:** reuse the existing compressed 1600×900 static WebP with lighter
  lilac/blue washes, not a new asset. No video, animation or parallax.
  The v3.2 follow-up permits fixed attachment on wide desktop with a
  fine pointer only; narrow screens and device preferences retain scrolling
  CSS gradients. A last-in-cascade prefers-reduced-data rule avoids the WebP.
- **Frosted surfaces:** translucent sapphire/lilac gradients, restrained inner
  highlights and 8px blur only on the account overview and four Dashboard
  panels, at desktop widths with browser support. Unsupported browsers
  receive high-contrast fallback surfaces.
- **Themes:** light theme keeps dark text in pale glass; dark theme uses
  readable white text on tinted cards, but dark greeting text on the bright
  skyline. Reduced-transparency devices receive opaque gradients.
- **Density:** 18–19px panel padding, 14px card spacing; retain the v3
  minimum card sizes and existing three-offer/three-order caps.
- **Tactility:** hover and press feedback only for fine-pointer input;
  1–2px movement, gentle edge glow, short transitions and explicit
  3px keyboard focus. Reduced-motion preferences disable movement.
- **Local jelly scrolling:** thin 7px rounded gradient thumbs on Recent Orders
  and Marketplace preview, with nested scroll only above 1100px; compact
  browser windows use natural full-page scrolling.
- **Isolation:** the visual system is scoped to Web Shell only. The lighter
  city background additionally requires the Dashboard content; Orders,
  Wallet and other non-dashboard views preserve established contrast.
  The legacy /portal surface is unchanged.

### Review gate

Lint, tests and preview readiness do **not** constitute browser pixel-level
approval. PR remains Draft until authorized light/dark and viewport visual
review and independent code review.


## Visual revision v3.2 — 2026-11-20

Approved next iteration: bring the **sidebar → topbar → content cards**
transparency into one coherent hierarchy; tighten the greeting; keep the
city background stable during wide-screen scrolling; and organize plan and
order content in compact, readable rows.

| Layer / component | Contract |
| --- | --- |
| Sidebar | Most solid glass layer, blue-indigo alpha ~0.74–0.79 in dark theme; restrained edge separator |
| Topbar | Slightly lighter blue-violet glass, alpha ~0.68–0.72; no second hero layer |
| Overview and four cards | Translucent blue-purple glass alpha ~0.66–0.70, thin highlights and selective 8px blur |
| Light theme | Parallel high-contrast pale-glass palette with darker text |
| Greeting | 21–26px heading, 12px subtitle, 3px inside gap and 7px to overview |
| Overview | Minimum 204px, smaller action rail and tighter cell spacing |
| Plan preview | Three authoritative server offers maximum; 76px minimum rows with title/summary left and price/action aligned right; current-plan border only when the real current-renew action is supplied |
| Orders | Maximum three actual records; 66px minimum integrated rows, product and order metadata left; actual status, amount and currency details right. No fabricated amount, state or date |

### Fixed background scope and load guard

At 1200px+ **and** only where hover/fine pointer support is present,
the existing **single 1600×900 WebP** is pinned via CSS background
attachment. This is a fixed visual treatment, not a fixed scrolling pane,
second image, parallax effect or JavaScript scroll listener. The layout and
all content continue to scroll normally.

At 1199px or below, touch/coarse-pointer layouts, or when the user requests
reduced motion, reduced transparency or reduced data, the background
attachment is not fixed. Reduced-data must also remove the image URL;
the previous data-saver cascade guard remains authoritative.

The fixed attachment may increase redraw work on some browsers,
especially combined with frosted panels. An authorized browser visual
and performance pass is therefore mandatory; turn off fixed attachment if
it causes scroll jank or paint bottlenecks. No claim is made that green CI
proves acceptable frame rate.

### Interactions and compatibility

- Hover/pressed state effects remain keyboard and reduced-motion compatible.
- Group order category/reference and timestamp into distinct text spans for
  visual alignment, preserving the button's accessible name and action.
- Retain real commerce, wallet, session and referral data contracts.
- Only the desktop Web Shell uses this cascade; the legacy /portal UI,
  API and Android app remain unchanged.
- Review 768, 1024, 1280, 1440 and 1920 CSS-pixel widths in both themes.
  All PRs stay Draft until authorized visual verification and independent review.

## Visual revision v3.3 — 2026-11-20

This is the first approved slice of the newly generated polished concept image
`a_detailed_high_quality_ui_design_mockup_composit.png`: tighter greeting
integrated into the pale lilac/powder-blue skyline, unified rounded components,
lightweight section icons, and one distinct color aura per functional card.
The concept image's coins, order amounts and dates remain examples, not data.

### Finalized shape / spacing tokens

| Element | Value | Implementation |
| --- | --- | --- |
| Overview radius | 22px | `--web-radius-overview` |
| Main panel radius | 20px | `--web-radius-card` |
| Offer / order row radius | 13px | `--web-radius-row` |
| Nav / topbar buttons / CTA | 12px | `--web-radius-action` |
| State badge | 999px pill, min 22px height | `--web-radius-pill` |
| Card spacing | 14px | `--web-spacing-cards` |
| Greeting | 7/12/6px padding, thin gradient fading to transparent at 96% | No separate hero banner |

### Scope of current code slice

- Web-only icon hierarchy: existing three Overview labels, Marketplace header,
  Recent Orders header, Wallet emblem, Start Using header and its three
  benefits. Dashboard-preview offer titles get a decorative Layers icon or
  Crown for genuine `current_renew` state. All decorative glyphs are
  `aria-hidden`; aria labels, order data and actions remain unchanged.
- Personalized panels: a single restrained nonanimated blue/cyan/violet
  aura per functional panel, using the same shared Jelly Glass base.
- Unified selected-plan and order state pills by dimensions and radii;
  original domain-specific badge colors and labels are preserved.
- The legacy `/portal` route hides additional decorative icons and retains
  its original layout. Full Marketplace does not receive Dashboard icon
  markup; `dashboardAccent` is optional and defaults false.
- Preserve background's fixed-width guard, reduced-data, reduced-motion
  and reduced-transparency preferences from v3.2.

### Deferred to later review

Do not add recommendation campaigns, connection status feeds, new order
statuses, avatar customization, or backend-powered alerts until source
contracts and an explicit product need are established. Full payment/renewal
dialog styling is also a separate focused validation step.
## Visual revision v3.4 — topbar adjacency & concept-aligned plan rows

Accepted 2026-11-20: the greeting is raised to the top content edge,
and the icon position of Overview, Wallet and plan-list rows is reconciled
with the latest light-lilac Web Dashboard concept. All changes are /web-only.

- Dashboard desktop begins at 72px (64px fixed topbar + 8px separation);
  greeting inset is 4/10/3px. Other routes preserve their main padding.
- Metric emblems now sit left of entire label/value/metadata groups
  (36px glyph tiles, 44px first-cell inset, 64px for separated wide cells).
- Wallet header icon is left-aligned on /web; legacy /portal keeps its
  right-hand original icon without changing accessibility text.
- Offer rows use explicit icon + plan title/description at left, and
  authoritative Coins price + existing CTA at right, min-height 76px.
  A genuine current-plan note extends across the row; no invented
  recommendation badge, plan, price or payment action is introduced.
- Narrow browser layouts stack the offer's left and right regions.
  All changes retain the previous fixed-background/reduced-data guards.
- Review gate: exact-head CI, authorized light/dark screenshots at
  768/1024/1280/1440/1920px, overflow and independent Review.

## Visual revision v3.5 — concept-matched plan/order cards without nested scrolling (2026-11-20)

**Source:** user-provided light-blue/lilac Web Dashboard component-spec image,
2026-11-20. The image shows sample plans, amounts, order statuses and dates;
those values are decorative examples, not production data.

### Layout recalculation (CSS px, responsive and content-aware)

| Element | New desktop contract | Behavior |
| --- | --- | --- |
| Account overview | 204px minimum, original data cells and actions | No business changes |
| Top columns at 1101px+ | **50% : 50%** with 12px gap | Marketplace + Wallet (left); Recent Orders + Start (right) |
| Marketplace card | **334px minimum**; 17px vertical/18px horizontal padding | Up to three real plan offers; grow to fit long title, context or errors |
| Recent Orders card | **334px minimum**; same padding | Up to three actual records; grow for date, status, partial/loading or retry copy |
| Individual plan row | **76px minimum**, icon / title+summary / Coins / existing CTA | One horizontal line on desktop, long copy wraps; no fixed row height |
| Individual order row | **66px minimum**, 28px receipt icon / product+ref+date / actual status+amount | One horizontal line when space allows; grows if wrapping needed |
| Wallet and Start | **182px minimum each** | Independent content, may grow for translations |
| Main card rhythm | 12px between columns/panels, 7px within lists | Removes earlier unbalanced long blank space |
| Browser 721–1100px | Single column, panel min-height reset to 0 | Natural-height document scroll |
| Browser <=720px | One column with stacked offer actions, order metadata below description | Natural-height document scroll |

**Scroll removal:** remove the former 233px Recent Orders and 306px Plan
Marketplace `max-height` rules, remove scrollbar visual styling and use
`max-height:none; overflow:visible; height:auto`. Users scroll the whole
page once, with no nested list scrollbar, overscroll capture, or hidden
items. Existing offer/order preview count is still max three, and the
"View all"/"Go to Marketplace" destinations remain authoritative.

**Accessibility:** the per-order Receipt icon is `aria-hidden`; original
button text, real amounts/status, retry/error states and full Marketplace
purchase flows are untouched. Panels are not given fixed heights. The
fixed-city / reduced-data visual safeguards remain as in v3.4.

**Acceptance:** exact commit CI including responsive source contract tests,
authorized real-browser visual review at 768/1024/1280/1440/1920px with
light/dark and long-data cases, independent reviewer; keep Draft and do
not deploy production based only on Preview Ready.
