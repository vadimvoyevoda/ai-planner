import { test, expect } from "@playwright/test";
import { ProposalsPage } from "./page-objects/ProposalsPage";
import { ConflictDialog } from "./page-objects/ConflictDialog";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/db/database.types";
import { SELECTORS } from "./selectors";
import { TEST_CONFIG } from "./config";

// Ustawienie bazowego URL dla testów
const { BASE_URL } = TEST_CONFIG;

// These environment variables must be defined in .env.test
const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL as string;
const SUPABASE_PUBLIC_KEY = process.env.PUBLIC_SUPABASE_KEY as string;
const E2E_USERNAME = process.env.E2E_USERNAME as string;
const E2E_PASSWORD = process.env.E2E_PASSWORD as string;

// Funkcja do wyodrębnienia project ID z URL Supabase
function extractProjectIdFromUrl(url: string): string {
  try {
    // URL będzie w formacie https://<project-id>.supabase.co
    const matches = url.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (matches && matches[1]) {
      console.log(`Extracted project ID from URL: ${matches[1]}`);
      return matches[1];
    }
  } catch (error) {
    console.error("Error extracting project ID from URL:", error);
  }
  // Jeśli nie udało się wyodrębnić, użyj domyślnej wartości
  return "127";
}

// ID projektu Supabase - wyodrębnione z URL lub użyte z env, lub domyślne "127"
const SUPABASE_PROJECT_ID = process.env.PUBLIC_SUPABASE_PROJECT_ID || extractProjectIdFromUrl(SUPABASE_URL) || "127";

// Verify required environment variables are set
if (!SUPABASE_URL || !SUPABASE_PUBLIC_KEY || !E2E_USERNAME || !E2E_PASSWORD) {
  throw new Error("Missing required environment variables for E2E tests");
}

test.beforeEach(async ({ page }) => {
  // Inicjalizacja klienta Supabase
  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

  // Bezpośrednie logowanie przez API zamiast przez UI
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: E2E_USERNAME,
    password: E2E_PASSWORD,
  });

  if (signInError) {
    console.error("Error signing in:", signInError);
    throw signInError;
  }

  // Pobierz dane sesji po zalogowaniu
  const { data: sessionData } = await supabase.auth.getSession();
  
  // Znajdź nazwę tokenu ciasteczka z Supabase
  // @ts-ignore - Dostęp do wewnętrznych właściwości SupabaseAuthClient
  const supabaseAuth = supabase.auth as any;
  // @ts-ignore - Dostęp do memoryStorage
  let supaCookieName: string | null = null;

  // Dynamicznie znajdź klucz w memoryStorage pasujący do wzorca sb-*-auth-token
  if (supabaseAuth?.memoryStorage) {
    const authTokenPattern = /^sb-.*-auth-token$/;
    const memoryKeys = Object.keys(supabaseAuth.memoryStorage);
    
    for (const key of memoryKeys) {
      if (authTokenPattern.test(key)) {
        supaCookieName = key;
        break;
      }
    }
  }
  
  console.log("Supabase cookie name found:", supaCookieName);
  
  // Najpierw przejdź na stronę główną
  await page.goto(`${BASE_URL}/`);

  // Ustawienie tokenów sesji w local storage
  if (sessionData?.session) {
    // Sprawdź, czy strona ma już ustawione ciasteczko auth-token
    const cookies = await page.context().cookies();
    const authCookiePattern = /^sb-(.+)-auth-token$/;
    const existingAuthCookie = cookies.find(cookie => authCookiePattern.test(cookie.name));
    
    // Użyj nazwy ciasteczka, które jest już ustawione, jeśli istnieje
    // W przeciwnym razie użyj domyślnej wartości z env lub "127"
    let cookieName: string = "";
    
    if (supaCookieName) {
      // Priorytetowo użyj nazwy z SupabaseAuthClient
      cookieName = supaCookieName;
      console.log(`Using Supabase auth cookie name: ${cookieName}`);
    } else if (existingAuthCookie) {
      cookieName = existingAuthCookie.name;
      console.log(`Found existing auth cookie: ${cookieName}`);
    } else {
      cookieName = `sb-${SUPABASE_PROJECT_ID}-auth-token`;
      console.log(`Using default auth cookie name: ${cookieName}`);
    }
    
    // Ustawienie ciasteczka dynamicznie wygenerowanego
    await page.context().addCookies([
      {
        name: cookieName,
        value: JSON.stringify({
          access_token: sessionData.session!.access_token,
          refresh_token: sessionData.session!.refresh_token,
          expires_at: sessionData.session!.expires_at,
          user: sessionData.session!.user, // Include the full user object in the cookie
        }),
        domain: "localhost",
        path: "/",
      },
    ]);

    // Log the user data being set for debugging
    console.log("User data being set:", sessionData.session?.user?.email || "No email found in session");
    console.log(`Set auth token in cookies (${cookieName})`);

    // Odśwież stronę, aby zastosować tokeny
    await page.reload();
  }

  // Po udanym logowaniu przejdź na stronę proposals
  // Dodajemy parametr test=true do URL, aby wymusić tryb testowy dla API
  await page.goto(`${BASE_URL}/proposals?test=true`);
  console.log("Page url:", page.url());

  // Ustawiamy nagłówek autoryzacji dla wszystkich żądań
  await page.route("**", async (route) => {
    const request = route.request();

    // Pobierz oryginalne nagłówki
    const headers = await request.allHeaders();

    // Dodaj nagłówek autoryzacji do wszystkich żądań API
    const newHeaders: Record<string, string> = {
      ...headers,
      Authorization: `Bearer ${sessionData?.session?.access_token}`,
    };

    // Dodaj cookie PLAYWRIGHT_TEST=true dla wszystkich żądań
    if (!headers.cookie || !headers.cookie.includes("PLAYWRIGHT_TEST=true")) {
      newHeaders.cookie = headers.cookie ? `${headers.cookie}; PLAYWRIGHT_TEST=true` : "PLAYWRIGHT_TEST=true";
    }

    // Kontynuuj z nowymi nagłówkami
    await route.continue({ headers: newHeaders });
  });

  // Ustaw ciasteczko testowe
  await page.context().addCookies([
    {
      name: "PLAYWRIGHT_TEST",
      value: "true",
      domain: "localhost",
      path: "/",
    },
  ]);

  // Upewnij się, że jesteśmy na stronie proposals (a nie przekierowani z powrotem do logowania)
  expect(page.url()).toContain("/proposals");
});

