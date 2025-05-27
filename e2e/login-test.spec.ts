import { test, expect } from "@playwright/test";
import { LoginPage } from "./page-objects/LoginPage";

// These environment variables must be defined in .env.test
const E2E_USERNAME = process.env.E2E_USERNAME as string;
const E2E_PASSWORD = process.env.E2E_PASSWORD as string;

// Verify required environment variables are set
if (!E2E_USERNAME || !E2E_PASSWORD) {
  throw new Error("Missing required environment variables for E2E tests");
}

test("should log in with valid credentials", async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Go to login page and fill form
  await loginPage.goto();
  await loginPage.fillLoginForm(E2E_USERNAME, E2E_PASSWORD);
  
  // Take screenshot before submitting
  await page.screenshot({ path: "e2e/screenshots/before-login-submit.png" });
  
  // Submit the form
  await loginPage.submitForm();
  
  // Take screenshot after submitting
  await page.screenshot({ path: "e2e/screenshots/after-login-submit.png" });
  
  // Check if login was successful
  expect(await loginPage.isLoggedIn()).toBeTruthy();
  
  // Verify we're on the expected page after login
  expect(page.url()).toMatch(/^\/$|\/dashboard|\/proposals/);
});

test("should use the loginWithTestCredentials helper", async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  // Use the helper method
  await loginPage.loginWithTestCredentials();
  
  // Verify login was successful
  expect(await loginPage.isLoggedIn()).toBeTruthy();
}); 