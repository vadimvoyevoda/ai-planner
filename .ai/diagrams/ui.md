# Diagram architektury UI dla modułu autentykacji

<architecture_analysis>
1. Komponenty wymienione w specyfikacji:
   - Strony Astro (server-side)
   - Komponenty React (client-side)
   - Formularze autentykacji
   - Komponenty pomocnicze
   - Komponenty stanu i walidacji

2. Główne strony i komponenty:
   - Strony publiczne: login, register, reset-password, new-password
   - Strony chronione: preferences
   - Formularze: AuthForm, LoginForm, RegisterForm, ResetPasswordForm, NewPasswordForm, PreferencesForm
   - Komponenty UI: AuthLayout, ProtectedRoute, AuthStatus, AuthError, AuthSuccess

3. Przepływ danych:
   - Walidacja formularzy (Zod)
   - Zarządzanie stanem autoryzacji
   - Obsługa sesji i tokenów
   - Komunikacja z Supabase Auth

4. Funkcjonalność komponentów:
   - Formularze: wprowadzanie i walidacja danych
   - Layout: struktura i nawigacja
   - Status: informacje o stanie autoryzacji
   - Komunikaty: obsługa błędów i sukcesu
</architecture_analysis>

<mermaid_diagram>
```mermaid
flowchart TD
    %% Definicja stylów
    classDef page fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef component fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef form fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef layout fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    classDef state fill:#fbe9e7,stroke:#bf360c,stroke-width:2px

    %% Główny layout aplikacji
    Layout["Layout.astro"]:::layout
    AuthLayout["AuthLayout.tsx"]:::layout

    %% Strony Astro
    subgraph "Strony Publiczne"
        Login["login.astro"]:::page
        Register["register.astro"]:::page
        ResetPwd["reset-password.astro"]:::page
        NewPwd["new-password.astro"]:::page
    end

    subgraph "Strony Chronione"
        Preferences["preferences.astro"]:::page
    end

    %% Komponenty React
    subgraph "Komponenty Formularzy"
        AuthForm["AuthForm.tsx\n(Bazowy)"]:::form
        LoginForm["LoginForm.tsx"]:::form
        RegisterForm["RegisterForm.tsx"]:::form
        ResetForm["ResetPasswordForm.tsx"]:::form
        NewPwdForm["NewPasswordForm.tsx"]:::form
        PrefForm["PreferencesForm.tsx"]:::form
    end

    subgraph "Komponenty Pomocnicze"
        ProtectedRoute["ProtectedRoute.tsx"]:::component
        AuthStatus["AuthStatus.tsx"]:::component
        AuthError["AuthError.tsx"]:::component
        AuthSuccess["AuthSuccess.tsx"]:::component
    end

    subgraph "Stan i Walidacja"
        AuthStore["AuthStore\n(Stan Autoryzacji)"]:::state
        ZodSchema["Zod Schemas\n(Walidacja)"]:::state
        SessionMgr["SessionManager\n(Zarządzanie Sesją)"]:::state
    end

    %% Relacje między komponentami
    Layout --> AuthStatus
    Layout --> AuthLayout
    
    AuthLayout --> Login
    AuthLayout --> Register
    AuthLayout --> ResetPwd
    AuthLayout --> NewPwd
    
    Login --> LoginForm
    Register --> RegisterForm
    ResetPwd --> ResetForm
    NewPwd --> NewPwdForm
    Preferences --> PrefForm

    LoginForm --> AuthForm
    RegisterForm --> AuthForm
    ResetForm --> AuthForm
    NewPwdForm --> AuthForm
    PrefForm --> AuthForm

    AuthForm --> ZodSchema
    AuthForm --> AuthError
    AuthForm --> AuthSuccess
    
    ProtectedRoute --> Preferences
    ProtectedRoute --> AuthStore
    
    AuthStatus --> AuthStore
    AuthStore --> SessionMgr

    %% Dodanie klas do elementów
    style Layout fill:#f1f8e9,stroke:#33691e,stroke-width:2px
    style AuthLayout fill:#f1f8e9,stroke:#33691e,stroke-width:2px
```
</mermaid_diagram>

Diagram przedstawia kompletną architekturę UI modułu autentykacji, uwzględniając:
1. Hierarchię komponentów i ich zależności
2. Podział na strony server-side (Astro) i komponenty client-side (React)
3. Przepływ danych między komponentami
4. Integrację z systemem zarządzania stanem i walidacją
5. Wyraźne rozróżnienie między komponentami publicznymi i chronionymi 