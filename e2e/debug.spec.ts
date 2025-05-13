import { test, expect } from "@playwright/test";

test("debug proposals page", async ({ page }) => {
  // Przejdź na stronę proposals
  await page.goto("http://localhost:3000/proposals");

  // Zrób zrzut ekranu
  await page.screenshot({ path: "e2e/screenshots/proposals.png" });

  // Sprawdź zawartość HTML
  const html = await page.content();
  console.log("Page HTML:", html);

  // Sprawdź czy element istnieje
  const noteInput = await page.locator('[data-test-id="meeting-note-input"]').count();
  console.log("Found note input elements:", noteInput);

  // Sprawdź ID wszystkich elementów z data-test-id
  const testIdElements = await page.locator("[data-test-id]").all();
  console.log(`Found ${testIdElements.length} elements with data-test-id`);

  for (const element of testIdElements) {
    const testId = await element.getAttribute("data-test-id");
    const tagName = await element.evaluate((el) => el.tagName);
    console.log(`Element: ${tagName} with data-test-id="${testId}"`);
  }
});
