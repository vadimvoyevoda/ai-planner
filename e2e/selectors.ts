/**
 * Test selectors used across Playwright tests
 */
export const SELECTORS = {
  // Form elements
  MEETING_NOTE_INPUT: '[data-test-id="meeting-note-input"]',
  PROPOSE_MEETING_BUTTON: '[data-test-id="propose-meeting-button"]',

  // Proposal elements
  LOADING_PROPOSALS: '[data-test-id="loading-proposals"]',
  PROPOSALS_HEADING: '[data-test-id="proposals-container"] > h2',
  PROPOSALS_CONTAINER: '[data-test-id="proposals-container"]',
  PROPOSAL_CARD: (index: number) => `[data-test-id="proposal-card-${index}"]`,
  ACCEPT_PROPOSAL_BUTTON: '[data-test-id="accept-proposal-button"]',

  // Conflict dialog
  CONFIRM_DIALOG: '[data-test-id="confirm-dialog"]',
  CONFLICTS_LIST: '[data-test-id="conflicts-list"]',
  CANCEL_CONFLICTS_BUTTON: '[data-test-id="cancel-conflicts-button"]',
  ACCEPT_WITH_CONFLICTS_BUTTON: '[data-test-id="accept-with-conflicts-button"]',
};
