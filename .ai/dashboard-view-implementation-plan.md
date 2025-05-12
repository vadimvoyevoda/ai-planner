# Plan implementacji widoku Dashboard

## 1. Przegląd
Dashboard to główny widok aplikacji AIPersonalPlanner, służący do szybkiego przeglądania nadchodzących spotkań oraz dodawania nowych poprzez wprowadzanie notatek. Widok umożliwia filtrowanie spotkań, ich grupowanie według dat oraz wykonywanie podstawowych operacji jak usuwanie czy eksport do kalendarza.

## 2. Routing widoku
- Ścieżka: `/`
- Wymaga autentykacji
- Przekierowanie na `/login` dla niezalogowanych użytkowników

## 3. Struktura komponentów
```
DashboardLayout
├── MeetingNoteForm
├── MeetingFilters
└── MeetingsList
    └── MeetingCard
```

## 4. Szczegóły komponentów

### DashboardLayout
- Opis komponentu: Główny layout dashboardu, zarządza stanem autentykacji i układem strony
- Główne elementy: 
  - Header z tytułem i przyciskiem wylogowania
  - Container na zawartość z odpowiednimi paddingami
  - Sekcja powiadomień (toast)
- Obsługiwane interakcje: Wylogowanie
- Obsługiwana walidacja: Sprawdzanie stanu autentykacji
- Typy: `User`, `AuthState`
- Propsy: `children: ReactNode`

### MeetingNoteForm
- Opis komponentu: Formularz do szybkiego wprowadzania notatek o spotkaniach
- Główne elementy:
  - Pole tekstowe na notatkę
  - Przycisk "Generuj propozycje"
  - Przycisk "Dodaj ręcznie"
- Obsługiwane interakcje:
  - Wprowadzanie tekstu
  - Wysyłanie formularza
  - Przejście do ręcznego dodawania
- Obsługiwana walidacja:
  - Minimalna długość notatki (10 znaków)
  - Maksymalna długość notatki (500 znaków)
- Typy: `MeetingNote`, `MeetingFormState`
- Propsy: `onSubmit: (note: string) => Promise<void>`

### MeetingFilters
- Opis komponentu: Panel filtrów dla listy spotkań
- Główne elementy:
  - Select kategorii
  - DateRangePicker
  - Pole wyszukiwania
- Obsługiwane interakcje:
  - Wybór kategorii
  - Wybór zakresu dat
  - Wpisywanie tekstu wyszukiwania
- Typy: `MeetingFilters`, `MeetingCategory`
- Propsy: 
  - `filters: MeetingFilters`
  - `onFiltersChange: (filters: MeetingFilters) => void`

### MeetingsList
- Opis komponentu: Lista spotkań z grupowaniem po datach
- Główne elementy:
  - Nagłówki dat
  - Lista MeetingCard
  - Kontrolki paginacji
- Obsługiwane interakcje:
  - Zmiana strony
  - Rozwijanie/zwijanie grup
- Typy: `Meeting[]`, `PaginationState`
- Propsy:
  - `meetings: Meeting[]`
  - `pagination: PaginationState`
  - `onPageChange: (page: number) => void`

### MeetingCard
- Opis komponentu: Karta pojedynczego spotkania
- Główne elementy:
  - Nagłówek z tytułem i czasem
  - Opis i lokalizacja
  - Przyciski akcji
  - Modal potwierdzenia usunięcia
- Obsługiwane interakcje:
  - Rozwijanie/zwijanie
  - Usuwanie
  - Eksport do .ics
- Obsługiwana walidacja:
  - Sprawdzanie konfliktów terminów
- Typy: `Meeting`, `MeetingActions`
- Propsy:
  - `meeting: Meeting`
  - `onDelete: (id: string) => Promise<void>`
  - `onExport: (id: string) => Promise<void>`

## 5. Typy
```typescript
interface Meeting {
  id: string;
  title: string;
  description: string;
  category: MeetingCategory;
  startTime: string;
  endTime: string;
  locationName: string;
  coordinates?: Coordinates;
  aiGenerated: boolean;
  aiGeneratedNotes?: string;
  createdAt: string;
}

interface MeetingCategory {
  id: string;
  name: string;
  suggestedAttire: string;
}

interface MeetingFilters {
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

interface MeetingActions {
  delete: (id: string) => Promise<void>;
  export: (id: string) => Promise<void>;
}
```

## 6. Zarządzanie stanem

### useMeetings
```typescript
const useMeetings = (filters: MeetingFilters) => {
  // Stan spotkań, loading, error
  // Fetch z paginacją
  // Sortowanie chronologiczne
  // Grupowanie po datach
}
```

### useMeetingFilters
```typescript
const useMeetingFilters = () => {
  // Stan filtrów
  // Walidacja filtrów
  // Debouncing dla wyszukiwania
}
```

### useMeetingActions
```typescript
const useMeetingActions = () => {
  // Akcje usuwania
  // Generowanie .ics
  // Obsługa błędów
}
```

## 7. Integracja API

### Pobieranie spotkań
- Endpoint: GET /meetings/upcoming
- Parametry: limit, page, filters
- Obsługa błędów: 401, network errors

### Usuwanie spotkań
- Endpoint: DELETE /meetings/:id
- Parametry: id spotkania
- Obsługa błędów: 401, 404

### Eksport do .ics
- Generowanie pliku .ics z danych spotkania
- Wykorzystanie biblioteki ics-js
- Trigger pobierania pliku

## 8. Interakcje użytkownika
1. Filtrowanie spotkań:
   - Wybór kategorii z dropdowna
   - Wybór zakresu dat
   - Wpisanie tekstu do wyszukiwania
   
2. Paginacja:
   - Przyciski następna/poprzednia strona
   - Wybór konkretnej strony
   
3. Zarządzanie spotkaniami:
   - Rozwijanie/zwijanie karty spotkania
   - Potwierdzenie usunięcia
   - Eksport do kalendarza

## 9. Warunki i walidacja
1. Formularz notatki:
   - Niepuste pole
   - Limit znaków
   
2. Filtry:
   - Poprawny format dat
   - Walidacja zakresu dat
   
3. Spotkania:
   - Sprawdzanie konfliktów
   - Walidacja przed usunięciem

## 10. Obsługa błędów
1. Błędy API:
   - Wyświetlanie komunikatów w toast
   - Retry dla błędów sieciowych
   
2. Błędy walidacji:
   - Komunikaty przy polach formularza
   - Blokowanie niepoprawnych akcji
   
3. Błędy eksportu:
   - Fallback do ręcznego kopiowania danych
   - Informacja o błędzie generowania pliku

## 11. Kroki implementacji
1. Konfiguracja projektu:
   - Setup Astro z React
   - Instalacja zależności (shadcn/ui, tailwind)
   - Konfiguracja routingu

2. Implementacja komponentów:
   - DashboardLayout
   - MeetingNoteForm
   - MeetingFilters
   - MeetingsList
   - MeetingCard

3. Integracja z API:
   - Setup klienta HTTP
   - Implementacja hooków
   - Obsługa błędów

4. Stylowanie i RWD:
   - Layout responsywny
   - Style komponentów
   - Animacje i przejścia

5. Testowanie:
   - Testy jednostkowe komponentów
   - Testy integracyjne
   - Testy E2E dla głównych ścieżek

6. Optymalizacja:
   - Code splitting
   - Lazy loading
   - Optymalizacja zapytań 