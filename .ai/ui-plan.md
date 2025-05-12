# Architektura UI dla AIPersonalPlanner

## 1. Przegląd struktury UI

Aplikacja AIPersonalPlanner będzie zbudowana z kilku głównych widoków, zorganizowanych wokół centralnego dashboardu. Struktura UI została zaprojektowana tak, aby zapewnić intuicyjny przepływ zadań, priorytetyzując najczęściej używane funkcje. Główną nawigację zapewnia navbar, który jest dostępny z każdego widoku po zalogowaniu. Aplikacja używa Astro w połączeniu z React i Tailwind dla zapewnienia responsywności i nowoczesnego wyglądu.

Aplikacja wykorzystuje podejście "mobile-first", dostosowując układ do różnych rozmiarów ekranów. Dzięki temu karteczki spotkań i formularze są czytelne zarówno na urządzeniach mobilnych, jak i desktopowych. Kolorystyka interfejsu będzie utrzymana w spokojnych, profesjonalnych barwach, z akcentami kolorystycznymi do oznaczenia ważnych elementów (np. konfliktów).

## 2. Lista widoków

### Autentykacja
#### Strona logowania/rejestracji
- **Ścieżka**: `/login`, `/register`
- **Główny cel**: Umożliwienie użytkownikowi zalogowania się lub utworzenia konta
- **Kluczowe informacje**: Pola formularza (email, hasło, imię, nazwisko)
- **Kluczowe komponenty**:
  - Formularz logowania/rejestracji (przełączany zakładkami)
  - Pola tekstowe z walidacją
  - Przycisk "Zapomniałem hasła"
- **UX/dostępność/bezpieczeństwo**:
  - Informacja o wymaganiach dla hasła
  - Możliwość pokazania/ukrycia hasła
  - Ograniczenie prób logowania
  - Zabezpieczenie CSRF

#### Strona resetowania hasła
- **Ścieżka**: `/reset-password`, `/reset-password/:token`
- **Główny cel**: Umożliwienie odzyskania dostępu do konta
- **Kluczowe informacje**: Instrukcje resetowania, pole na email/nowe hasło
- **Kluczowe komponenty**:
  - Formularz z polem email lub formularz z nowym hasłem
  - Komunikaty o statusie
- **UX/dostępność/bezpieczeństwo**:
  - Jasne komunikaty o wysłaniu linku
  - Weryfikacja tokena resetowania
  - Ograniczony czas ważności tokena (30 minut)

### Główne widoki aplikacji
#### Dashboard
- **Ścieżka**: `/`
- **Główny cel**: Szybki podgląd nadchodzących spotkań i dodawanie nowych
- **Kluczowe informacje**: Lista spotkań, formularz notatki
- **Kluczowe komponenty**:
  - Formularz wprowadzania notatki (na całą szerokość)
  - Lista nadchodzących spotkań jako karteczki
  - Filtry (kategoria, data, nazwa)
  - Paginacja (10 spotkań na stronę)
  - Przycisk "Dodaj ręcznie"
- **UX/dostępność/bezpieczeństwo**:
  - Grupowanie spotkań według dni (nagłówki z datami)
  - Zwijane/rozwijane karteczki spotkań
  - Oznaczenie konfliktów terminów
  - Ikona eksportu do Google Calendar
  - Przyciski edycji/usunięcia spotkania

#### Widok propozycji terminów
- **Ścieżka**: `/proposals`
- **Główny cel**: Prezentacja i wybór propozycji AI
- **Kluczowe informacje**: 2-4 propozycje terminów
- **Kluczowe komponenty**:
  - Karteczki z propozycjami (2-4)
  - Ikony czasu, miejsca, kategorii
  - Sugerowany strój
  - Przyciski akceptacji
  - Przycisk przerwania generowania
- **UX/dostępność/bezpieczeństwo**:
  - Wyraźne rozróżnienie propozycji
  - Oznaczenie konfliktów terminów
  - Tooltips z dodatkowymi informacjami
  - Zabezpieczenie przed przypadkowym zamknięciem

#### Szczegóły spotkania
- **Ścieżka**: `/meeting/:id`
- **Główny cel**: Prezentacja wszystkich informacji o spotkaniu
- **Kluczowe informacje**: Wszystkie detale spotkania
- **Kluczowe komponenty**:
  - Pełne informacje o spotkaniu
  - Przyciski akcji (Edytuj, Usuń, Eksportuj)
  - Wskaźnik kategorii i sugerowanego stroju
- **UX/dostępność/bezpieczeństwo**:
  - Przejrzysty układ informacji
  - Potwierdzenie przed usunięciem
  - Weryfikacja uprawnień

#### Dodawanie/edycja spotkania ręcznie
- **Ścieżka**: `/meeting/add`, `/meeting/:id/edit`
- **Główny cel**: Ręczne wprowadzenie/edycja szczegółów spotkania
- **Kluczowe informacje**: Formularz z polami
- **Kluczowe komponenty**:
  - Formularz z polami (tytuł, opis, kategoria, data/czas, miejsce)
  - Pickery dla dat i czasów
  - Przyciski (Zapisz, Anuluj)
- **UX/dostępność/bezpieczeństwo**:
  - Walidacja pól
  - Wykrywanie konfliktów
  - Grupowanie powiązanych pól
  - Autouzupełnianie dla miejsc

