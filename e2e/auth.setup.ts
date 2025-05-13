import { test as setup, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const authFile = path.join(__dirname, "playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  // Przejdź do strony logowania
  await page.goto("/auth/login");

  console.log("Próba logowania...");

  // Sprawdź czy strona logowania została załadowana
  await expect(page.locator("form")).toBeVisible();

  // Wypełnij formularz logowania używając danych testowych
  await page.locator("#email").fill("test@example.com");
  await page.locator("#password").fill("password123");

  // Kliknij przycisk logowania
  await page.locator('button:has-text("Zaloguj się")').click();

  // Poczekaj na zalogowanie (przekierowanie na stronę główną)
  await page.waitForURL("/**");

  // Sprawdź, czy użytkownik jest zalogowany
  const isLoggedIn = await page.evaluate(() => {
    // Możesz dostosować tę logikę do swojej aplikacji
    return document.cookie.includes("supabase-auth") || document.cookie.includes("sb-");
  });

  if (!isLoggedIn) {
    console.error("Nie udało się zalogować. Upewnij się, że dane logowania są poprawne.");
    throw new Error("Logowanie nie powiodło się");
  }

  console.log("Logowanie powiodło się. Zapisuję stan autoryzacji.");

  // Upewnij się, że katalog istnieje
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Zapisz stan autentykacji dla późniejszego wykorzystania
  await page.context().storageState({ path: authFile });
  console.log("Zapisano stan autentykacji do", authFile);
});
