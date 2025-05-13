import { defineConfig, devices } from "@playwright/test";
import path from "path";

// Dotenv is not needed here anymore as we're using dotenv-cli in the npm scripts

// Check if environment variables are loaded
console.log("Environment check in playwright.config.ts:");
console.log(`- SUPABASE_URL: ${process.env.SUPABASE_URL ? "set" : "undefined"}`);
console.log(`- SUPABASE_PUBLIC_KEY: ${process.env.SUPABASE_PUBLIC_KEY ? "set" : "undefined"}`);

export default defineConfig({
  testDir: "./",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  // Global setup for authentication
  globalSetup: require.resolve("./setup-global.ts"),

  // Default options for all tests
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    actionTimeout: 60000,
    testTimeout: 90000, // 90 seconds to provide enough time for operations
    storageState: path.join(__dirname, "playwright/.auth/user.json"),
  },

  projects: [
    // Project for generating storage state (saving authentication data)
    {
      name: "setup-auth",
      testMatch: /setup-auth\.ts/,
    },

    // Project for cleaning up the database
    {
      name: "cleanup-db",
      testMatch: /global\.teardown\.ts/,
    },

    // Main test project
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
      dependencies: ["cleanup-db"],
    },
  ],

  webServer: {
    command: "npm run e2e:dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
  },

  // Avoid conflicts with Vitest
  expect: {
    timeout: 30000, // Increased from 10 to 30 seconds
  },

  // Remove conflicting workers config
});