test("should create and accept a meeting proposal", async ({ page }) => {
  const proposalsPage = new ProposalsPage(page);

  // Znajdź textarea na stronie proposals - próbuj najpierw przez data-test-id
  const noteInput = page.locator(SELECTORS.MEETING_NOTE_INPUT);
  if ((await noteInput.count()) > 0) {
    await expect(noteInput).toBeVisible({ timeout: 20000 });
  } else {
    // Fallback do id selektora
    const textarea = await page.locator("#note").first();
    await expect(textarea).toBeVisible({ timeout: 20000 });
  }

  // Take initial screenshot
  await page.screenshot({ path: "e2e/screenshots/debug-test1-before-proposal.png" });

  // Use the dynamic note generator and simplified flow
  await proposalsPage.createAndAcceptProposal();

  // Take final screenshot
  await page.screenshot({ path: "e2e/screenshots/debug-test1-after-proposal.png" });

  // Final assertion - we expect to be redirected to the homepage or dashboard
  await expect(page).toHaveURL(new RegExp(`${BASE_URL}/?$`), { timeout: 90000 });
});

/* Uncomment for testing conflicts
test("should show conflicts when accepting a proposal with time conflicts", async ({ page }) => {
  // Arrange
  const proposalsPage = new ProposalsPage(page);
  const conflictDialog = new ConflictDialog(page);
  const testNote = proposalsPage.generateDynamicNote("Spotkanie z zespołem marketing");

  // Znajdź textarea na stronie proposals
  const noteInput = page.locator(SELECTORS.MEETING_NOTE_INPUT);
  if ((await noteInput.count()) > 0) {
    await expect(noteInput).toBeVisible({ timeout: 20000 });
    await noteInput.fill(testNote);
  } else {
    const textarea = await page.locator("#note").first();
    await expect(textarea).toBeVisible({ timeout: 20000 });
    await textarea.fill(testNote);
  }

  // Take screenshot for debug
  await page.screenshot({ path: "e2e/screenshots/debug-before-propose.png" });

  // Act - kliknij przycisk propozycji
  const proposeButton = page.locator(SELECTORS.PROPOSE_MEETING_BUTTON);
  if ((await proposeButton.count()) > 0) {
    await proposeButton.click();
  } else {
    await page.locator('button:has-text("Zaproponuj")').click();
  }

  // Take screenshot after clicking propose
  await page.screenshot({ path: "e2e/screenshots/debug-after-propose.png" });

  // Zaczekaj na rezultaty (z długim timeoutem, bo generowanie propozycji może być wolne)
  await page.locator(SELECTORS.PROPOSALS_HEADING).waitFor({ timeout: 90000 });

  // Take screenshot after proposals appear
  await page.screenshot({ path: "e2e/screenshots/debug-proposals-loaded.png" });

  // Assert proposals were generated
  const proposalCards = await page.locator(`${SELECTORS.PROPOSALS_CONTAINER} > div`).count();
  console.log(`Found ${proposalCards} proposal cards`);
  expect(proposalCards).toBeGreaterThan(0);

  // Accept a proposal
  await page.locator(`${SELECTORS.PROPOSALS_CONTAINER} > div`).first().locator('button:has-text("Akceptuj")').click();

  // Take screenshot after accepting
  await page.screenshot({ path: "e2e/screenshots/debug-after-accept.png" });

  // Check for conflicts (this may not always trigger conflicts, but it's a good pattern)
  if (await conflictDialog.isVisible()) {
    const conflicts = await conflictDialog.getConflicts();
    console.log("Conflicts found:", conflicts);

    // Take screenshot of conflicts
    await page.screenshot({ path: "e2e/screenshots/debug-conflicts.png" });

    // Verify conflicts list is not empty
    expect(await conflictDialog.countConflicts()).toBeGreaterThan(0);

    // Accept with conflicts
    await conflictDialog.clickAccept();
  }

  // Final assertion with longer timeout
  await expect(page).toHaveURL(/\/$/, { timeout: 90000 });
});
*/
