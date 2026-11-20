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

## Visual revision v4 — independent brand rail & concept-designed plan previews (2026-11-20)

**Source:** the user's selected third concept and its subsequent iteration:
standalone lilac-blue sidebar, brand robot at top, realistic high-definition
robot on a neon base at bottom, central plan-status overview with floating
shield, and three differently decorated plan cards with prominent CTAs.
Illustrated prices, durations, order values, names and labels in the concept
are visual examples **only**. Runtime data remains authoritative.

**Scope:** standalone `/web` user center. PR #17 remains stacked on PR #16.
The legacy `/portal` and Android clients retain their existing layout,
navigation, brand placement, and commerce behavior.

### Navigation and chrome
- From 1440px: 206px independent rounded rail, 12px outside inset.
  From 1024–1439px: 196px rail. From 721–1023px: 76px icon rail;
  below that, retain existing narrow-Web navigation.
- The rail owns the original FlyLink robot brand/logo. It sits above the
  page and is **not covered by the topbar**: the latter starts to the
  right of the rail at the shared inset instead of spanning the viewport.
- Six previously established navigation routes and their labels stay
  intact. Selected state uses a cyan→blue→violet pill with distinct
  keyboard focus; no new route is invented.
- The lower sidebar uses the already supplied brand robot image
  (standalone compressed 510×363 WebP, approximately 19 KiB) and static
  CSS orbital/pedestal accents. The image is lazy-loaded; short viewports,
  collapsed tablet rail and reduced-data mode hide the scene. No
  animations, video or heavyweight composited background is introduced.

### Overview / Marketplace
- The three real account metrics and existing renew/top-up/order/start
  controls remain intact. On roomy screens a decorative, aria-hidden
  shield sits beside them; it must not overlap labels or traffic values.
- The redundant lower **Wallet** card is removed **only from the /web
  Dashboard**. The overview's live wallet balance and Wallet navigation
  remain; the legacy `/portal` Dashboard keeps its lower Wallet card.
- The Marketplace becomes a full-height left column aligned to the right
  independent Orders+Start stack, with **no nested scrolling**.
  Left panel minimum height ~528px; content always grows for longer
  authoritative descriptions or alternative business states.
- Up to three offers still come from `catalog.offers` (no hardcoded
  durations, plan benefits, tiers, or prices). Position 0/1/2 gets
  only different cyan, violet and warm-gold decorative treatments:
  calendar, crystal and crown motifs respectively. These motifs and
  glows do not constitute actual product recommendations.
- Each offer has a light-glass stage with a left illustration,
  real plan title and summary, real Coins price and the original
  callback. In the /web preview, the normal buy/reserve button has
  visually compact text (立即购买/立即预约); its full original
  accessible label remains. Real renew/upgrade/downgrade and disabled
  labels are left unchanged.
- The right-side Recent Orders and Start cards keep their real data,
  natural height, navigation and error behavior; no invented data.

### Responsive / accessibility / performance
- Main independent Dashboard columns at 1101px+; 721–1100px stacks
  Marketplace→Orders→Start; long plan text wraps and cards grow rather
  than hiding data. No internal offer/order scrolling.
- Photo/illustration icons are decorative and aria-hidden. Navigation
  focus and button accessible names remain. Hover glow is pointer-only
  and motion is disabled when requested.
- The original compressed static city scene, privacy, authentication,
  checkout and business contracts are unchanged.
- Validate Lint/Vitest/Desktop Build/Build Verify on exact HEAD,
  followed by protected-preview browser review at
  768,1024,1280,1440,1920 CSS pixels in both themes and long-label states.
  Keep both stacked PRs Draft until pixel review and independent review.

## v4.1 Regression correction — 2026-11-20 (user-reported disappearance)

User reviewed the v4 Vercel Preview and reported that multiple Dashboard
components had disappeared. Earlier CI green / Vercel READY did not establish
a browser pixel sign-off. Source inspection identified an objective grid
auto-placement defect:

- `PortalAppShell` renders exactly two Grid children in order:
  `{sidebar}`, then `<main className="portal-v2-main">`.
- v4 set the **sidebar to `position: fixed`**. Fixed positioning takes it
  out of Grid placement, leaving `main` as the first in-flow child.
