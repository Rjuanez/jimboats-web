import { defineConfig, devices } from "@playwright/test";

const port = process.env.PLAYWRIGHT_PORT ?? "3000";
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;
const webServerCommand =
  process.env.PLAYWRIGHT_WEB_SERVER_COMMAND ??
  `JIMBOATS_ADMIN_PREVIEW_DATA=1 npx pnpm@10.34.1 dev --hostname 127.0.0.1 --port ${port}`;
const reuseExistingServer = process.env.PLAYWRIGHT_REUSE_EXISTING_SERVER
  ? process.env.PLAYWRIGHT_REUSE_EXISTING_SERVER === "1"
  : !process.env.CI;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: webServerCommand,
    reuseExistingServer,
    timeout: 120_000,
    url: baseURL,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
