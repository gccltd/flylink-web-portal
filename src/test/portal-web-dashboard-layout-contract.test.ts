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
});
