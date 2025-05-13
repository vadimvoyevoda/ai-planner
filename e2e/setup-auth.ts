import { test as setup } from "@playwright/test";
import path from "path";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/db/database.types";

// Ścieżka do pliku przechowującego stan autentykacji
const authFile = path.join(__dirname, "playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  try {
    // Inicjalizacja klienta Supabase
    const supabaseUrl = process.env.SUPABASE_URL as string;
    const supabasePublicKey = process.env.SUPABASE_PUBLIC_KEY as string;

    if (!supabaseUrl || !supabasePublicKey) {
      throw new Error("Missing Supabase credentials in environment variables");
    }

    const username = process.env.E2E_USERNAME as string;
    const password = process.env.E2E_PASSWORD as string;

    if (!username || !password) {
      throw new Error("Missing E2E test credentials in environment variables");
    }

    const supabase = createClient<Database>(supabaseUrl, supabasePublicKey);

    console.log("Próba logowania przez API Supabase...");

    // Bezpośrednie logowanie przez API zamiast przez UI
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (signInError) {
      console.error("Error signing in:", signInError);
      throw signInError;
    }

    console.log("Logowanie powiodło się. Zapisuję stan autoryzacji.");

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
    console.error("Autentykacja nie powiodła się:", error);
    throw error;
  }
});
