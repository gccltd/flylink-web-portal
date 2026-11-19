import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const desktopConfig = readFileSync(resolve("vite.portal-web.config.ts"), "utf8");
const desktopIndex = readFileSync(resolve("portal-web/index.html"), "utf8");
const mobileIndex = readFileSync(resolve("portal/index.html"), "utf8");
const webCss = readFileSync(resolve("src/styles/portal-static-preserve/user-portal-desktop.css"), "utf8");
const robotLogo = readFileSync(resolve("public/portal-brand-robot.webp"));
const cityScene = readFileSync(resolve("public/portal-dashboard-scene.webp"));
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

  test("keeps full-resolution but compressed Web-only assets and responsive scene gating", () => {
    expect(robotLogo.byteLength).toBeLessThan(12 * 1024);
    expect(cityScene.byteLength).toBeGreaterThan(24 * 1024);
    expect(cityScene.byteLength).toBeLessThan(180 * 1024);
    expect(cityScene.toString("ascii", 0, 4)).toBe("RIFF");
    expect(cityScene.toString("ascii", 8, 12)).toBe("WEBP");
    expect(cityScene.toString("ascii", 12, 16)).toBe("VP8 ");
    expect(cityScene.readUInt16LE(26) & 0x3fff).toBe(1600);
    expect(cityScene.readUInt16LE(28) & 0x3fff).toBe(900);
    expect(webCss).toContain("portal-v2-shell--web");
    expect(webCss).toContain("@media (min-width: 1200px)");
    expect(webCss).toContain("prefers-reduced-data");
    expect(webCss).toContain("background-size:100% 100%,100% auto");
  });

  test("keeps desktop public URLs separate from the legacy mobile entry", () => {
    expect(desktopIndex).toContain('href="/web/favicon.svg"');
    expect(mobileIndex).toContain('href="/favicon.svg"');
    expect(desktopIndex).not.toContain('href="/favicon.svg"');
  });
});
