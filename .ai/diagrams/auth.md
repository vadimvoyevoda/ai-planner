# Diagram architektury autentykacji

<authentication_analysis>
1. Przepływy autentykacji:
   - Rejestracja nowego użytkownika (email + hasło)
   - Logowanie użytkownika
   - Resetowanie hasła
   - Odświeżanie tokenu sesji
   - Wylogowanie

2. Główni aktorzy:
   - Przeglądarka (interfejs użytkownika)
   - Middleware Astro (warstwa pośrednia)
   - API Astro (endpointy aplikacji)
   - Supabase Auth (usługa autentykacji)

3. Procesy weryfikacji i odświeżania tokenów:
   - Weryfikacja tokenu JWT przy każdym żądaniu
   - Automatyczne odświeżanie tokenu przed wygaśnięciem
   - Obsługa wygasłych tokenów i przekierowanie do logowania

4. Kroki autentykacji:
   - Walidacja danych wejściowych
   - Weryfikacja poświadczeń
   - Generowanie tokenów
   - Zarządzanie sesją
   - Obsługa błędów i przekierowania
</authentication_analysis>

<mermaid_diagram>
```mermaid
sequenceDiagram
    autonumber
    participant B as Przeglądarka
    participant M as Middleware
    participant A as API Astro
    participant S as Supabase Auth

    %% Rejestracja
    Note over B,S: Proces rejestracji
    B->>A: Wysłanie formularza rejestracji
    activate A
    A->>A: Walidacja danych
    A->>S: Utworzenie konta
    S-->>A: Potwierdzenie utworzenia
    A-->>B: Przekierowanie do logowania
    deactivate A

    %% Logowanie
    Note over B,S: Proces logowania
    B->>A: Wysłanie danych logowania
    activate A
    A->>S: Weryfikacja poświadczeń
    S-->>A: Token JWT + Refresh Token
    A->>M: Zapisanie sesji
    A-->>B: Przekierowanie do dashboardu
    deactivate A

    %% Weryfikacja sesji
    Note over B,S: Weryfikacja sesji
    B->>M: Żądanie chronionego zasobu
    activate M
    M->>S: Weryfikacja tokenu JWT
    alt Token ważny
        S-->>M: Potwierdzenie ważności
        M->>A: Przekazanie żądania
        A-->>B: Zwrócenie zasobu
    else Token wygasł
        S-->>M: Token wygasł
        M->>S: Próba odświeżenia (Refresh Token)
        alt Refresh Token ważny
            S-->>M: Nowy token JWT
            M->>A: Przekazanie żądania
            A-->>B: Zwrócenie zasobu
        else Refresh Token wygasł
            M-->>B: Przekierowanie do logowania
        end
    end
    deactivate M

    %% Reset hasła
    Note over B,S: Reset hasła
    B->>A: Żądanie resetu hasła
    activate A
    A->>S: Generowanie tokenu resetu
    S->>S: Wysłanie maila z linkiem
    S-->>A: Potwierdzenie wysłania
    A-->>B: Komunikat o wysłaniu linku
    deactivate A
    
    B->>A: Ustawienie nowego hasła (z tokenem)
    activate A
    A->>S: Weryfikacja tokenu i zmiana hasła
    S-->>A: Potwierdzenie zmiany
    A-->>B: Przekierowanie do logowania
    deactivate A

    %% Wylogowanie
    Note over B,S: Wylogowanie
    B->>A: Żądanie wylogowania
    activate A
    A->>M: Usunięcie sesji
    A->>S: Unieważnienie tokenów
    S-->>A: Potwierdzenie wylogowania
    A-->>B: Przekierowanie do strony głównej
    deactivate A
```
</mermaid_diagram> 