import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const webLayout = readFileSync(resolve("src/styles/portal-static-preserve/user-portal-web-dashboard-v3.css"), "utf8");
const stylesheet = readFileSync(resolve("src/portal-static-preserve.css"), "utf8");
const page = readFileSync(resolve("src/features/user-portal/user-portal-page.tsx"), "utf8");
const commerce = readFileSync(resolve("src/features/user-portal/portal-commerce-panels.tsx"), "utf8");

describe("Web-only Dashboard concept v3 layout contract", () => {
  test("loads the dedicated layout after commerce styles for predictable scoped overrides", () => {
    expect(stylesheet).toContain('user-portal-web-dashboard-v3.css');
    expect(stylesheet.indexOf('user-portal-web-dashboard-v3.css')).toBeGreaterThan(
      stylesheet.indexOf('user-portal-commerce.css')
    );
  });

  test("keeps the dashboard columns independent without altering the legacy /portal grid", () => {
    expect(page).toContain('portal-v2-dashboard-column--primary');
    expect(page).toContain('portal-v2-dashboard-column--secondary');
    expect(webLayout).toContain('.portal-v2-shell:not(.portal-v2-shell--web) .portal-v2-dashboard-column');
    expect(webLayout).toContain('display: contents;');
    expect(webLayout).toContain('grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr)');
    expect(webLayout).toContain('grid-auto-rows: max-content');
  });

  test("does not collapse the separate usage page grid into Dashboard card areas", () => {
    expect(webLayout).toContain('.portal-v2-dashboard-grid:not(.usage)');
    expect(webLayout).toContain('.portal-v2-dashboard-grid.usage');
    expect(webLayout).toContain('grid-template-areas: none;');
  });

  test("Dashboard replaces only the Web offer preview with the subscription manager", () => {
    const start = page.indexOf('function DashboardPanel(');
    const end = page.indexOf('function UsagePanel(', start);
    const panel = page.slice(start, end);
    expect(panel).toContain('isPortalWebPath() ? (');
    expect(panel).toContain('<DashboardSubscriptionCard');
    expect(panel).toContain('<DashboardMarketplaceCard');
    expect(panel).toContain('walletFirstAccount={walletFirstAccount}');
    expect(panel).toContain('onReveal={onRevealSubscriptionLink}');
    expect(panel).toContain('onReset={onResetSubscriptionLink}');
  });

  test("limits only the Web Dashboard catalog preview but retains Portal and full Marketplace offers", () => {
    const idx = commerce.indexOf('export function DashboardMarketplaceCard(');
    const end = commerce.indexOf('type MarketplaceModelState =', idx);
    const dashboardCard = commerce.slice(idx, end);
    expect(dashboardCard).toContain('isPortalWebPath() ? planOffers.slice(0, 3) : planOffers');
    expect(dashboardCard).toContain('visiblePlanOffers.map');
    expect(dashboardCard).toContain('onPrimary={onOpenMarketplace}');
    expect(dashboardCard).toContain('onClick={onOpenMarketplace}');
  });

  test("defines overview, offer, order, wallet and start sizing without large backdrop blur", () => {
    for (const token of ['min-height: 216px', 'min-height: 348px', 'min-height: 278px',
      'min-height: 166px', 'min-height: 85px', 'min-height: 66px']) {
      expect(webLayout).toContain(token);
    }
    expect(webLayout).toContain('backdrop-filter: none;');
    expect(webLayout).toContain('portal-v2-dashboard-wallet');
    expect(webLayout).toContain('portal-v2-dashboard-start');
  });

  test("includes width and theme fallbacks and respects reduced motion", () => {
    expect(webLayout).toContain('@media (min-width: 1200px)');
    expect(webLayout).toContain('@media (min-width: 1101px)');
    expect(webLayout).toContain('@media (max-width: 1100px)');
    expect(webLayout).toContain('@media (max-width: 480px)');
    expect(webLayout).toContain('[data-portal-theme="light"]');
    expect(webLayout).toContain('@media (prefers-reduced-motion: reduce)');
  });

  test("replaces the heavy black skyline with a pastel city wash without a second image", () => {
    expect(webLayout).toContain('Concept v3.1: pale lilac / powder-blue');
    expect(webLayout).toContain('rgba(175, 202, 254, 0.42)');
    expect(webLayout).toContain('url("/web/portal-dashboard-scene.webp")');
    expect(webLayout).toContain(':has(.portal-v2-dashboard-column)');
    expect(webLayout).toContain('background-attachment: fixed;');
    expect(webLayout).not.toContain('animation: infinite');
  });

  test("layers restrained frosted glass only on local Web cards", () => {
    expect(webLayout).toContain('--web-jelly-panel: linear-gradient(');
    expect(webLayout).toContain('backdrop-filter: blur(8px) saturate(120%)');
    expect(webLayout).toContain('@supports (backdrop-filter: blur(1px))');
    expect(webLayout).toContain('(prefers-reduced-transparency: reduce)');
    expect(webLayout).toContain('data-portal-theme="light"] .portal-v2-hero-card');
    expect(webLayout).toContain('box-shadow: inset 0 1px 0');
  });

  test("uses whole-page scroll instead of nested Dashboard offer/order scrollers", () => {
    expect(webLayout).toContain("Concept v3.5");
    expect(webLayout).toContain("max-height: none;");
    expect(webLayout).toContain("overflow: visible;");
    expect(webLayout).toContain("scrollbar-gutter: auto;");
    expect(webLayout).not.toContain("max-height: 233px;");
    expect(webLayout).not.toContain("max-height: 306px;");
    expect(webLayout).not.toContain("overflow-y: auto;");
    expect(webLayout).not.toContain("scrollbar-width: thin;");
    expect(webLayout).toContain("outline: 3px solid #48baf0;");
    expect(webLayout).toContain("@media (prefers-reduced-motion: reduce)");
  });

  test("preserves reduced-data priority after city background overrides", () => {
    const marker = 'Last in the cascade so the pale-skyline override';
    const n = webLayout.lastIndexOf(marker);
    expect(n).toBeGreaterThan(webLayout.lastIndexOf('url("/web/portal-dashboard-scene.webp")'));
    expect(webLayout.slice(n)).toContain('@media (prefers-reduced-data: reduce)');
    expect(webLayout.slice(n)).not.toContain('url("/web/portal-dashboard-scene.webp")');
  });



  test("keeps the skyline fixed only on wide fine-pointer desktop and restores the fallbacks", () => {
    expect(webLayout).toContain("Concept v3.2: unified glass depth");
    expect(webLayout).toContain("@media (min-width: 1200px) and (hover: hover) and (pointer: fine)");
    const fixed = webLayout.lastIndexOf("background-attachment: fixed;");
    const fallback = webLayout.indexOf("background-attachment: scroll;", fixed);
    expect(fixed).toBeGreaterThan(0);
    expect(fallback).toBeGreaterThan(fixed);
    const guard = webLayout.slice(fixed, fallback);
    expect(guard).toContain("(prefers-reduced-motion: reduce)");
    expect(guard).toContain("(prefers-reduced-transparency: reduce)");
    expect(guard).toContain("(prefers-reduced-data: reduce)");
    expect(guard).toContain("(max-width: 1199px)");
    expect(webLayout).not.toContain("background-attachment: fixed !important");
  });

  test("unifies sidebar, topbar and five glass panels at descending opacity without new assets", () => {
    expect(webLayout).toContain("--web-glass-chrome: linear-gradient(");
    expect(webLayout).toContain("--web-glass-top: linear-gradient(");
    expect(webLayout).toContain("--web-jelly-panel: linear-gradient(");
    expect(webLayout).toContain("rgba(27, 47, 102, 0.79)");
    expect(webLayout).toContain("rgba(32, 56, 115, 0.72)");
    expect(webLayout).toContain("rgba(28, 55, 113, 0.70)");
    expect(webLayout).toContain(".portal-v2-sidebar");
    expect(webLayout).toContain(".portal-v2-topbar");
    expect(webLayout).toContain("[data-portal-theme=\"light\"]");
  });

  test("makes the greeting compact and integrates plans and orders without altering data", () => {
    expect(webLayout).toContain(".portal-v2-greeting");
    expect(webLayout).toContain("gap: 7px;");
    expect(webLayout).toContain("font-size: clamp(21px, 1.85vw, 26px)");
    expect(webLayout).toContain("min-height: 204px;");
    expect(webLayout).toContain(".portal-marketplace-card--current article");
    expect(webLayout).toContain(".portal-v2-dashboard-order-detail");
    expect(webLayout).toContain("font-variant-numeric: tabular-nums");
    const orderComponent = readFileSync(
      resolve("src/features/user-portal/dashboard/dashboard-recent-orders.tsx"), "utf8"
    );
    expect(orderComponent).toContain('className="portal-v2-dashboard-order-detail"');
    expect(orderComponent).toContain('{order.orderNumber}');
    expect(orderComponent).toContain('{order.createdAtLabel}');
    expect(orderComponent).toContain('· {order.createdAtLabel}');
    expect(webLayout).toContain('order: -1;');
    expect(orderComponent).toContain('orders.slice(0, 3)');
  });


  test("defines the compact greeting fade and unified radii only for Web Dashboard", () => {
    expect(webLayout).toContain("Concept v3.3: tokenized shape system");
    expect(webLayout).toContain("--web-radius-card: 20px;");
    expect(webLayout).toContain("--web-radius-row: 13px;");
    expect(webLayout).toContain("--web-radius-action: 12px;");
    expect(webLayout).toContain("--web-radius-pill: 999px;");
    expect(webLayout).toContain(".portal-v2-greeting");
    expect(webLayout).toContain("linear-gradient(90deg");
    expect(webLayout).toContain("transparent 96%");
    expect(webLayout).toContain('portal-v2-shell--web');
  });

  test("keeps decorative icons in visual headings and per-offer accents without altering order data", () => {
    const recent = readFileSync(resolve("src/features/user-portal/dashboard/dashboard-recent-orders.tsx"), "utf8");
    const start = readFileSync(resolve("src/features/user-portal/dashboard/dashboard-start-card.tsx"), "utf8");
    const wallet = readFileSync(resolve("src/features/user-portal/dashboard/dashboard-wallet-card.tsx"), "utf8");
    const offer = readFileSync(resolve("src/features/user-portal/marketplace-offer-card.tsx"), "utf8");
    expect(recent).toContain('className="portal-dashboard-header-icon" aria-hidden="true"');
    expect(start).toContain("<Globe2 aria-hidden");
    expect(start).toContain("<ShieldCheck aria-hidden");
    expect(wallet).toContain('className="portal-dashboard-wallet-icon"');
    expect(commerce).toContain("dashboardAccent={isPortalWebPath()}");
    expect(offer).toContain("dashboardAccent = false");
    expect(offer).toContain("planAction?.action === \"current_renew\"");
    expect(webLayout).toContain(".portal-marketplace-card__decor");
    expect(webLayout).toContain('portal-v2-shell:not(.portal-v2-shell--web)');
    expect(recent).toContain("orders.slice(0, 3)");
  });

  test("adds nonsemantic card personality, state pills and focus without continuous animation", () => {
    expect(webLayout).toContain("--web-card-aura:");
    expect(webLayout).toContain(".portal-v2-dashboard-marketplace");
    expect(webLayout).toContain(".portal-v2-dashboard-orders");
    expect(webLayout).toContain(".portal-v2-dashboard-wallet");
    expect(webLayout).toContain(".portal-v2-dashboard-start");
    expect(webLayout).toContain(".portal-order-status");
    expect(webLayout).toContain(":focus-visible");
    expect(webLayout).toContain("@media (prefers-reduced-motion: reduce)");
    expect(webLayout).not.toContain("animation: infinite");
  });


  test("moves Web-only greeting up without touching other routes", () => {
    expect(webLayout).toContain("Concept v3.4:");
    expect(webLayout).toContain(".portal-v2-main:has(.portal-v2-dashboard-column)");
    expect(webLayout).toContain("padding-top: 72px;");
    expect(webLayout).toContain(".portal-v2-hero-block {gap: 6px;}");
  });

  test("places metric emblems beside the whole cell and restores separators", () => {
    expect(webLayout).toContain("width: 36px;");
    expect(webLayout).toContain("position: absolute;");
    expect(webLayout).toContain(".portal-v2-hero-card__cell + .portal-v2-hero-card__cell");
    expect(webLayout).toContain("left: 22px;");
  });

  test("matches plan row icon/description-left and Coins/CTA-right structure", () => {
    const offer = readFileSync(resolve("src/features/user-portal/marketplace-offer-card.tsx"), "utf8");
    expect(offer).toContain('portal-marketplace-card__dashboard-layout');
    expect(offer).toContain('portal-marketplace-card__identity');
    expect(offer).toContain('portal-marketplace-card__copy');
    expect(offer).toContain('!dashboardAccent ? <p>{offer.summary[locale]}</p>');
    expect(webLayout).toContain('grid-template-areas: "identity price" "identity action" "context context"');
    expect(webLayout).toContain('grid-template-areas: "identity" "price" "action" "context"');
    expect(webLayout).toContain('grid-template-columns: 32px minmax(0, 1fr)');
  });


  test("keeps all three rows visible and balances Dashboard cards on wide screens", () => {
    expect(webLayout).toContain("--web-dashboard-top-min: 334px;");
    expect(webLayout).toContain("--web-dashboard-bottom-min: 182px;");
    expect(webLayout).toContain("--web-dashboard-gap: 12px;");
    expect(webLayout).toContain('grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);');
    expect(webLayout).toContain('grid-template-areas: "identity price action" "context context context";');
    expect(webLayout).toContain('grid-template-areas: "icon main meta";');
    expect(webLayout).toContain('grid-template-areas: "icon main" ". meta";');
    const offers = readFileSync(resolve("src/features/user-portal/portal-commerce-panels.tsx"), "utf8");
    const orders = readFileSync(resolve("src/features/user-portal/dashboard/dashboard-recent-orders.tsx"), "utf8");
    expect(offers).toContain("isPortalWebPath() ? planOffers.slice(0, 3) : planOffers");
    expect(orders).toContain("orders.slice(0, 3)");
    expect(orders).toContain('className="portal-v2-dashboard-order-icon" aria-hidden="true"');
    expect(webLayout).toContain('.portal-v2-shell:not(.portal-v2-shell--web) .portal-v2-dashboard-order-icon');
    expect(webLayout).toContain('display: none;');
    expect(orders).toContain('onClick={onOpenOrders}');
  });

  test("preserves responsive height and genuine missing-data status cases", () => {
    expect(webLayout).toContain("@media (min-width: 721px) and (max-width: 1100px)");
    expect(webLayout).toContain("min-height: 0;");
    expect(webLayout).toContain("height: auto;");
    expect(webLayout).toContain("overflow-wrap: anywhere;");
    const orders = readFileSync(resolve("src/features/user-portal/dashboard/dashboard-recent-orders.tsx"), "utf8");
    expect(orders).toContain('{order.amountLabel ?');
    expect(orders).toContain('{order.amountDetail ?');
    expect(orders).toContain('{order.statusLabel}');
  });


  test("loads the independent Web rail and three personalized offer treatments after v3 styles", () => {
    const concept = readFileSync(resolve("src/styles/portal-static-preserve/user-portal-concept-v4.css"), "utf8");
    const sidebar = readFileSync(resolve("src/features/user-portal/layout/portal-sidebar.tsx"), "utf8");
    const offer = readFileSync(resolve("src/features/user-portal/marketplace-offer-card.tsx"), "utf8");
    expect(stylesheet.indexOf("user-portal-concept-v4.css")).toBeGreaterThan(
      stylesheet.indexOf("user-portal-web-dashboard-v3.css")
    );
    expect(concept).toContain("--web-rail-width: 196px;");
    expect(concept).toContain("--web-rail-width:206px;");
    expect(concept).toContain("left: calc(var(--web-rail-width) + 24px)");
    expect(concept).toContain(".portal-v2-topbar-brand");
    expect(concept).not.toContain("portal-sidebar-scene");
    expect(sidebar).not.toContain("portal-sidebar-scene");
    expect(sidebar.match(/portalAssetPath\("portal-sidebar-mascot\.webp"\)/g)).toHaveLength(1);
    expect(sidebar).toContain("isPortalWebPath()");
    expect(offer).toContain("dashboardVariant?: 0 | 1 | 2");
    expect(concept).toContain("portal-marketplace-card__concept-0");
    expect(concept).toContain("portal-marketplace-card__concept-1");
    expect(concept).toContain("portal-marketplace-card__concept-2");
    expect(concept).toContain("min-height:122px;");
  });

  test("removes only Web Dashboard's redundant wallet while retaining actual overview balance", () => {
    expect(page).toContain("!isPortalWebPath() ? (");
    expect(page).toContain("<DashboardWalletCard");
    const overview = readFileSync(resolve("src/features/user-portal/dashboard/dashboard-overview-card.tsx"), "utf8");
    expect(overview).toContain('walletBalance === null ? "—" : walletBalance + " Coins"');
    expect(overview).toContain('portal-v2-overview-crest');
  });

  test("keeps the compact brand mark and plan art static, scoped and low-cost", () => {
    const concept = readFileSync(resolve("src/styles/portal-static-preserve/user-portal-concept-v4.css"), "utf8");
    const sidebar = readFileSync(resolve("src/features/user-portal/layout/portal-sidebar.tsx"), "utf8");
    const image = readFileSync(resolve("public/portal-sidebar-mascot.webp"));
    expect(image.byteLength).toBeLessThan(32 * 1024);
    expect(image.toString("ascii", 8, 12)).toBe("WEBP");
    expect(sidebar).toContain('portalAssetPath("portal-sidebar-mascot.webp")');
    expect(sidebar).not.toContain('loading="lazy"');
    expect(sidebar).not.toContain("portal-sidebar-scene");
    expect(concept).toContain("(max-width: 1023px)");
    expect(concept).toContain("(prefers-reduced-motion:reduce)");
    expect(concept).not.toContain("animation: infinite");
    expect(concept).not.toContain("background-attachment: fixed;");
  });


  test("keeps the complete Web Dashboard in the second grid track", () => {
    const concept = readFileSync(resolve("src/styles/portal-static-preserve/user-portal-concept-v4.css"), "utf8");
    const shell = readFileSync(resolve("src/features/user-portal/layout/portal-app-shell.tsx"), "utf8");
    const sidebar = readFileSync(resolve("src/features/user-portal/layout/portal-sidebar.tsx"), "utf8");
    expect(concept).toContain(".portal-v2-shell.portal-v2-shell--web > .portal-v2-main");
    expect(concept).toContain("grid-column: 2;");
    expect(concept).toContain("grid-row: 1;");
    expect(concept).toContain("position: sticky;");
    expect(concept).toContain("grid-column: 1;");
    expect(concept).toContain("left: calc(var(--web-rail-width) + 24px)");
    expect(shell.indexOf("{sidebar}")).toBeLessThan(shell.indexOf("<main"));
    expect(shell).toContain("portal-v2-main");
    expect(sidebar).toContain('portalAssetPath("portal-sidebar-mascot.webp")');
    expect(concept).toContain("grid-template-columns: calc(var(--web-rail-width) + 24px) minmax(0, 1fr)");
  });


  test("finishes overview glass separators and keeps long plan notices out of CTA sizing", () => {
    const concept = readFileSync(resolve("src/styles/portal-static-preserve/user-portal-concept-v4.css"), "utf8");
    const offer = readFileSync(resolve("src/features/user-portal/marketplace-offer-card.tsx"), "utf8");
    expect(concept).toContain("Concept v4.2 — user-marked overview glass and resilient plan rows");
    expect(concept).toContain(".portal-v2-hero-card::before");
    expect(concept).toContain("@media (min-width: 901px)");
    expect(concept).toContain("border-left: 1px solid rgba(104,125,185,.34);");
    expect(concept).toContain('grid-template-areas: "identity price" "identity action" "reason reason" "context context";');
    expect(concept).toContain("max-width: 184px;");
    expect(concept).toContain("flex-direction: column;");
    expect(concept).toContain("grid-area: auto;");
    expect(concept).toContain('grid-template-areas: "identity" "price" "action" "reason" "context";');
    expect(offer).toContain('const unavailableReasonText = planAction?.action === "unavailable"');
    expect(offer).toContain('className="portal-marketplace-card__reason"');
    expect(offer).toContain("dashboardAccent && unavailableReasonText");
    expect(offer).toContain("!dashboardAccent && unavailableReasonText");
  });


  test("uses one rounded Web shell and keeps the topbar as integrated page chrome", () => {
    const concept = readFileSync(resolve("src/styles/portal-static-preserve/user-portal-concept-v4.css"), "utf8");
    const marker = "Concept v4.3 — one rounded Web application surface";
    const v43 = concept.slice(concept.indexOf(marker));
    expect(v43).toContain("margin: 12px;");
    expect(v43).toContain("border-radius: 28px;");
    expect(v43).toContain("grid-template-columns: var(--web-rail-width) minmax(0, 1fr);");
    expect(v43).toContain("border-radius: 27px 0 0 27px;");
    expect(v43).toContain("position: relative;");
    expect(v43).toContain("border-radius: 0;");
    expect(v43).toContain("background: transparent;");
    expect(v43).toContain("box-shadow: none;");
    expect(v43).toContain("padding-top: 0;");
    expect(v43).toContain("border-bottom: 1px solid rgba(145, 165, 215, .30);");
    expect(v43).not.toContain("position: fixed;");
    expect(v43).toContain("prefers-reduced-transparency: reduce");
  });


  test("applies the v4.4 shape system, integrated glass topbar and immediate touch feedback", () => {
    const concept = readFileSync(resolve("src/styles/portal-static-preserve/user-portal-concept-v4.css"), "utf8");
    const marker = "Concept v4.4 — unified shape, glass finish and immediate feedback";
    const v44 = concept.slice(concept.indexOf(marker));
    expect(v44).toContain("--web-radius-shell: 24px;");
    expect(v44).toContain("--web-radius-panel: 18px;");
    expect(v44).toContain("--web-radius-row: 12px;");
    expect(v44).toContain("--web-radius-control: 10px;");
    expect(v44).toContain("border-top-right-radius: var(--web-radius-shell);");
    expect(v44).toContain("backdrop-filter: blur(12px) saturate(140%);");
    expect(v44).toContain("var(--web-card-aura),");
    expect(v44).toContain("radial-gradient(340px 180px at 14% 0%");
    expect(v44).toContain("pointer-events: none;");
    expect(v44).toContain("touch-action: manipulation;");
    expect(v44).toContain("transition-duration: 60ms;");
    expect(v44).toContain("portal-v2-dashboard-orders .portal-v2-list button:active");
    expect(v44).toContain("portal-use-nav-item.active::before");
    expect(v44).toContain("portal-use-nav-item:hover::after");
    expect(v44).toContain("@media (prefers-reduced-transparency: reduce)");
    expect(v44).toContain("@media (prefers-reduced-motion: reduce)");
    const reducedTransparency = v44.slice(v44.indexOf("@media (prefers-reduced-transparency: reduce)"));
    for (const selector of [
      ".portal-v2-hero-card",
      ".portal-v2-dashboard-marketplace",
      ".portal-v2-dashboard-orders",
      ".portal-v2-dashboard-wallet",
      ".portal-v2-dashboard-start"
    ]) {
      expect(reducedTransparency).toContain(selector);
    }
    expect(reducedTransparency).toContain("backdrop-filter: none;");
    const reducedMotion = v44.slice(v44.indexOf("@media (prefers-reduced-motion: reduce)"));
    for (const selector of [
      ".portal-v2-dashboard-marketplace .portal-marketplace-card__actions button",
      ".portal-v2-dashboard-orders .portal-link-button",
      ".portal-v2-dashboard-wallet > .portal-primary-button",
      ".portal-v2-dashboard-start > .portal-primary-button",
      ".portal-v2-topbar-icon-button",
      ".portal-v2-topbar-user-button"
    ]) {
      expect(reducedMotion).toContain(selector);
    }
    expect(reducedMotion).toContain("transition: none;");
    expect(reducedMotion).toContain("transform: none;");
    for (const stateSelector of [
      ".portal-use-nav-item:hover::after",
      ".portal-use-nav-item:active",
      ".portal-v2-dashboard-orders .portal-v2-list button:hover",
      ".portal-v2-dashboard-orders .portal-v2-list button:active",
      ".portal-v2-dashboard-marketplace:hover",
      ".portal-v2-dashboard-orders:hover",
      ".portal-v2-hero-action:hover",
      ".portal-v2-dashboard-marketplace .portal-marketplace-card__actions button:hover:not(:disabled)",
      ".portal-v2-dashboard-marketplace .portal-marketplace-card article:hover",
      ".portal-use-nav-item:is(:hover, :focus-visible)",
      ".portal-use-nav-item:hover svg",
      ".portal-v2-topbar-icon-button:active"
    ]) {
      expect(reducedMotion).toContain(stateSelector);
    }
    expect(v44).not.toContain("transition: all");
    const activeRule = v44.indexOf(".portal-v2-shell.portal-v2-shell--web .portal-v2-hero-action:active");
    const finePointerRule = v44.lastIndexOf("@media (hover: hover) and (pointer: fine)", activeRule);
    expect(activeRule).toBeGreaterThan(-1);
    expect(finePointerRule).toBe(-1);
  });

});
