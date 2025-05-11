# Plan implementacji widoku propozycji terminów

## 1. Przegląd
Widok propozycji terminów to kluczowy element aplikacji AIPersonalPlanner, który prezentuje użytkownikowi 2-4 propozycje terminów spotkań wygenerowane przez AI na podstawie wcześniej wprowadzonej notatki. Użytkownik może przeglądać szczegóły każdej propozycji (data, godzina, miejsce, kategoria, sugerowany strój) oraz zaakceptować wybraną opcję, co prowadzi do utworzenia spotkania w systemie.

## 2. Routing widoku
- Ścieżka: `/proposals`
- Parametry URL: Propozycje są generowane na podstawie danych przekazanych z dashboardu poprzez parametry lub stan.

## 3. Struktura komponentów
```
ProposalsPage
├── LoadingState (podczas generowania)
├── ErrorState (w przypadku błędu)
├── ProposalCard[] (2-4 karty)
│   ├── ProposalDetails
│   │   ├── CategoryBadge
│   │   ├── LocationInfo
│   │   ├── TimeInfo
│   │   └── AttireInfo
│   ├── ConflictBadge (jeśli wykryto konflikt)
│   └── AcceptButton
├── CancelGenerationButton
└── ConfirmationDialog (wyświetlany warunkowo)
```

## 4. Szczegóły komponentów

### ProposalsPage
- Opis komponentu: Główny komponent strony propozycji terminów, zarządzający stanem, odpowiedzialny za ładowanie danych, obsługę interakcji i wyświetlanie listy propozycji.
- Główne elementy: Kontener z nagłówkiem, sekcją propozycji (grid lub flex), przyciskiem anulowania i ewentualnym dialogiem potwierdzenia.
- Obsługiwane interakcje: Inicjalizacja i ładowanie propozycji, przekierowanie po akceptacji propozycji, anulowanie generowania.
- Obsługiwana walidacja: Sprawdzanie statusu ładowania, obsługa błędów z API, weryfikacja konfliktów terminów.
- Typy: `MeetingProposal[]`, `ProposalPageState`, `ApiError`, `MeetingConflict[]`
- Propsy: N/A (komponent na poziomie strony)

### ProposalCard
- Opis komponentu: Prezentuje pojedynczą propozycję terminu w formie karty z wszystkimi szczegółami i przyciskiem akceptacji.
- Główne elementy: Karta z nagłówkiem (data/czas), sekcją szczegółów, oznaczeniem konfliktów i przyciskiem akceptacji.
- Obsługiwane interakcje: Kliknięcie przycisku akceptacji, hover na elementach z tooltipami.
- Obsługiwana walidacja: Sprawdzanie kompletności danych propozycji.
- Typy: `MeetingProposal`, `MeetingCategory`
- Propsy: 
  ```typescript
  {
    proposal: MeetingProposal;
    onAccept: (proposal: MeetingProposal) => void;
    hasConflicts: boolean;
    isSelected: boolean;
    isLoading: boolean;
  }
  ```

### ProposalDetails
- Opis komponentu: Wyświetla szczegóły propozycji spotkania w sposób wizualnie przejrzysty.
- Główne elementy: Sekcje z ikonami i tekstem dla kategorii, lokalizacji, czasu i sugerowanego stroju.
- Obsługiwane interakcje: Hover dla tooltipów z dodatkowymi informacjami.
- Obsługiwana walidacja: Sprawdzanie dostępności wszystkich wymaganych pól.
- Typy: `MeetingProposal`
- Propsy: 
  ```typescript
  {
    proposal: MeetingProposal;
  }
  ```

### ConflictBadge
- Opis komponentu: Znacznik wyświetlany na karcie propozycji, informujący o konflikcie z istniejącym spotkaniem.
- Główne elementy: Badge z ikoną ostrzeżenia i tekstem.
- Obsługiwane interakcje: Hover wyświetlający szczegóły konfliktów.
- Obsługiwana walidacja: N/A
- Typy: `MeetingConflict[]`
- Propsy: 
  ```typescript
  {
    conflicts: MeetingConflict[];
  }
  ```

### LoadingState
- Opis komponentu: Przedstawia stan ładowania podczas generowania propozycji lub akceptacji wybranej opcji.
- Główne elementy: Spinner, pasek postępu lub skeleton, komunikat o trwającym procesie.
- Obsługiwane interakcje: N/A
- Obsługiwana walidacja: N/A
- Typy: N/A
- Propsy: 
  ```typescript
  {
    message?: string;
  }
  ```

### ErrorState
- Opis komponentu: Wyświetla informacje o błędach podczas generowania lub akceptacji propozycji.
- Główne elementy: Komunikat o błędzie, opcjonalne szczegóły, przycisk powrotu lub ponowienia próby.
- Obsługiwane interakcje: Kliknięcie przycisku powrotu lub ponowienia próby.
- Obsługiwana walidacja: N/A
- Typy: `ApiError`
- Propsy: 
  ```typescript
  {
    error: ApiError;
    onRetry?: () => void;
    onBack?: () => void;
  }
  ```

