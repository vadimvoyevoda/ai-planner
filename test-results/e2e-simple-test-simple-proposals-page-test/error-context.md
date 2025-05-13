# Test info

- Name: simple proposals page test
- Location: C:\Users\Vadim\Documents\cursor-projects\my-schedule\e2e\simple-test.spec.ts:3:1

# Error details

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#note')

    at C:\Users\Vadim\Documents\cursor-projects\my-schedule\e2e\simple-test.spec.ts:8:31
```

# Page snapshot

```yaml
- region "Notifications alt+T"
- main:
  - text: Logowanie Email
  - textbox "Email"
  - text: Hasło
  - textbox "Hasło"
  - button "Zaloguj się"
  - text: Nie masz jeszcze konta?
  - link "Zarejestruj się":
    - /url: /auth/register
  - link "Zapomniałeś hasła?":
    - /url: /auth/reset-password
- contentinfo: © 2025 AI Planner. Wszystkie prawa zastrzeżone.
```

# Test source

```ts
   1 | import { test, expect } from "@playwright/test";
   2 |
   3 | test("simple proposals page test", async ({ page }) => {
   4 |   // Przejdź na stronę proposals
   5 |   await page.goto("http://localhost:3000/proposals");
   6 |
   7 |   // Znajdź pola formularza po id
>  8 |   await page.locator("#note").fill("Spotkanie z zespołem marketingu #123 w poniedziałek o 10:00");
     |                               ^ Error: locator.fill: Test timeout of 30000ms exceeded.
   9 |
  10 |   // Znajdź przycisk po tekście
  11 |   await page.locator('button:has-text("Zaproponuj termin")').click();
  12 |
  13 |   // Zaczekaj na rezultaty (z długim timeoutem, bo generowanie propozycji może być wolne)
  14 |   await page.locator('h2:has-text("Propozycje terminów")').waitFor({ timeout: 60000 });
  15 |
  16 |   // Zrób zrzut ekranu po uzyskaniu rezultatów
  17 |   await page.screenshot({ path: "e2e/screenshots/proposals-results.png" });
  18 |
  19 |   // Sprawdź, czy wyświetliły się propozycje
  20 |   const proposalCards = await page.locator(".flex.flex-nowrap.gap-6 > div").count();
  21 |   console.log(`Found ${proposalCards} proposal cards`);
  22 |
  23 |   expect(proposalCards).toBeGreaterThan(0);
  24 | });
  25 |
```