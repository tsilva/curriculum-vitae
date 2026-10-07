import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/smoke",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "test -d web/out || (echo 'Run npm --prefix web run build before smoke tests.' && exit 1); python3 scripts/smoke-server.py",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
});
