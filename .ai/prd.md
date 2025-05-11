# Dokument wymagań produktu (PRD) - AIPersonalPlanner

## 1. Przegląd produktu

AIPersonalPlanner to aplikacja webowa wykorzystująca sztuczną inteligencję do usprawnienia procesu planowania spotkań i wydarzeń. Aplikacja analizuje preferencje użytkowników, ich notatki oraz dostępność czasową, aby proponować optymalne terminy spotkań.

Aplikacja skierowana jest głównie do osób dorosłych samozatrudnionych, menedżerów oraz innych użytkowników z dużą liczbą spotkań, którzy potrzebują efektywnego narzędzia do zarządzania swoim harmonogramem.

AIPersonalPlanner integruje się z Google Calendar (jednokierunkowa synchronizacja), co pozwala na eksport zaplanowanych spotkań do kalendarza użytkownika.

## 2. Problem użytkownika

Manualne sprawdzanie grafiku spotkań i wydarzeń oraz planowanie nowych jest problematyczne i czasochłonne. Użytkownicy często muszą:

1. Przejrzeć swój kalendarz w poszukiwaniu dostępnych terminów
2. Ocenić, które terminy są optymalne, biorąc pod uwagę swoje preferencje
3. Uwzględnić czas dojazdu między spotkaniami
4. Zapisać szczegóły spotkania w notatniku lub kalendarzu
5. Pamiętać o odpowiednim przygotowaniu do spotkania (np. odpowiedni strój)

Te działania zabierają czas i energię, które można by wykorzystać na bardziej wartościowe zadania. AIPersonalPlanner rozwiązuje ten problem przez automatyzację procesu planowania, uwzględniając preferencje użytkownika oraz wykorzystując AI do generowania optymalnych propozycji terminów spotkań.

## 3. Wymagania funkcjonalne

### 3.1 System kont użytkowników
- Rejestracja użytkownika wymagająca podania email, imienia i nazwiska
- Logowanie z wykorzystaniem adresu email i hasła
- Możliwość resetowania hasła
- Profil użytkownika z możliwością edycji danych osobowych

### 3.2 Preferencje spotkań
- Możliwość ustawienia preferencji dotyczących rozplanowania spotkań (rozłożone vs. skondensowane)
- Określenie preferowanych pór dnia na spotkania
- Ustawienie minimalnych przerw między spotkaniami
- Zaznaczenie dni niedostępnych
- Zapisywanie i edycja preferencji

### 3.3 Zarządzanie spotkaniami
- Wprowadzanie krótkich notatek o planowanych spotkaniach
- Określanie miejsca spotkania (nazwa lub adres)
- Podawanie przewidywanego czasu trwania spotkania
- Przeglądanie zaplanowanych spotkań
- Edycja istniejących spotkań
- Usuwanie spotkań

### 3.4 Integracja z AI
- Analiza notatek użytkownika przez AI
- Rozpoznawanie typu spotkania (z 5 głównych kategorii z podtypami)
- Generowanie szczegółowego opisu spotkania na podstawie notatki
- Proponowanie 2-4 optymalnych terminów spotkania, uwzględniających preferencje użytkownika
- Sugerowanie odpowiedniego stroju dostosowanego do typu spotkania

### 3.5 Integracja z Google Calendar
- Jednokierunkowy eksport zaakceptowanych spotkań do Google Calendar
- Autoryzacja dostępu do Google Calendar

### 3.6 Interfejs użytkownika
- Dashboard z podglądem najbliższych spotkań
- Interfejs do szybkiego wprowadzania notatek o spotkaniach
- Widok kartek z propozycjami terminów spotkań (2-4)
- Responsywny design dostosowany do urządzeń mobilnych i desktopowych

## 4. Granice produktu

Następujące funkcjonalności NIE są częścią MVP:

1. Import danych w różnych formatach (PDF, DOCX, itp.)
2. Bogata obsługa multimediów (np. zdjęć miejsc spotkania)
3. Udostępnianie planu spotkań dla innych użytkowników
4. Funkcje społecznościowe
5. Filtrowanie spotkań według różnych kryteriów
6. System przypomnień o spotkaniach
7. Funkcjonalność spotkań cyklicznych
8. Dwukierunkowa synchronizacja z Google Calendar lub innymi kalendarzami
9. Możliwość edycji propozycji AI (użytkownik może tylko akceptować propozycje lub dodawać spotkania ręcznie)

## 5. Historyjki użytkowników

### Rejestracja i logowanie