### Ustawienia i preferencje
#### Preferencje spotkań
- **Ścieżka**: `/settings`
- **Główny cel**: Konfiguracja preferencji dla AI
- **Kluczowe informacje**: Preferencje spotkań
- **Kluczowe komponenty**:
  - Przełącznik rozkładu spotkań (rozłożone/skondensowane)
  - Checkboxy preferowanych pór dnia
  - Suwak minimalnych przerw
  - Kalendarz tygodniowy dni niedostępnych
  - Przycisk zapisywania
- **UX/dostępność/bezpieczeństwo**:
  - Wizualna reprezentacja preferencji
  - Tooltips wyjaśniające opcje
  - Walidacja wprowadzanych wartości

### Statystyki
#### Statystyki
- **Ścieżka**: `/stats`
- **Główny cel**: Prezentacja statystyk korzystania z AI
- **Kluczowe informacje**: Wskaźniki akceptacji, liczba generacji
- **Kluczowe komponenty**:
  - Wykresy statystyk użytkownika
  - Wykresy statystyk ogólnych
  - Filtry okresów (miesiąc/rok)
  - Legendy i opisy
- **UX/dostępność/bezpieczeństwo**:
  - Interaktywne elementy wykresów
  - Alternatywne przedstawienie danych
  - Agregacja danych dla prywatności

## 3. Mapa podróży użytkownika

### Nowy użytkownik
1. Rejestracja konta (`/register`)
2. Automatyczne przekierowanie do formularza preferencji (`/settings`)
3. Wypełnienie preferencji spotkań
4. Przekierowanie do dashboardu (`/`)

### Tworzenie spotkania z pomocą AI
1. Wejście na dashboard (`/`)
2. Wprowadzenie notatki o spotkaniu w formularzu
3. Kliknięcie przycisku "Generuj propozycje"
4. Przekierowanie do widoku propozycji (`/proposals`)
5. Wybór i akceptacja jednej propozycji
6. Automatyczny powrót do dashboardu (`/`) z dodanym spotkaniem

### Ręczne dodawanie spotkania
1. Wejście na dashboard (`/`)
2. Kliknięcie przycisku "Dodaj spotkanie ręcznie"
3. Przekierowanie do formularza dodawania (`/meeting/add`)
4. Wypełnienie wszystkich pól
5. Zapisanie spotkania
6. Automatyczny powrót do dashboardu (`/`)

### Eksport do Google Calendar
1. Kliknięcie ikony Google Calendar przy wybranym spotkaniu
2. Wygenerowanie oraz ściąganie pliku .ics.

### Przeglądanie i zarządzanie spotkaniami
1. Wejście na dashboard (`/`)
2. Filtrowanie/przeglądanie spotkań
3. Kliknięcie na spotkanie
4. Przekierowanie do szczegółów spotkania (`/meeting/:id`)
5. Opcjonalne akcje (edycja, usunięcie, eksport)

## 4. Układ i struktura nawigacji

### Główna nawigacja
Navbar dostępny na każdej stronie po zalogowaniu:
- Logo/Nazwa aplikacji (link do dashboardu)
- Link do dashboardu
- Link do statystyk
- Dropdown ustawień (Profil, Preferencje)
- Przycisk wylogowania

### Nawigacja kontekstowa
- Breadcrumbs na podstronach (np. Dashboard > Szczegóły spotkania)
- Przyciski "Wstecz" na stronach szczegółów/edycji
- Przyciski akcji kontekstowych na karteczkach spotkań (edytuj, usuń, eksportuj)

### Responsywność
- Na urządzeniach mobilnych navbar zwija się do przycisku "hamburger"
- Karteczki spotkań układają się jedna pod drugą (zamiast obok siebie)
- Formularze dostosowują szerokość do ekranu
- Widok propozycji na mobile pokazuje karteczki jedna pod drugą

## 5. Kluczowe komponenty

### Karteczka spotkania
- Jednolity komponent używany w dashboardzie i szczegółach
- Zawiera: tytuł, opis, kategorię, strój, datę, czas, miejsce
- Stan zwinięty/rozwinięty
- Ikony akcji (edycja, usunięcie, eksport)
- Oznaczenie konfliktu (jeśli występuje)

### Formularz notatki
- Pole tekstowe na notatkę
- Pole na miejsce
- Pole na czas trwania (opcjonalne)
- Przycisk "Generuj propozycje" (aktywny po wpisaniu tekstu)
- Informacja o postępie generowania

### Karteczka propozycji
- Podobna do karteczki spotkania, ale z przyciskiem akceptacji
- Ikony czasu, miejsca, kategorii
- Sugerowany strój
- Oznaczenie konfliktu (jeśli występuje)

### Filtry spotkań
- Dropdown kategorii
- Pickery zakresu dat
- Pole wyszukiwania po nazwie
- Przycisk resetowania filtrów

### Kalendarz tygodniowy
- Interaktywny komponent do wyboru dni niedostępnych
- Używany w preferencjach spotkań
- Wizualne oznaczenie wybranych dni

### Komponent statystyk
- Prezentacja danych w formie tabeli albo zwykłego tekstu

### System komunikatów
- Komunikaty o sukcesie operacji
- Komunikaty o błędach
- Potwierdzenia akcji (np. usunięcie)
- Tooltips z dodatkowymi informacjami 