# Strony aplikacji

## Strony logowania

Aplikacja zawiera dwie strony logowania:

### 1. `/auth/login` - Główna strona logowania

- Ścieżka: `/auth/login`
- Komponent: `src/pages/auth/login.astro`
- Przeznaczenie: Produkcyjna strona logowania dla użytkowników
- Zabezpieczenie: Chroniona flagą funkcyjną `auth`
- Zachowanie: 
  - Gdy flaga `auth` jest włączona: Normalne działanie logowania
  - Gdy flaga `auth` jest wyłączona: Przekierowanie na stronę główną z domyślnym użytkownikiem

### 2. `/login` - Strona testowa dla deweloperów

- Ścieżka: `/login`
- Komponent: `src/pages/login.astro`
- Przeznaczenie: Narzędzie deweloperskie do testowania API uwierzytelniania
- Zabezpieczenie: Chroniona flagą funkcyjną `dev_tools`
- Zachowanie: Wyświetla surową odpowiedź API, nie przekierowuje po zalogowaniu

## Flagi funkcyjne

Dostęp do stron jest kontrolowany przez następujące flagi funkcyjne:

1. `auth` - Kontroluje dostęp do funkcjonalności uwierzytelniania
   - Domyślnie: `false` w środowisku lokalnym, `true` w integration i prod
   - Dotyczy stron: `/auth/login`, `/auth/register`, `/auth/reset-password`, `/auth/new-password`
   - Zachowanie:
     - Gdy `auth` = `true`: Użytkownicy muszą się zalogować, aby korzystać z aplikacji
     - Gdy `auth` = `false`: Automatyczne przekierowanie do strony głównej i używanie domyślnego użytkownika

2. `dev_tools` - Kontroluje dostęp do narzędzi deweloperskich
   - Domyślnie: `true` w środowisku lokalnym, `false` w integration i prod
   - Dotyczy stron: `/login`

## Użytkownik domyślny

Gdy flaga `auth` jest wyłączona:
- Automatycznie używany jest domyślny użytkownik (`default@example.com`)
- Wyświetlana jest specjalna etykieta "Użytkownik Domyślny" w nagłówku
- Nie ma potrzeby logowania się do aplikacji
- Strony logowania/rejestracji przekierowują na stronę główną
- Wszystkie funkcje działają jak dla zalogowanego użytkownika

Funkcjonalność ta jest przydatna w środowisku deweloperskim do szybkiego testowania aplikacji bez konieczności logowania.

## Przekierowania

- Gdy flaga `auth` jest włączona i użytkownik nie jest zalogowany, następuje przekierowanie na `/auth/login`
- Gdy flaga `auth` jest wyłączona:
  - Strony uwierzytelniania (`/auth/*`) przekierowują na stronę główną (`/`)
  - Domyślny użytkownik jest używany automatycznie bez potrzeby logowania
- Gdy flaga `dev_tools` jest wyłączona, strona `/login` przekierowuje na `/auth/login` 