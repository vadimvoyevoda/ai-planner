Plan Testów
1. Wprowadzenie i cele testowania
Celem testowania jest zapewnienie wysokiej jakości, stabilności i bezpieczeństwa aplikacji AI Planner. Testy pozwolą wcześnie wykryć i naprawić defekty, zweryfikować integrację ze Supabase i OpenAI oraz zagwarantować, że kluczowe ścieżki użytkownika działają zgodnie z oczekiwaniami.

2. Zakres testów
– Testy jednostkowe (unit tests) komponentów React, hooków i modułów util.
– Testy integracyjne (integration tests) serwisów API, funkcji usługowych i interakcji z Supabase.
– Testy end-to-end (E2E) najważniejszych scenariuszy użytkownika (logowanie, dashboard, propozycje, ustawienia).
– Testy wydajnościowe (performance) krytycznych wywołań AI i ładowania list spotkań.
– Testy bezpieczeństwa podstawowe (authentication, autoryzacja API).

3. Typy testów do przeprowadzenia
Testy jednostkowe
Testy integracyjne
Testy E2E
Testy wydajności (load/stres)
Testy bezpieczeństwa (autoryzacja/SESJE)
4. Scenariusze testowe dla kluczowych funkcjonalności
4.1 Autoryzacja
Rejestracja (validacja pól, HTTP 400, 429)
Logowanie (poprawne/niepoprawne dane, przekierowania)
Reset hasła (walidacja email, sukces, błąd 429)
Ustaw nowe hasło (Zod, 401, 500)
Wylogowanie (sesja unieważniona)
4.2 Dashboard
Fetch początkowych spotkań (poprawne wyświetlanie, błąd 401)
Filtry: wyszukiwanie, kategoria, zakres dat (efekt na listę, debouncing)
Tworzenie spotkania (walidacja formularza, toast success, błąd createError)
Usuwanie spotkania (alert dialog, stan loading, błąd)
4.3 Propozycje spotkań
Generowanie propozycji (walidacja notatki, loading, sukces, error state)
Prezentacja kart propozycji (format daty, czas trwania, conflict badge)
Akceptacja propozycji bez konfliktów (zapis, redirect)
Akceptacja z konfliktami (dialog, akceptuj mimo konfliktów)
4.4 Ustawienia preferencji
Pobranie istniejących preferencji (NULL vs dane)
Aktualizacja preferencji (warianty pól, toast success/error)
Brak preferencji → utworzenie nowego wpisu
4.5 Komponenty UI
MeetingNoteForm, MeetingFilters, MeetingsList, UpcomingMeetings: render, interakcje, skeletony
ErrorBoundary: przechwycenie błędu, fallback
Dialog, AlertDialog: otwieranie/zamykanie, focus trap
FormControl, FormMessage: aria-attributes, wyświetlanie błędów
4.6 Usługi i moduły
transformSupabaseMeeting – mapowanie pól
utils.calculateDurationMinutes, formatDateTime, debounce
meeting-proposals.service.generate_proposals – logika dystrybucji i konfliktów
openai.service – obsługa błędów, retry, format JSON
5. Środowisko testowe
– Node.js ≥18, pnpm/yarn
– Supabase lokalny emulator lub testowa baza
– Mockowanie OpenAI za pomocą MSW lub stub klasy OpenAIService
– Browser: jsdom (unit), Playwright Chromium (E2E)
– Zmienna środowiskowa: PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY, PLATFORM_OPENAI_KEY

6. Narzędzia do testowania
– Vitest + @testing-library/react + jsdom
– MSW (Mock Service Worker) do interceptu wywołań API
– Playwright lub Cypress dla testów E2E
– k6 / Artillery dla testów wydajności
– ESLint/Prettier + Pre-commit hooks (Husky + lint-staged)
– Coverage: c8, threshold: ≥85%

7. Harmonogram testów
Faza	Zakres	Czas trwania
Analiza i przygot.	Konfiguracja środowiska, testów	2 dni
Unit & util tests	Komponenty UI, hooki, utils	3 dni
Integracyjne tests	API routes, serwisy, Supabase	2 dni
E2E tests	Scenariusze użytkownika	3 dni
Wydajność	Load AI & meetings list	2 dni
Raportowanie & fix	Konsolidacja wyników, retesty	2 dni
8. Kryteria akceptacji testów
Wszystkie testy jednostkowe i integracyjne zielone
Pokrycie kodu ≥85%
Scenariusze E2E dla kluczowych ścieżek przechodzą bez błędów
Brak krytycznych błędów otwartych po fazie testów
Pozytywne wyniki testów wydajnościowych (AI response <2s)
9. Role i odpowiedzialności
– QA Engineer: projekt i wykonanie testów, raportowanie wyników
– Developer: wsparcie w mockowaniu usług, naprawa błędów
– DevOps: konfiguracja CI (GitHub Actions) dla testów automatycznych

10. Procedury raportowania błędów
Tworzenie ticketu w JIRA/GitHub Issues z opisem kroki powtórzenia, oczekiwany a rzeczywisty rezultat
Priorytetyzacja (Blocker, Critical, Major, Minor, Trivial)
Śledzenie statusu, retest po fixie
