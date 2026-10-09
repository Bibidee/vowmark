import { defineConfig, devices } from "@playwright/test";
import { E2E_REGISTRY, E2E_VAULT } from "./e2e/config";

export default defineConfig({
  workers: 1,
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_VOWMARK_REGISTRY_ADDRESS: E2E_REGISTRY,
      NEXT_PUBLIC_VOWMARK_VAULT_ADDRESS: E2E_VAULT,
    },
  },
  projects: [
    { name: "chromium", testMatch: /(?:vowmark|activity)\.spec\.ts$/, use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", testMatch: /(?:vowmark|activity)\.spec\.ts$/, use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, isMobile: true } },
    { name: "mobile-360", testMatch: /responsive\.spec\.ts$/, use: { ...devices["Desktop Chrome"], viewport: { width: 360, height: 800 }, isMobile: true } },
    { name: "tablet", testMatch: /responsive\.spec\.ts$/, use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 }, isMobile: true } },
  ],
});