### ConfirmationDialog
- Opis komponentu: Dialog wyświetlany przed anulowaniem generowania lub akceptacją propozycji z konfliktami.
- Główne elementy: Tytuł, komunikat, przyciski potwierdzenia i anulowania.
- Obsługiwane interakcje: Kliknięcie przycisków potwierdzenia lub anulowania.
- Obsługiwana walidacja: N/A
- Typy: `MeetingConflict[]` (opcjonalnie, dla potwierdzenia z konfliktami)
- Propsy: 
  ```typescript
  {
    type: 'cancel-generation' | 'accept-with-conflicts';
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    conflicts?: MeetingConflict[];
  }
  ```

## 5. Typy

### MeetingProposalRequest
```typescript
interface MeetingProposalRequest {
  note: string;
  locationName?: string;
  estimatedDuration?: number; // w minutach
}
```

### MeetingProposal
```typescript
interface MeetingProposal {
  startTime: string; // ISO8601
  endTime: string; // ISO8601
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  suggestedAttire: string;
  locationName: string;
  aiGeneratedNotes: string;
  originalNote: string;
}
```

### MeetingProposalsResponse
```typescript
interface MeetingProposalsResponse {
  proposals: MeetingProposal[];
}
```

### MeetingAcceptRequest
```typescript
interface MeetingAcceptRequest {
  startTime: string; // ISO8601
  endTime: string; // ISO8601
  title: string;
  description: string;
  categoryId: string;
  locationName: string;
  aiGeneratedNotes: string;
  originalNote: string;
}
```

### MeetingAcceptResponse
```typescript
interface MeetingAcceptResponse {
  id: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
    suggestedAttire: string;
  };
  startTime: string; // ISO8601
  endTime: string; // ISO8601
  locationName: string;
  aiGenerated: boolean;
  originalNote: string;
  aiGeneratedNotes: string;
  createdAt: string; // ISO8601
  conflicts?: MeetingConflict[];
}
```

### MeetingConflict
```typescript
interface MeetingConflict {
  id: string;
  title: string;
  startTime: string; // ISO8601
  endTime: string; // ISO8601
}
```

### ApiError
```typescript
interface ApiError {
  message: string;
  errors?: Record<string, any>;
}
```

### ProposalPageState
```typescript
interface ProposalPageState {
  status: 'loading' | 'error' | 'success' | 'initial';
  proposals: MeetingProposal[];
  selectedProposal: MeetingProposal | null;
  error: ApiError | null;
  conflicts: MeetingConflict[] | null;
  showConfirmDialog: boolean;
  confirmationType: 'cancel-generation' | 'accept-with-conflicts' | null;
}
```

## 6. Zarządzanie stanem

Widok propozycji terminów wymaga złożonego zarządzania stanem, obejmującego ładowanie danych, wybór propozycji, obsługę błędów i konfliktów. W tym celu zostanie utworzony niestandardowy hook:

```typescript
function useMeetingProposals() {
  const [state, setState] = useState<ProposalPageState>({
    status: 'initial',
    proposals: [],
    selectedProposal: null,
    error: null,
    conflicts: null,
    showConfirmDialog: false,
    confirmationType: null
  });

  async function generateProposals(data: MeetingProposalRequest) {
    // Logika generowania propozycji
  }

  async function acceptProposal(proposal: MeetingProposal) {
    // Logika akceptacji propozycji
  }

  function cancelGeneration() {
    // Logika anulowania generowania
  }

  function confirmWithConflicts() {
    // Logika potwierdzenia z konfliktami
  }

  function closeDialog() {
    // Logika zamknięcia dialogu
  }

  return {
    ...state,
    generateProposals,
    acceptProposal,
    cancelGeneration,
    confirmWithConflicts,
    closeDialog
  };
}
```

Stan będzie przechowywany w komponencie ProposalsPage i przekazywany do komponentów potomnych za pomocą propsów.

## 7. Integracja API

### Generowanie propozycji
```typescript
async function generateProposals(data: MeetingProposalRequest): Promise<MeetingProposalsResponse> {
  const response = await fetch('/api/meeting-proposals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Błąd podczas generowania propozycji');
  }

  return response.json();
}
```

### Akceptacja propozycji
```typescript
async function acceptProposal(data: MeetingAcceptRequest): Promise<MeetingAcceptResponse> {
  const response = await fetch('/api/meeting-proposals/accept', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Błąd podczas akceptacji propozycji');
  }

  return response.json();
}
```

## 8. Interakcje użytkownika