- v4 reserved a narrow first column for the rail but did **not** explicitly
  place `main` in column 2, so the entire Dashboard could be auto-placed
  into the approximately 220px-wide first track and appear collapsed or
  missing. Desktop Build and static tests did not catch this CSS bug.

**Repair:** the standalone Web sidebar is now `position: sticky`,
`grid-column:1; grid-row:1` (keeping it in-flow), with explicit
`> .portal-v2-main { grid-column:2; grid-row:1; min-width:0 }`.
The topbar still starts to the right of the rail, never obscuring the logo.
The wallet below the marketplace remains *intentionally absent* in /web
as previously requested; the other overview components must be visible.

**Brand asset correction:** previous v4 mascot was an unverified
crop of a concept image. It is replaced with a WebP re-encoding of the
actual user GPT Library file `image-gen-5(2).png` (1254×1254,
transparent official blue/violet robot-face badge). It is resized to
480×480, retaining alpha, quality 82, only 21,780 bytes; reused for
both top-left brand and sidebar illustration. This preserves the
brand character instead of making a new one from UI imagery. A
separate verified *full-body* original has not yet been identified,
so do not claim a full-body asset was reproduced.

**Acceptance:** exact-head CI must pass. Since Vercel Preview is
SSO-protected and Chat browser access is unavailable in this
session, real screenshot validation still requires an authenticated
browser. Do not re-label the UI visually approved based on CI alone.

## v4.2 — user-marked overview background and plan-card finish (2026-11-20)

**Source:** the user's annotated Dashboard screenshot. The requested scope is the
top account/plan overview background and the three plan preview cards in the
Marketplace panel. This is a visual/layout correction only.

### Overview background

- Finish the pale blue/lilac glass surface with layered static radial light,
  a restrained upper sheen, and a clearer edge.
- Strengthen the two metric separators so the plan, traffic and wallet cells
  read as distinct groups without introducing another card.
- Keep the four existing actions in one bounded row. Secondary actions use
  dark navy labels on the pale action rail for readable contrast; the primary
  renewal action retains its existing gradient and behavior.
- Preserve the real account, traffic, expiry and Coins values. No decorative
  background layer may intercept pointer or keyboard input.

### Marketplace offer rows

- Keep the existing icon + title/summary left, price + CTA right composition.
  The title and summary are explicitly stacked; legacy named grid areas must
  not create implicit columns inside the nested copy container.
- Cap the action column at 184px on wide desktop and 152px at 1101–1439px.
  A long unavailable reason is moved outside the CTA wrapper into its own
  full-width note row, so it cannot widen the action track or squeeze the
  product identity.
- Current-plan expiry context remains a separate full-width note. Rows grow
  naturally for long localized text; no nested scrolling or clipped copy.
- At 721–1100px the offer icon and note indentation compact; at <=720px the
  offer stacks into identity, price, action, unavailable reason and context.
- The legacy /portal Marketplace retains the original unavailable-reason
  placement. Only the /web Dashboard preview uses the new note row.

### Data and release boundary

Catalog titles, summaries, durations, Coins prices, plan-switch states,
unavailable reason codes, purchase callbacks and renewal behavior remain
server-authoritative and unchanged. No API, payment, wallet, authentication,
Android or production configuration changes are included.

**Acceptance:** exact-head Lint, Vitest, Desktop Build and Build Verify; then
authorized Preview visual review at 768/1024/1280/1440/1920 CSS pixels in both
themes, including unavailable, current-plan, long-copy and normal-purchase
states. Keep PR #17 Draft and do not merge or promote production until the
pixel review and independent review are complete.

## v4.3 — unified rounded application shell and integrated topbar (2026-11-20)

**Source:** the user's newly supplied comparison set. The first image is the
approved overall composition; the following red-marked images show the
current split-card implementation and the exact topbar area to correct.

### Corrected structural hierarchy

- The entire desktop /web user center is one outer rounded application
  surface with a thin glass edge and restrained outer shadow.
- The existing indigo sidebar is the left region of that same shell. It
  meets the outer top/left/bottom edges; its own brand and static robot scene
  remain intact. The rail width is the actual first grid track, not an
  independently inset floating card.
- Notifications, help and account controls remain in the top-right of the
  main region, but the topbar is now ordinary in-flow page chrome: no fixed
  positioning, no separate rounded rectangle, no independent background
  card, and no floating-card shadow. A subtle bottom divider is retained.
