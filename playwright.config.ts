import { defineConfig, devices } from "@playwright/test";

const requestedPort = process.env.PLAYWRIGHT_PORT ?? "3000";
if (!/^[1-9][0-9]{0,4}$/.test(requestedPort) || Number(requestedPort) > 65_535) {
  throw new Error("PLAYWRIGHT_PORT must be an integer from 1 through 65535.");
}
const port = Number(requestedPort);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev --hostname 127.0.0.1",
    env: { PORT: String(port) },
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