#### US-001: Bezpieczny dostęp i uwierzytelnianie
- Tytuł: Bezpieczny dostęp
- Opis: Jako użytkownik chcę mieć możliwość rejestracji i logowania się do systemu w sposób zapewniający bezpieczeństwo moich danych.
- Kryteria akceptacji:
  - Logowanie i rejestracja odbywają się na dedykowanych stronach.
  - Logowanie wymaga podania adresu email i hasła.
  - Rejestracja wymaga podania adresu email, hasła i potwierdzenia hasła.
  - Użytkownik MOŻE korzystać z generowania planu spotkań "ad-hoc" bez logowania się do systemu (US-007, US-008).
  - System weryfikuje unikalność adresu email
  - Użytkownik NIE MOŻE korzystać z funkcji Kolekcji bez logowania się do systemu (US-009, US-010, US-011, US-012).
  - Użytkownik może logować się do systemu poprzez przycisk w prawym górnym rogu.
  - Użytkownik może się wylogować z systemu poprzez przycisk w prawym górnym rogu w głównym @Layout.astro.
  - Nie korzystamy z zewnętrznych serwisów logowania (np. Google, GitHub).
  - Odzyskiwanie hasła powinno być możliwe (US-003).


#### US-002: Logowanie do aplikacji
Jako zarejestrowany użytkownik chcę zalogować się do aplikacji, aby uzyskać dostęp do mojego konta i danych.

Kryteria akceptacji:
- Użytkownik może zalogować się używając adresu email i hasła
- System weryfikuje poprawność danych logowania
- Po zalogowaniu użytkownik jest przekierowany do dashboardu

#### US-003: Resetowanie hasła
Jako użytkownik chcę zresetować hasło, gdy je zapomnę.

Kryteria akceptacji:
- Użytkownik może zażądać resetowania hasła podając swój email
- System wysyła email z linkiem do resetowania hasła
- Link do resetowania hasła jest ważny przez 24 godziny
- Użytkownik może ustawić nowe hasło po kliknięciu w link

### Zarządzanie profilem i preferencjami

#### US-004: Edycja danych profilu
Jako użytkownik chcę edytować swoje dane osobowe, aby aktualizować informacje o sobie.

Kryteria akceptacji:
- Użytkownik może zmienić imię i nazwisko
- Użytkownik może zmienić hasło
- System zapisuje zmiany po potwierdzeniu przez użytkownika

#### US-005: Ustawienie preferencji spotkań
Jako użytkownik chcę ustawić swoje preferencje dotyczące spotkań, aby AI mogło lepiej planować mój czas.

Kryteria akceptacji:
- Użytkownik może określić preferowany rozkład spotkań (rozłożone vs. skondensowane)
- Użytkownik może wybrać preferowane pory dnia na spotkania
- Użytkownik może określić minimalne przerwy między spotkaniami
- Użytkownik może zaznaczyć dni niedostępne
- System zapisuje preferencje i używa ich przy generowaniu propozycji

#### US-006: Edycja preferencji spotkań
Jako użytkownik chcę edytować swoje preferencje spotkań, aby dostosować je do zmieniających się potrzeb.

Kryteria akceptacji:
- Użytkownik może edytować wszystkie wcześniej ustawione preferencje
- System zapisuje zaktualizowane preferencje
- Zaktualizowane preferencje są natychmiast używane przy nowych propozycjach

### Zarządzanie spotkaniami

#### US-007: Wprowadzanie notatki o spotkaniu
Jako użytkownik chcę szybko wprowadzić notatkę o planowanym spotkaniu, aby AI mogło zaproponować najlepszy termin.

Kryteria akceptacji:
- Użytkownik może wprowadzić krótką notatkę o spotkaniu
- Użytkownik może określić miejsce spotkania (nazwa lub adres)
- Użytkownik może określić przewidywany czas trwania spotkania
- System zapisuje wprowadzone informacje

#### US-008: Przeglądanie propozycji terminów
Jako użytkownik chcę przeglądać propozycje terminów wygenerowane przez AI, aby wybrać najlepszą opcję.

Kryteria akceptacji:
- System wyświetla 2-4 propozycje terminów w formie kartek
- Każda propozycja zawiera datę, godzinę, miejsce i typ spotkania
- Każda propozycja zawiera sugestię odpowiedniego stroju
- Użytkownik może zobaczyć szacowany czas dojazdu

#### US-009: Akceptacja propozycji terminu
Jako użytkownik chcę zaakceptować wybraną propozycję terminu, aby zaplanować spotkanie.

Kryteria akceptacji:
- Użytkownik może wybrać jedną z proponowanych opcji
- System zapisuje zaakceptowany termin
- Zaakceptowane spotkanie pojawia się w dashboardzie
- System potwierdza zaplanowanie spotkania

#### US-010: Ręczne dodawanie spotkania
Jako użytkownik chcę ręcznie dodać spotkanie, gdy nie chcę korzystać z propozycji AI.

