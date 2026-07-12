import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const e2ePort = process.env.E2E_PORT ?? "5199";
const baseURL =
  process.env.E2E_BASE_URL ?? `http://localhost:${e2ePort}`;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  timeout: 60_000,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run dev -- --port ${e2ePort}`,
        url: baseURL,
        // Always start a dedicated server so seeded data and DATABASE_URL match.
        reuseExistingServer: false,
        timeout: 120_000,
        env: {
          ...process.env,
          NODE_ENV: "development",
          CONTACT_E2E: "1",
        },
      },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
