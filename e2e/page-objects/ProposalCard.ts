import { Locator, Page } from "@playwright/test";

/**
 * Page Object Model for a Proposal Card
 */
export class ProposalCard {
  private card: Locator;

  constructor(page: Page, index: number) {
    this.card = page.getByTestId(`proposal-card-${index}`);
  }

  /**
   * Get the title of the proposal
   */
  async getTitle() {
    const titleElement = this.card.locator(".card-title");
    return await titleElement.textContent();
  }

  /**
   * Get the description of the proposal
   */
  async getDescription() {
    return await this.card.locator("p").first().textContent();
  }

  /**
   * Get the start date and time of the proposal
   */
  async getDateTime() {
    const timeElement = this.card.locator('div:has-text("Data i czas:")');
    return await timeElement.textContent();
  }

  /**
   * Get the duration of the proposal
   */
  async getDuration() {
    const durationElement = this.card.locator('div:has-text("Czas trwania:")');
    return await durationElement.textContent();
  }

  /**
   * Get the location of the proposal
   */
  async getLocation() {
    const locationElement = this.card.locator('div:has-text("Miejsce:")');
    return await locationElement.textContent();
  }

  /**
   * Click the accept button on this proposal card
   */
  async accept() {
    await this.card.getByTestId("accept-proposal-button").click();
  }

  /**
   * Check if this proposal card is currently selected
   */
  async isSelected() {
    const className = await this.card.getAttribute("class");
    return className?.includes("ring-2 ring-primary") || false;
  }
}
