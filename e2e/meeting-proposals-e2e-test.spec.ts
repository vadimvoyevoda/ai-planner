import { test, expect } from "@playwright/test";
import { ProposalsPage } from "./page-objects/ProposalsPage";
import { ConflictDialog } from "./page-objects/ConflictDialog";
import { LoginPage } from "./page-objects/LoginPage";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/db/database.types";
import { SELECTORS } from "./selectors";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// These environment variables must be defined in .env.test
const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL as string;
const SUPABASE_PUBLIC_KEY = process.env.PUBLIC_SUPABASE_KEY as string;
const E2E_USERNAME = process.env.E2E_USERNAME as string;
const E2E_PASSWORD = process.env.E2E_PASSWORD as string;

// Base URL for testing
const BASE_URL = 'http://localhost:3000';

// Create equivalent of __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verify required environment variables are set
if (!SUPABASE_URL || !SUPABASE_PUBLIC_KEY || !E2E_USERNAME || !E2E_PASSWORD) {
  throw new Error("Missing required environment variables for E2E tests");
}

test.describe('Meeting Proposals Flow', () => {
  test('should allow user to propose and accept a meeting', async ({ page }) => {
    // Ensure screenshots directory exists
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Step 1: Navigate to login page
    console.log('Step 1: Navigating to login page');
    await page.goto(`${BASE_URL}/auth/login`);
    await page.screenshot({ path: path.join(screenshotsDir, '01-login-page.png') });

    // Wait for login form to be visible
    await page.waitForSelector(SELECTORS.LOGIN_EMAIL_INPUT, { state: 'visible' });
    await page.waitForSelector(SELECTORS.LOGIN_PASSWORD_INPUT, { state: 'visible' });

    // Step 2-3: Enter credentials from env variables
    console.log('Step 2-3: Entering login credentials');
    await page.fill(SELECTORS.LOGIN_EMAIL_INPUT, E2E_USERNAME);
    await page.fill(SELECTORS.LOGIN_PASSWORD_INPUT, E2E_PASSWORD);
    await page.screenshot({ path: path.join(screenshotsDir, '02-credentials-entered.png') });

    // Step 4: Click login button
    console.log('Step 4: Submitting login form');
    await page.click(SELECTORS.LOGIN_SUBMIT_BUTTON);
    await page.screenshot({ path: path.join(screenshotsDir, '021-submit-login-form.png') });

    // Step 5: Verify redirect to home page
    console.log('Step 5: Verifying redirect to home page');
    await page.waitForURL(`${BASE_URL}/`, { timeout: 60000 });
    await page.screenshot({ path: path.join(screenshotsDir, '03-logged-in.png') });

    // Step 6: Navigate to proposals page
    console.log('Step 6: Navigating to proposals page');
    await page.goto(`${BASE_URL}/proposals`);
    await page.screenshot({ path: path.join(screenshotsDir, '04-proposals-page.png') });

    // Step 7: Enter meeting note
    console.log('Step 7: Entering meeting note');
    await page.fill(SELECTORS.MEETING_NOTE_INPUT, 'E2E Test Meeting Proposal');
    await page.screenshot({ path: path.join(screenshotsDir, '05-meeting-note-entered.png') });

    // Step 8: Click propose meeting button
    console.log('Step 8: Clicking propose meeting button');
    await page.click(SELECTORS.PROPOSE_MEETING_BUTTON);
    
    // Step 9: Wait for proposals to load
    console.log('Step 9: Waiting for proposals to appear');
    await page.waitForSelector(SELECTORS.LOADING_PROPOSALS, { state: 'hidden' });
    await page.waitForSelector(SELECTORS.PROPOSALS_CONTAINER);
    
    // Make sure proposals are visible
    const proposalsHeading = await page.textContent(SELECTORS.PROPOSALS_HEADING);
    expect(proposalsHeading).toBeTruthy();
    
    // Wait for the first proposal card to be visible
    await page.waitForSelector(SELECTORS.PROPOSAL_CARD(0));
    await page.screenshot({ path: path.join(screenshotsDir, '06-proposals-loaded.png') });

    // Step 10: Click accept button on first proposal
    console.log('Step 10: Clicking accept button on first proposal');
    const firstProposalCard = await page.locator(SELECTORS.PROPOSAL_CARD(0));
    await firstProposalCard.locator(SELECTORS.ACCEPT_PROPOSAL_BUTTON).click();
    
    // Handle possible conflict dialog if it appears
    const hasConflictDialog = await page.locator(SELECTORS.CONFIRM_DIALOG).isVisible();
    if (hasConflictDialog) {
      console.log('- Handling conflict dialog');
      await page.screenshot({ path: path.join(screenshotsDir, '07-conflict-dialog.png') });
      await page.click(SELECTORS.ACCEPT_WITH_CONFLICTS_BUTTON);
    }
    
    // Step 11: Verify redirect to home page
    console.log('Step 11: Verifying redirect to home page after accepting proposal');
    await page.waitForURL(`${BASE_URL}/`, { timeout: 60000 });
    await page.screenshot({ path: path.join(screenshotsDir, '08-back-to-home.png') });
    
    console.log('E2E test completed successfully');
  });
});