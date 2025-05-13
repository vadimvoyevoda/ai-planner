import { test, expect } from "@playwright/test";

test("basic navigation test", async ({ page }) => {
  await page.goto("http://localhost:3000/");

  // Take screenshot to see what's on the page
  await page.screenshot({ path: "e2e/screenshots/homepage.png" });

  // Check if we can navigate to a page that actually exists
  const navLinks = await page.locator("a").all();
  console.log(`Found ${navLinks.length} links on the homepage`);

  // Print all links for debugging
  for (let i = 0; i < navLinks.length; i++) {
    const href = await navLinks[i].getAttribute("href");
    const text = await navLinks[i].textContent();
    console.log(`Link ${i}: href="${href}", text="${text}"`);
  }
});
