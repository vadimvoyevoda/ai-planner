import type { Page } from "@playwright/test";
import { SELECTORS } from "../selectors";

/**
 * Page Object Model for the Login Page
 */
export class LoginPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the login page
   */
  async goto() {
    await this.page.goto("/login", { timeout: 30000 });
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Fill the login form
   */
  async fillLoginForm(email: string, password: string) {
    await this.page.locator(SELECTORS.LOGIN_EMAIL_INPUT).fill(email);
    await this.page.locator(SELECTORS.LOGIN_PASSWORD_INPUT).fill(password);
  }

  /**
   * Submit the login form
   */
  async submitForm() {
    await this.page.locator(SELECTORS.LOGIN_SUBMIT_BUTTON).click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Login with the provided credentials
   */
  async login(email: string, password: string) {
    await this.goto();
    await this.fillLoginForm(email, password);
    await this.submitForm()
  }

  /**
   * Login with the E2E test credentials from environment variables
   */
  async loginWithTestCredentials() {
    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;
    
    if (!username || !password) {
      throw new Error("Missing E2E_USERNAME or E2E_PASSWORD environment variables");
    }
    
    await this.login(username, password);
  }

  /**
   * Check if login was successful by looking for specific elements
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      // Check if we're on the home page or we can find elements that only appear when logged in
      const url = this.page.url();
      if (url.match(/^\/$|\/dashboard|\/proposals/)) {
        return true;
      }
      
      // Check for logout button or user profile elements
      const logoutElement = await this.page.locator('a:has-text("Logout"), button:has-text("Logout")').count();
      if (logoutElement > 0) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error checking login status:", error);
      return false;
    }
  }
} 