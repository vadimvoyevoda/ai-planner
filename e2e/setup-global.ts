import { chromium } from "@playwright/test";
import type { FullConfig } from "@playwright/test";
import path from "path";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/db/database.types";

// Disable Vitest/Jest matchers conflict when running Playwright tests
if (process.env.SKIP_VITEST_HOOK === "true") {
  // Intercept Symbol($$jest-matchers-object) property issue
  const originalObjectDefineProperty = Object.defineProperty;
  Object.defineProperty = function(obj, prop, descriptor) {
    // Skip redefining the problematic jest-matchers-object symbol
    if (typeof prop === "symbol" && 
        prop.toString().includes("jest-matchers-object")) {
      console.log("Skipping redefinition of Symbol($$jest-matchers-object)");
      return obj;
    }
    return originalObjectDefineProperty(obj, prop, descriptor);
  };
}

// No need to load dotenv here - it's loaded by dotenv-cli in npm scripts

// Log available environment variables for debugging
console.log("[setup-global] Environment variables:");
console.log(`- SUPABASE_URL: ${process.env.SUPABASE_URL ? "set" : "undefined"}`);
console.log(`- SUPABASE_PUBLIC_KEY: ${process.env.SUPABASE_PUBLIC_KEY ? "set" : "undefined"}`);
console.log(`- E2E_USERNAME: ${process.env.E2E_USERNAME ? "set" : "undefined"}`);
console.log(`- E2E_PASSWORD: ${process.env.E2E_PASSWORD ? "set" : "undefined"}`);

const authFile = path.join(__dirname, "playwright/.auth/user.json");

/**
 * Globalny setup dla testów E2E - autentykacja użytkownika
 */
async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;

  // Utwórz przeglądarkę i stronę
  const browser = await chromium.launch();
  const page = await browser.newPage({
    baseURL,
  });

  try {
    // Inicjalizacja klienta Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabasePublicKey = process.env.SUPABASE_PUBLIC_KEY;

    console.log(
      `[setup-global] Using SUPABASE_URL: ${supabaseUrl ? supabaseUrl.substring(0, 10) + "..." : "undefined"}`
    );

    if (!supabaseUrl || !supabasePublicKey) {
      throw new Error("Missing Supabase credentials in environment variables");
    }

    const username = process.env.E2E_USERNAME as string;
    const password = process.env.E2E_PASSWORD as string;

    if (!username || !password) {
      throw new Error("Missing E2E test credentials in environment variables");
    }

    const supabase = createClient<Database>(supabaseUrl, supabasePublicKey);

    // Bezpośrednie logowanie przez API zamiast przez UI
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (signInError) {
      console.error("Error signing in:", signInError);
      throw signInError;
    }

    console.log("Successfully signed in via Supabase API");

    // Otwórz stronę, aby zapisać cookies i sesję
    await page.goto("/");

    // Upewnij się, że katalog istnieje
    const authDir = path.dirname(authFile);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    // Zapisz stan autentykacji dla późniejszego wykorzystania
    await page.context().storageState({ path: authFile });
    console.log("Zapisano stan autentykacji do", authFile);
  } catch (error) {
    console.error("Globalny setup nie powiódł się:", error);
  } finally {
    await browser.close();
  }
}

export default globalSetup;
