import { test } from "@playwright/test";

test("debug proposal page DOM", async ({ page }) => {
  // Przejdź na stronę proposals
  await page.goto("http://localhost:3000/proposals");

  // Wykonaj zrzut ekranu
  await page.screenshot({ path: "e2e/screenshots/proposals-debug.png" });

  // Znajdź all textareas
  const textareas = await page.locator("textarea").all();
  console.log(`Found ${textareas.length} textareas`);

  for (const textarea of textareas) {
    const id = await textarea.getAttribute("id");
    const name = await textarea.getAttribute("name");
    const placeholder = await textarea.getAttribute("placeholder");
    console.log(`Textarea: id="${id}", name="${name}", placeholder="${placeholder}"`);
  }

  // Znajdź wszystkie przyciski
  const buttons = await page.locator("button").all();
  console.log(`Found ${buttons.length} buttons`);

  for (const button of buttons) {
    const text = await button.textContent();
    const type = await button.getAttribute("type");
    const classAttr = await button.getAttribute("class");
    console.log(`Button: text="${text.trim()}", type="${type}", class="${classAttr}"`);
  }

  // Znajdź all form elements
  const forms = await page.locator("form").all();
  console.log(`Found ${forms.length} forms`);

  // Znajdź wszystkie elementy label
  const labels = await page.locator("label").all();
  console.log(`Found ${labels.length} labels`);

  for (const label of labels) {
    const text = await label.textContent();
    const forAttr = await label.getAttribute("for");
    console.log(`Label: text="${text.trim()}", for="${forAttr}"`);
  }
});
