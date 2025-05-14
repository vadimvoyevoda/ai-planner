# Test info

- Name: should create and accept a meeting proposal
- Location: C:\Users\Vadim\Documents\cursor-projects\my-schedule\e2e\meeting-proposals-e2e-test.spec.ts:171:1

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "/proposals"
Received string:    "http://localhost:3000/auth/login"
    at C:\Users\Vadim\Documents\cursor-projects\my-schedule\e2e\meeting-proposals-e2e-test.spec.ts:168:22
```

# Test source

```ts
   68 |     const authTokenPattern = /^sb-.*-auth-token$/;
   69 |     const memoryKeys = Object.keys(supabaseAuth.memoryStorage);
   70 |     
   71 |     for (const key of memoryKeys) {
   72 |       if (authTokenPattern.test(key)) {
   73 |         supaCookieName = key;
   74 |         break;
   75 |       }
   76 |     }
   77 |   }
   78 |   
   79 |   console.log("Supabase cookie name found:", supaCookieName);
   80 |   
   81 |   // Najpierw przejdź na stronę główną
   82 |   await page.goto(`${BASE_URL}/`);
   83 |
   84 |   // Ustawienie tokenów sesji w local storage
   85 |   if (sessionData?.session) {
   86 |     // Sprawdź, czy strona ma już ustawione ciasteczko auth-token
   87 |     const cookies = await page.context().cookies();
   88 |     const authCookiePattern = /^sb-(.+)-auth-token$/;
   89 |     const existingAuthCookie = cookies.find(cookie => authCookiePattern.test(cookie.name));
   90 |     
   91 |     // Użyj nazwy ciasteczka, które jest już ustawione, jeśli istnieje
   92 |     // W przeciwnym razie użyj domyślnej wartości z env lub "127"
   93 |     let cookieName: string = "";
   94 |     
   95 |     if (supaCookieName) {
   96 |       // Priorytetowo użyj nazwy z SupabaseAuthClient
   97 |       cookieName = supaCookieName;
   98 |       console.log(`Using Supabase auth cookie name: ${cookieName}`);
   99 |     } else if (existingAuthCookie) {
  100 |       cookieName = existingAuthCookie.name;
  101 |       console.log(`Found existing auth cookie: ${cookieName}`);
  102 |     } else {
  103 |       cookieName = `sb-${SUPABASE_PROJECT_ID}-auth-token`;
  104 |       console.log(`Using default auth cookie name: ${cookieName}`);
  105 |     }
  106 |     
  107 |     // Ustawienie ciasteczka dynamicznie wygenerowanego
  108 |     await page.context().addCookies([
  109 |       {
  110 |         name: cookieName,
  111 |         value: JSON.stringify({
  112 |           access_token: sessionData.session!.access_token,
  113 |           refresh_token: sessionData.session!.refresh_token,
  114 |           expires_at: sessionData.session!.expires_at,
  115 |           user: sessionData.session!.user, // Include the full user object in the cookie
  116 |         }),
  117 |         domain: "localhost",
  118 |         path: "/",
  119 |       },
  120 |     ]);
  121 |
  122 |     // Log the user data being set for debugging
  123 |     console.log("User data being set:", sessionData.session?.user?.email || "No email found in session");
  124 |     console.log(`Set auth token in cookies (${cookieName})`);
  125 |
  126 |     // Odśwież stronę, aby zastosować tokeny
  127 |     await page.reload();
  128 |   }
  129 |
  130 |   // Po udanym logowaniu przejdź na stronę proposals
  131 |   // Dodajemy parametr test=true do URL, aby wymusić tryb testowy dla API
  132 |   await page.goto(`${BASE_URL}/proposals?test=true`);
  133 |   console.log("Page url:", page.url());
  134 |
  135 |   // Ustawiamy nagłówek autoryzacji dla wszystkich żądań
  136 |   await page.route("**", async (route) => {
  137 |     const request = route.request();
  138 |
  139 |     // Pobierz oryginalne nagłówki
  140 |     const headers = await request.allHeaders();
  141 |
  142 |     // Dodaj nagłówek autoryzacji do wszystkich żądań API
  143 |     const newHeaders: Record<string, string> = {
  144 |       ...headers,
  145 |       Authorization: `Bearer ${sessionData?.session?.access_token}`,
  146 |     };
  147 |
  148 |     // Dodaj cookie PLAYWRIGHT_TEST=true dla wszystkich żądań
  149 |     if (!headers.cookie || !headers.cookie.includes("PLAYWRIGHT_TEST=true")) {
  150 |       newHeaders.cookie = headers.cookie ? `${headers.cookie}; PLAYWRIGHT_TEST=true` : "PLAYWRIGHT_TEST=true";
  151 |     }
  152 |
  153 |     // Kontynuuj z nowymi nagłówkami
  154 |     await route.continue({ headers: newHeaders });
  155 |   });
  156 |
  157 |   // Ustaw ciasteczko testowe
  158 |   await page.context().addCookies([
  159 |     {
  160 |       name: "PLAYWRIGHT_TEST",
  161 |       value: "true",
  162 |       domain: "localhost",
  163 |       path: "/",
  164 |     },
  165 |   ]);
  166 |
  167 |   // Upewnij się, że jesteśmy na stronie proposals (a nie przekierowani z powrotem do logowania)