- The greeting is the first content heading below the topbar, directly on
  the page surface rather than inside a banner card. The account overview
  card follows the greeting; Marketplace, Orders, Wallet and Start panels
  continue below in their existing dashboard grid.
- The outer shell supplies the unified rounded silhouette. The account
  overview, Marketplace offer rows, Recent Orders and Start Using panels
  remain separate functional cards; no business panels are merged or removed.

### Responsive and behavior boundaries

- Desktop shell uses 12px outer inset and 28px radius; compact tablet uses
  8px inset and 22px radius. Sidebar width remains 196/206px on desktop
  and 76px on compact tablet. At <=720px the established narrow-Web/mobile
  layout is unchanged.
- Topbar returns to normal document flow, so the main content no longer
  reserves the old 88px fixed-header spacer. It remains above the greeting
  and does not cover the sidebar.
- The topbar user menu must remain visible; the shell does not introduce
  overflow clipping. Reduced-transparency preference receives an opaque
  header strip without restoring a floating card.

### Data and release boundary

No React component hierarchy, account data, plan/traffic/Coins values,
checkout callbacks, navigation routes, authentication, API, Android or
production settings change. This is a scoped /web shell and CSS correction.

**Acceptance:** exact-head Lint, Vitest, Desktop Build and Build Verify;
then authorized browser screenshots at 768/1024/1280/1440/1920 CSS px in
both themes. Verify the outer rounded boundary, sidebar integration,
topbar transparency/in-flow placement, user-menu visibility, greeting
spacing and all dashboard cards. Keep PR #17 Draft until visual and
independent reviews are complete.

## v4.4 — unified radius, smoother glass, nav highlight and immediate feedback (2026-11-20)

### Shape and overview corner
- Web shell radius is 24px on desktop and 20px on compact tablet. The sidebar joins the left edge of the shell with matching inner radii.
- Dashboard top-level cards (account overview, Marketplace, Recent Orders, Wallet where rendered, Start Using) share 18px radius. Inner offer/order rows share 12px. Action buttons and icon bases use 10px; status pills remain fully rounded as semantic labels.
- The third user-marked screenshot's top-right overview/header corner is rendered by a translucent header surface with a 24px top-right radius. The topbar remains in document flow and does not become a separate floating card.

### Glass and navigation
- Topbar glass is a continuous blue-lilac gradient with a soft opacity falloff, 12px backdrop blur and a subtle lower separator. The pseudo-surface is pointer-transparent and rounds only the outer top-right corner.
- Major Dashboard cards retain the existing theme-specific jelly surface and 8px desktop backdrop blur. Local radial highlights and restrained inset edge-light unify the cards. Inner offer/order rows use translucent highlights without adding another nested backdrop blur, avoiding extra compositing work.
- The lower robot stage is removed from the Web sidebar. The compact brand robot mark at the top remains. Six navigation entries and their destinations are unchanged.
- Navigation active state gains a narrow local cyan glow; fine-pointer hover gets a restrained light sweep. No continuous or infinite animation is added.

### Click/press feedback diagnosis and repair
- Source inspection found the existing Dashboard active rules inside a hover/fine-pointer media query at a 1024px minimum width. Touch/coarse pointers therefore did not receive the same pressed visual state.
- Existing Dashboard card transitions used 180ms for border/shadow/transform; offer rows and action buttons used 150ms. The backdrop blur itself was static, not animated. The main correction is to provide pressed feedback for touch and mouse outside the fine-pointer query, shorten transform feedback to 60–70ms, and remove shadow/filter from the transition path. touch-action manipulation is applied to Web buttons.
- The interaction fix is CSS-only: no delayed timers, debounce, async work, or callback changes. This is a code-level diagnosis; actual device/browser latency still requires the visual smoke test on the protected Preview.

### Scope and validation
- All changes are scoped to the Web shell; /portal, Mobile, business data, pricing, purchase callbacks, navigation routes, authentication, API and production settings remain unchanged.
- Regression tests cover removal of the lower mascot, preservation of the top brand mark, radius tokens, integrated topbar corner, pointer-transparent highlight layers, touch pressed states, and reduced-motion/transparency fallbacks.
- Keep PR #17 OPEN / Draft until exact-head CI, preview screenshot checks and independent Review are complete.