Kryteria akceptacji:
- Użytkownik może ręcznie określić wszystkie szczegóły spotkania (datę, godzinę, miejsce, typ)
- System zapisuje ręcznie dodane spotkanie
- Ręcznie dodane spotkanie pojawia się w dashboardzie

#### US-011: Przeglądanie zaplanowanych spotkań
Jako użytkownik chcę przeglądać wszystkie zaplanowane spotkania, aby być na bieżąco z harmonogramem.

Kryteria akceptacji:
- System wyświetla listę wszystkich zaplanowanych spotkań
- Spotkania są posortowane chronologicznie
- Dla każdego spotkania wyświetlane są podstawowe informacje (data, godzina, miejsce, typ)
- Użytkownik może zobaczyć szczegóły każdego spotkania

#### US-012: Usuwanie zaplanowanego spotkania
Jako użytkownik chcę usunąć zaplanowane spotkanie, gdy jest już nieaktualne.

Kryteria akceptacji:
- Użytkownik może usunąć wybrane spotkanie
- System prosi o potwierdzenie przed usunięciem
- Usunięte spotkanie znika z dashboardu
- System potwierdza usunięcie spotkania

### Integracja z zewnętrznymi narzędziami

#### US-013: Eksport spotkania do Google Calendar
Jako użytkownik chcę wyeksportować zaplanowane spotkanie do Google Calendar, aby mieć synchronizację z moim głównym kalendarzem.

Kryteria akceptacji:
- Użytkownik może ściągnąć wybrane spotkanie jako plik kalendarza w formacie .ics.

### Scenariusze alternatywne i skrajne

#### US-014: Obsługa konfliktów terminów
Jako użytkownik chcę, aby system informował mnie o konfliktach terminów, gdy próbuję zaplanować nakładające się spotkania.

Kryteria akceptacji:
- System wykrywa nakładające się terminy spotkań
- System wyświetla powiadomienie o konflikcie
- Użytkownik może zdecydować, czy kontynuować planowanie mimo konfliktu

#### US-015: Obsługa niedostępnych terminów
Jako użytkownik chcę, aby system respektował moje dni niedostępne przy proponowaniu terminów spotkań.

Kryteria akceptacji:
- System nie proponuje terminów w dniach oznaczonych jako niedostępne
- Jeśli wszystkie możliwe terminy przypadają na dni niedostępne, system informuje o tym użytkownika

#### US-016: Obsługa błędów AI
Jako użytkownik chcę otrzymać informację, gdy AI nie może wygenerować propozycji na podstawie mojej notatki.

Kryteria akceptacji:
- System wyświetla komunikat, gdy AI nie może przetworzyć notatki
- System sugeruje, jak poprawić notatkę, aby AI mogło ją przetworzyć
- Użytkownik może edytować notatkę i spróbować ponownie

#### US-017: Wylogowanie z aplikacji
Jako użytkownik chcę wylogować się z aplikacji, aby zabezpieczyć swoje konto.

Kryteria akceptacji:
- Użytkownik może wylogować się z aplikacji
- Po wylogowaniu użytkownik jest przekierowany do strony logowania
- Po wylogowaniu dane użytkownika nie są dostępne bez ponownego logowania

#### US-018: Kolekcje spotkań
- Tytuł: Kolekcje spotkań
- Opis: Jako użytkownik chcę móc zapisywać i usuwać spotkania, aby szybko wykorzystywać sprawdzone rozwiązania w różnych projektach.
- Kryteria akceptacji:
  - Użytkownik może zapisać aktualny zestaw reguł (US-001) jako kolekcję (nazwa, opis, reguły).
  - Użytkownik może aktualizować kolekcję.
  - Użytkownik może usunąć kolekcję.
  - Użytkownik może przywrócić kolekcję do poprzedniej wersji (pending changes).
  - Funkcjonalność kolekcji nie jest dostępna bez logowania się do systemu (US-004).

## 6. Metryki sukcesu

### 6.1 Metryki użytkowania
- 90% użytkowników posiada wypełnione preferencje spotkań w swoim profilu
- 75% użytkowników generuje 3 lub więcej planów spotkań na rok
- 75% propozycji AI jest akceptowanych przez użytkowników

### 6.2 Metryki techniczne
- Czas generowania propozycji przez AI nie przekracza 5 sekund
- Dostępność systemu na poziomie 99.5%
- Czas ładowania stron nie przekracza 2 sekund

### 6.3 Sposoby mierzenia
- Automatyczne zbieranie statystyk użytkowania aplikacji
- Śledzenie akceptacji propozycji AI per użytkownik oraz ogólnie
- Monitoring czasu odpowiedzi systemu
- Zbieranie opinii użytkowników poprzez ankiety satysfakcji
- Analiza wskaźnika rezygnacji z korzystania z aplikacji 