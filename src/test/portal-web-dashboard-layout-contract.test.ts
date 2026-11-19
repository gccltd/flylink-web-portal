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

});
