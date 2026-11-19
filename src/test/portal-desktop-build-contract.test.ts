import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const desktopConfig = readFileSync(resolve("vite.portal-web.config.ts"), "utf8");
const desktopIndex = readFileSync(resolve("portal-web/index.html"), "utf8");
const mobileIndex = readFileSync(resolve("portal/index.html"), "utf8");
const portalDesktopCss = readFileSync(resolve("src/styles/portal-static-preserve/user-portal-desktop.css"), "utf8");
const robotBrandAsset = readFileSync(resolve("public/portal-brand-robot.webp"));
const dashboardSceneAsset = readFileSync(resolve("public/portal-dashboard-scene.webp"));
const packageJson = JSON.parse(readFileSync(resolve("package.json"), "utf8")) as {
  scripts?: Record<string, string>;
};

describe("portal desktop build boundary", () => {
  test("uses the shared Portal policy config with an isolated web base/output", () => {
    expect(desktopConfig).toContain('import portalConfig from "./vite.portal.config"');
    expect(desktopConfig).toContain("mergeConfig(portalConfig");
    expect(desktopConfig).toContain('root: path.resolve(adminDir, "portal-web")');
    expect(desktopConfig).toContain('base: "/web/"');
    expect(desktopConfig).toContain('path.resolve(adminDir, "dist-portal-web")');
    expect(packageJson.scripts?.["build:portal:web"]).toContain("vite build --config vite.portal-web.config.ts");
    expect(packageJson.scripts?.["verify:portal:web"]).toContain("dist-portal-web");
  });

  test("keeps the Web shell scene and robot assets inside small transfer budgets", () => {
    expect(robotBrandAsset.byteLength).toBeLessThan(12 * 1024);
    expect(dashboardSceneAsset.byteLength).toBeLessThan(24 * 1024);
    expect(portalDesktopCss).toContain("grid-template-columns: 168px");
    expect(portalDesktopCss).toContain("@media (min-width: 1200px)");
    expect(portalDesktopCss).toContain("prefers-reduced-data");
  });

  test("keeps desktop public URLs separate from the legacy mobile entry", () => {
    expect(desktopIndex).toContain('href="/web/favicon.svg"');
    expect(mobileIndex).toContain('href="/favicon.svg"');
    expect(desktopIndex).not.toContain('href="/favicon.svg"');
  });
});
