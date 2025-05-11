# Diagram podróży użytkownika dla modułu autentykacji

<user_journey_analysis>
1. Ścieżki użytkownika:
   - Rejestracja nowego użytkownika
   - Logowanie do systemu
   - Reset hasła
   - Zarządzanie preferencjami
   - Wylogowanie

2. Główne podróże i stany:
   - Niezalogowany użytkownik (dostęp do podstawowych funkcji)
   - Proces rejestracji i logowania
   - Zarządzanie kontem
   - Odzyskiwanie dostępu
   - Sesja zalogowanego użytkownika

3. Punkty decyzyjne:
   - Wybór między rejestracją a logowaniem
   - Weryfikacja danych logowania
   - Weryfikacja tokenu resetu hasła
   - Dostęp do chronionych zasobów

4. Cel każdego stanu:
   - Strona główna: Wprowadzenie do aplikacji
   - Rejestracja: Utworzenie nowego konta
   - Logowanie: Dostęp do pełnej funkcjonalności
   - Reset hasła: Odzyskanie dostępu
   - Preferencje: Personalizacja ustawień
</user_journey_analysis>

<mermaid_diagram>
```mermaid
stateDiagram-v2
    [*] --> StronaGlowna
    
    state "Dostęp Publiczny" as Public {
        StronaGlowna --> WyborDostępu
        
        state WyborDostępu <<choice>>
        WyborDostępu --> TrybAnonimowy: Bez logowania
        WyborDostępu --> ProcesDostępu: Z kontem
    }
    
    state "Proces Dostępu" as ProcesDostępu {
        state WyborAkcji <<choice>>
        [*] --> WyborAkcji
        
        WyborAkcji --> Logowanie: Mam konto
        WyborAkcji --> Rejestracja: Nowe konto
        WyborAkcji --> ResetHasła: Zapomniałem hasła
        
        state "Rejestracja" as Rejestracja {
            [*] --> FormularzRejestracji
            FormularzRejestracji --> WalidacjaDanych
            WalidacjaDanych --> TworzenieKonta: Dane poprawne
            WalidacjaDanych --> FormularzRejestracji: Błędy
            TworzenieKonta --> [*]: Sukces
        }
        
        state "Logowanie" as Logowanie {
            [*] --> FormularzLogowania
            FormularzLogowania --> WeryfikacjaDanych
            WeryfikacjaDanych --> [*]: Sukces
            WeryfikacjaDanych --> FormularzLogowania: Błędne dane
        }
        
        state "Reset Hasła" as ResetHasła {
            [*] --> FormularzReset
            FormularzReset --> WysyłanieMaila
            WysyłanieMaila --> LinkWysłany
            LinkWysłany --> WeryfikacjaTokenu
            
            state weryfikacja <<choice>>
            WeryfikacjaTokenu --> weryfikacja
            weryfikacja --> NoweHasło: Token ważny
            weryfikacja --> FormularzReset: Token nieważny
            
            NoweHasło --> [*]: Hasło zmienione
        }
    }
    
    state "Tryb Anonimowy" as TrybAnonimowy {
        [*] --> GenerowaniePlanu
        GenerowaniePlanu --> PodglądPropozycji
        PodglądPropozycji --> [*]
        
        note right of GenerowaniePlanu
            Dostęp do podstawowych
            funkcji bez konta
        end note
    }
    
    state "Panel Użytkownika" as PanelUżytkownika {
        [*] --> Dashboard
        
        state "Zarządzanie Kontem" as ZarządzanieKontem {
            Dashboard --> Preferencje
            Preferencje --> ZapisPreferencji
            ZapisPreferencji --> Dashboard
        }
        
        state "Korzystanie z Aplikacji" as KorzystanieAplikacji {
            Dashboard --> GenerowaniePlanuAuth
            GenerowaniePlanuAuth --> PodglądPropozycjiAuth
            PodglądPropozycjiAuth --> ZapisKolekcji
            ZapisKolekcji --> Dashboard
        }
        
        Dashboard --> Wylogowanie
    }
    
    TrybAnonimowy --> WyborDostępu: Chcę się zalogować
    ProcesDostępu --> PanelUżytkownika: Autoryzacja udana
    Wylogowanie --> Public
    
    note right of PanelUżytkownika
        Pełna funkcjonalność
        dla zalogowanych użytkowników
    end note
```
</mermaid_diagram>

Diagram przedstawia:
1. Kompletną ścieżkę użytkownika od wejścia na stronę do pełnego korzystania z aplikacji
2. Wszystkie możliwe stany i przejścia między nimi
3. Punkty decyzyjne i alternatywne ścieżki
4. Różnice między dostępem anonimowym a zalogowanym
5. Procesy autentykacji i zarządzania kontem 