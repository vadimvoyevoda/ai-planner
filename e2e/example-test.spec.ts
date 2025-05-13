import { test, expect } from "@playwright/test";
import { ProposalsPage } from "./page-objects/ProposalsPage";
import { ConflictDialog } from "./page-objects/ConflictDialog";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/db/database.types";
import { SELECTORS } from "./selectors";

// Ustawienie bazowego URL dla testów
test.use({
  baseURL: "http://localhost:3000",
});

// These environment variables must be defined in .env.test
const SUPABASE_URL =
  process.env.PUBLIC_SUPABASE_URL ||
  (() => {
    throw new Error("PUBLIC_SUPABASE_URL is required in .env.test");
  })();
const SUPABASE_PUBLIC_KEY =
  process.env.PUBLIC_SUPABASE_KEY ||
  (() => {
    throw new Error("PUBLIC_SUPABASE_KEY is required in .env.test");
  })();
const E2E_USERNAME =
  process.env.E2E_USERNAME ||
  (() => {
    throw new Error("E2E_USERNAME is required in .env.test");
  })();
const E2E_PASSWORD =
  process.env.E2E_PASSWORD ||
  (() => {
    throw new Error("E2E_PASSWORD is required in .env.test");
  })();
// ID projektu Supabase - opcjonalne, domyślnie "127"
const SUPABASE_PROJECT_ID = process.env.PUBLIC_SUPABASE_PROJECT_ID || "127";

test.describe("Meeting Proposals Flow", () => {
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
    // Najpierw przejdź na stronę główną
    await page.goto("/");

    // Ustawienie tokenów sesji w local storage
    if (sessionData?.session) {
      const cookieName = `sb-${SUPABASE_PROJECT_ID}-auth-token`;
      // Ustawienie ciasteczka dynamicznie wygenerowanego
      await page.context().addCookies([
        {
          name: cookieName,
          value: JSON.stringify({
            access_token: sessionData.session.access_token,
            refresh_token: sessionData.session.refresh_token,
            expires_at: sessionData.session.expires_at,
            user: sessionData.session.user, // Include the full user object in the cookie
          }),
          domain: "localhost",
          path: "/",
        },
      ]);

      // Log the user data being set for debugging
      console.log("User data being set:", sessionData.session.user?.email || "No email found in session");
      console.log(`Set auth token in cookies (${cookieName})`);

      // Odśwież stronę, aby zastosować tokeny
      await page.reload();
    }

    // Po udanym logowaniu przejdź na stronę proposals
    // Dodajemy parametr test=true do URL, aby wymusić tryb testowy dla API
    await page.goto("/proposals?test=true");
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
    await expect(page).toHaveURL(/\/$/, { timeout: 90000 });
  });
});
