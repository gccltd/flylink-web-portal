import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Minimal equivalent of the jsdom test setup that used to live in the
// admin shell's vite.config.ts (test.environment only; the dev-server
// /api proxy from that file belongs to the admin shell and is not needed
// here — portal tests mock fetch, and the portal build uses
// vite.portal-web.config.ts).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
  },
});