> 168 |   expect(page.url()).toContain("/proposals");
      |                      ^ Error: expect(received).toContain(expected) // indexOf
  169 | });
  170 |
  171 | test("should create and accept a meeting proposal", async ({ page }) => {
  172 |   const proposalsPage = new ProposalsPage(page);
  173 |
  174 |   // Znajdź textarea na stronie proposals - próbuj najpierw przez data-test-id
  175 |   const noteInput = page.locator(SELECTORS.MEETING_NOTE_INPUT);
  176 |   if ((await noteInput.count()) > 0) {
  177 |     await expect(noteInput).toBeVisible({ timeout: 20000 });
  178 |   } else {
  179 |     // Fallback do id selektora
  180 |     const textarea = await page.locator("#note").first();
  181 |     await expect(textarea).toBeVisible({ timeout: 20000 });
  182 |   }
  183 |
  184 |   // Take initial screenshot
  185 |   await page.screenshot({ path: "e2e/screenshots/debug-test1-before-proposal.png" });
  186 |
  187 |   // Use the dynamic note generator and simplified flow
  188 |   await proposalsPage.createAndAcceptProposal();
  189 |
  190 |   // Take final screenshot
  191 |   await page.screenshot({ path: "e2e/screenshots/debug-test1-after-proposal.png" });
  192 |
  193 |   // Final assertion - we expect to be redirected to the homepage or dashboard
  194 |   await expect(page).toHaveURL(new RegExp(`${BASE_URL}/?$`), { timeout: 90000 });
  195 | });
  196 |
  197 | /* Uncomment for testing conflicts
  198 | test("should show conflicts when accepting a proposal with time conflicts", async ({ page }) => {
  199 |   // Arrange
  200 |   const proposalsPage = new ProposalsPage(page);
  201 |   const conflictDialog = new ConflictDialog(page);
  202 |   const testNote = proposalsPage.generateDynamicNote("Spotkanie z zespołem marketing");
  203 |
  204 |   // Znajdź textarea na stronie proposals
  205 |   const noteInput = page.locator(SELECTORS.MEETING_NOTE_INPUT);
  206 |   if ((await noteInput.count()) > 0) {
  207 |     await expect(noteInput).toBeVisible({ timeout: 20000 });
  208 |     await noteInput.fill(testNote);
  209 |   } else {
  210 |     const textarea = await page.locator("#note").first();
  211 |     await expect(textarea).toBeVisible({ timeout: 20000 });
  212 |     await textarea.fill(testNote);
  213 |   }
  214 |
  215 |   // Take screenshot for debug
  216 |   await page.screenshot({ path: "e2e/screenshots/debug-before-propose.png" });
  217 |
  218 |   // Act - kliknij przycisk propozycji
  219 |   const proposeButton = page.locator(SELECTORS.PROPOSE_MEETING_BUTTON);
  220 |   if ((await proposeButton.count()) > 0) {
  221 |     await proposeButton.click();
  222 |   } else {
  223 |     await page.locator('button:has-text("Zaproponuj")').click();
  224 |   }
  225 |
  226 |   // Take screenshot after clicking propose
  227 |   await page.screenshot({ path: "e2e/screenshots/debug-after-propose.png" });
  228 |
  229 |   // Zaczekaj na rezultaty (z długim timeoutem, bo generowanie propozycji może być wolne)
  230 |   await page.locator(SELECTORS.PROPOSALS_HEADING).waitFor({ timeout: 90000 });
  231 |
  232 |   // Take screenshot after proposals appear
  233 |   await page.screenshot({ path: "e2e/screenshots/debug-proposals-loaded.png" });
  234 |
  235 |   // Assert proposals were generated
  236 |   const proposalCards = await page.locator(`${SELECTORS.PROPOSALS_CONTAINER} > div`).count();
  237 |   console.log(`Found ${proposalCards} proposal cards`);
  238 |   expect(proposalCards).toBeGreaterThan(0);
  239 |
  240 |   // Accept a proposal
  241 |   await page.locator(`${SELECTORS.PROPOSALS_CONTAINER} > div`).first().locator('button:has-text("Akceptuj")').click();
  242 |
  243 |   // Take screenshot after accepting
  244 |   await page.screenshot({ path: "e2e/screenshots/debug-after-accept.png" });
  245 |
  246 |   // Check for conflicts (this may not always trigger conflicts, but it's a good pattern)
  247 |   if (await conflictDialog.isVisible()) {
  248 |     const conflicts = await conflictDialog.getConflicts();
  249 |     console.log("Conflicts found:", conflicts);
  250 |
  251 |     // Take screenshot of conflicts
  252 |     await page.screenshot({ path: "e2e/screenshots/debug-conflicts.png" });
  253 |
  254 |     // Verify conflicts list is not empty
  255 |     expect(await conflictDialog.countConflicts()).toBeGreaterThan(0);
  256 |
  257 |     // Accept with conflicts
  258 |     await conflictDialog.clickAccept();
  259 |   }
  260 |
  261 |   // Final assertion with longer timeout
  262 |   await expect(page).toHaveURL(/\/$/, { timeout: 90000 });
  263 | });
  264 | */
  265 |
```