1. **Inicjalizacja strony**
   - Użytkownik zostaje przekierowany z dashboardu do widoku propozycji
   - System automatycznie generuje propozycje na podstawie przekazanych danych
   - Użytkownik widzi stan ładowania, a następnie 2-4 karteczki z propozycjami

2. **Przeglądanie propozycji**
   - Użytkownik może przeglądać wszystkie wygenerowane propozycje
   - Najechanie na ikony lub elementy z dodatkowymi informacjami wyświetla tooltips
   - Propozycje z konfliktami są wyraźnie oznaczone

3. **Akceptacja propozycji**
   - Użytkownik klika przycisk akceptacji na wybranej karteczce
   - Jeśli propozycja nie ma konfliktów, system akceptuje ją i przekierowuje do dashboardu
   - Jeśli propozycja ma konflikty, system wyświetla dialog potwierdzenia

4. **Potwierdzenie akceptacji z konfliktami**
   - Użytkownik widzi szczegóły konfliktów w dialogu potwierdzenia
   - Użytkownik może potwierdzić akceptację mimo konfliktów lub anulować

5. **Anulowanie generowania**
   - Użytkownik klika przycisk anulowania
   - System wyświetla dialog potwierdzenia
   - Po potwierdzeniu użytkownik zostaje przekierowany do dashboardu

## 9. Warunki i walidacja

1. **Generowanie propozycji**
   - Notatka jest wymagana i nie może być pusta
   - Lokalizacja jest opcjonalna
   - Szacowany czas trwania jest opcjonalny, ale jeśli podany, musi być liczbą dodatnią

2. **Akceptacja propozycji**
   - Wszystkie wymagane pola propozycji muszą być dostępne
   - System weryfikuje konflikty z istniejącymi spotkaniami
   - Jeśli wykryto konflikty, wymagane jest dodatkowe potwierdzenie użytkownika

3. **Walidacja formatów**
   - Daty i czasy muszą być w formacie ISO8601
   - Identyfikatory muszą być poprawnymi UUID

4. **Walidacja na poziomie komponentów**
   - ProposalCard: Weryfikacja kompletności danych propozycji
   - ConfirmationDialog: Weryfikacja typu potwierdzenia

## 10. Obsługa błędów

1. **Błędy podczas generowania propozycji**
   - Wyświetlenie komponentu ErrorState z komunikatem o błędzie
   - Możliwość powrotu do dashboardu lub ponowienia próby

2. **Błędy podczas akceptacji propozycji**
   - Wyświetlenie komunikatu o błędzie
   - Możliwość ponowienia próby lub wyboru innej propozycji

3. **Brak propozycji**
   - Wyświetlenie informacji o braku możliwych terminów
   - Sugestia zmiany preferencji lub ręcznego dodania spotkania

4. **Błędy sieciowe**
   - Obsługa przerwanych połączeń
   - Automatyczne ponowienie próby lub możliwość ręcznego ponowienia

5. **Zabezpieczenie przed przypadkowym zamknięciem**
   - Nasłuchiwanie na zdarzenie beforeunload
   - Wyświetlenie standardowego dialogu potwierdzenia przeglądarki

## 11. Kroki implementacji

1. **Utworzenie plików komponentów**
   - Utworzenie głównego pliku strony `src/pages/proposals.astro`
   - Utworzenie komponentu React `src/components/ProposalsPage.tsx`
   - Utworzenie komponentów potomnych w `src/components`

2. **Implementacja typów**
   - Dodanie wszystkich wymaganych typów w `src/types.ts`
   - Utworzenie schematów walidacji Zod (jeśli potrzebne)

3. **Implementacja API**
   - Implementacja funkcji do integracji z API
   - Utworzenie funkcji obsługujących zapytania

4. **Implementacja hooka useMeetingProposals**
   - Implementacja logiki zarządzania stanem
   - Implementacja funkcji pomocniczych

5. **Implementacja komponentów UI**
   - Implementacja komponentu ProposalCard
   - Implementacja komponentu ProposalDetails
   - Implementacja pozostałych komponentów pomocniczych

6. **Integracja z Astro**
   - Połączenie komponentów React z plikiem strony Astro
   - Implementacja logiki inicjalizacji i przekazywania parametrów

7. **Implementacja nawigacji**
   - Implementacja przekierowań po akceptacji propozycji
   - Implementacja obsługi anulowania i powrotu do dashboardu

8. **Stylizacja komponentów**
   - Implementacja stylów z wykorzystaniem Tailwind
   - Wykorzystanie komponentów Shadcn/ui dla spójności

9. **Testowanie interakcji**
   - Testowanie wszystkich ścieżek użytkownika
   - Testowanie obsługi błędów i przypadków brzegowych

10. **Optymalizacja wydajności**
    - Optymalizacja renderowania komponentów
    - Implementacja memoizacji dla kosztownych obliczeń 