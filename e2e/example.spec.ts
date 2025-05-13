import { test, expect } from "@playwright/test";

test("basic test", async ({ page }) => {
  // Navigate to the home page
  await page.goto("http://localhost:3000/");

  // Verify page has loaded
  await expect(page).toHaveTitle(/AI Planner|My Schedule/);

  // Take screenshot for verification
  await page.screenshot({ path: "e2e/screenshots/home.png" });
});
