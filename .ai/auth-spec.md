# Specyfikacja architektury modułu autentykacji

## 1. Architektura interfejsu użytkownika

### 1.1 Nowe strony Astro

#### Strony publiczne (non-auth)
- `/auth/login.astro` - strona logowania
- `/auth/register.astro` - strona rejestracji
- `/auth/reset-password.astro` - strona żądania resetu hasła
- `/auth/new-password.astro` - strona ustawiania nowego hasła (dostępna przez token)

#### Strony chronione (auth)
- `/account/preferences.astro` - strona ustawień preferencji użytkownika

### 1.2 Komponenty React

#### Formularze autentykacji
- `AuthForm.tsx` - bazowy komponent formularza z obsługą walidacji i błędów
- `LoginForm.tsx` - formularz logowania (email + hasło)
- `RegisterForm.tsx` - formularz rejestracji (email + hasło)
- `ResetPasswordForm.tsx` - formularz żądania resetu hasła
- `NewPasswordForm.tsx` - formularz ustawiania nowego hasła
- `PreferencesForm.tsx` - formularz edycji preferencji użytkownika

#### Komponenty pomocnicze
- `AuthLayout.tsx` - layout dla stron autoryzacji
- `ProtectedRoute.tsx` - komponent HOC do zabezpieczania stron wymagających autoryzacji
- `AuthStatus.tsx` - komponent wyświetlający status zalogowania w głównym layoucie
- `AuthError.tsx` - komponent wyświetlający błędy autoryzacji
- `AuthSuccess.tsx` - komponent wyświetlający komunikaty sukcesu

### 1.3 Walidacja i obsługa błędów

#### Walidacja formularzy
- Wykorzystanie biblioteki Zod do walidacji danych wejściowych
- Walidacja w czasie rzeczywistym (client-side)
- Walidacja przed wysłaniem (server-side)

#### Komunikaty błędów
- Błędy walidacji formularzy
- Błędy autentykacji (nieprawidłowe dane, konto nie istnieje, itp.)
- Błędy serwera
- Błędy sieci

### 1.4 Scenariusze użytkownika

#### Rejestracja
1. Użytkownik wchodzi na stronę rejestracji
2. Wypełnia formularz danymi (email + hasło)
3. System waliduje dane w czasie rzeczywistym
4. Po zatwierdzeniu system tworzy konto
5. Użytkownik zostaje przekierowany na stronę główną

#### Logowanie
1. Użytkownik wchodzi na stronę logowania
2. Wprowadza dane logowania
3. System weryfikuje dane
4. Po poprawnym logowaniu użytkownik jest przekierowany do ostatniej strony lub dashboardu

#### Reset hasła
1. Użytkownik żąda resetu hasła podając email
2. System wysyła link do resetu
3. Użytkownik klika w link w mailu
4. System weryfikuje token i wyświetla formularz nowego hasła
5. Po zmianie hasła użytkownik może się zalogować

## 2. Logika backendowa

### 2.1 Endpointy API

#### Autentykacja
```typescript
// POST /api/auth/register
interface RegisterRequest {
  email: string;
  password: string;
}

// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

// POST /api/auth/logout
// (nie wymaga body)

// POST /api/auth/reset-password
interface ResetPasswordRequest {
  email: string;
}

// POST /api/auth/new-password
interface NewPasswordRequest {
  token: string;
  password: string;
}
```

#### Preferencje użytkownika
```typescript
// GET /api/account/preferences
// (zwraca preferencje użytkownika)

// PUT /api/account/preferences
interface UpdatePreferencesRequest {
  // Preferencje dotyczące rozplanowania spotkań
  meetingSpacing: 'spread' | 'condensed';
  // Preferowane pory dnia na spotkania
  preferredTimeSlots: {
    start: string; // HH:mm
    end: string;   // HH:mm
  }[];
  // Minimalne przerwy między spotkaniami (w minutach)
  minBreakDuration: number;
  // Dni niedostępne
  unavailableDays: string[]; // ISO 8601 dates
}
```

### 2.2 Modele danych

```typescript
// src/types.ts
interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}

interface UserPreferences {
  userId: string;
  meetingSpacing: 'spread' | 'condensed';
  preferredTimeSlots: {
    start: string;
    end: string;
  }[];
  minBreakDuration: number;
  unavailableDays: string[];
  updatedAt: Date;
}
```

### 2.3 Middleware

```typescript
// src/middleware/auth.ts
interface AuthMiddleware {
  // Weryfikacja sesji użytkownika
  isAuthenticated(): Promise<boolean>;
  
  // Przekierowanie niezalogowanych
  requireAuth(): Promise<void>;
  
  // Przekierowanie zalogowanych
  requireGuest(): Promise<void>;
  
  // Pobranie danych użytkownika
  getUser(): Promise<User | null>;
}
```

## 3. System autentykacji

### 3.1 Integracja z Supabase Auth

#### Konfiguracja
```typescript
// src/lib/supabase.ts
interface SupabaseConfig {
  url: string;
  anonKey: string;
  authRedirectUrl: string;
}
```

#### Serwis autentykacji
```typescript
// src/lib/auth.ts
interface AuthService {
  // Rejestracja użytkownika
  register(data: RegisterRequest): Promise<User>;
  
  // Logowanie
  login(data: LoginRequest): Promise<Session>;
  
  // Wylogowanie
  logout(): Promise<void>;
  
  // Reset hasła
  resetPassword(email: string): Promise<void>;
  
  // Ustawienie nowego hasła
  setNewPassword(token: string, password: string): Promise<void>;
  
  // Aktualizacja preferencji
  updatePreferences(data: UpdatePreferencesRequest): Promise<UserPreferences>;
  
  // Pobranie preferencji
  getPreferences(): Promise<UserPreferences>;
}
```

### 3.2 Bezpieczeństwo

- Szyfrowanie haseł po stronie Supabase
- Sesje JWT z czasem wygaśnięcia
- CSRF protection
- Rate limiting dla endpointów auth
- Walidacja tokenów resetowania hasła
- Bezpieczne przekierowania po akcjach auth

### 3.3 Integracja z Astro SSR

```typescript
// src/lib/session.ts
interface SessionManager {
  // Pobranie sesji z cookies
  getSession(): Promise<Session | null>;
  
  // Zapisanie sesji
  setSession(session: Session): Promise<void>;
  
  // Usunięcie sesji
  clearSession(): Promise<void>;
}
```

### 3.4 Obsługa stanu autoryzacji

```typescript
// src/lib/auth-store.ts
interface AuthStore {
  // Stan autoryzacji
  isAuthenticated: boolean;
  user: User | null;
  preferences: UserPreferences | null;
  
  // Akcje
  setUser(user: User | null): void;
  setAuthenticated(value: boolean): void;
  setPreferences(preferences: UserPreferences | null): void;
  
  // Subskrypcja zmian
  subscribe(callback: (state: AuthState) => void): () => void;
}
``` 