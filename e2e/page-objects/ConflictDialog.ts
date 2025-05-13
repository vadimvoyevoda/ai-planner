import type { Page } from "@playwright/test";
import { SELECTORS } from "../selectors";

/**
 * Page Object Model for the Conflict Dialog
 */
export class ConflictDialog {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Check if the conflict dialog is visible
   */
  async isVisible() {
    return await this.page.locator(SELECTORS.CONFIRM_DIALOG).isVisible();
  }

  /**
   * Get all conflicts listed in the dialog
   */
  async getConflicts() {
    const conflictsList = this.page.locator(SELECTORS.CONFLICTS_LIST);
    const conflicts = conflictsList.locator("li");
    return await conflicts.allTextContents();
  }

  /**
   * Count the number of conflicts
   */
  async countConflicts() {
    const conflicts = this.page.locator(SELECTORS.CONFLICTS_LIST).locator("li");
    return await conflicts.count();
  }

  /**
   * Click the Cancel button
   */
  async clickCancel() {
    await this.page.locator(SELECTORS.CANCEL_CONFLICTS_BUTTON).click();
  }

  /**
   * Click the Accept button to proceed despite conflicts
   */
  async clickAccept() {
    await this.page.locator(SELECTORS.ACCEPT_WITH_CONFLICTS_BUTTON).click();
  }
}
