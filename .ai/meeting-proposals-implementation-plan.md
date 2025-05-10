# API Endpoint Implementation Plan: POST /api/meeting-proposals

## 1. Przegląd punktu końcowego
Endpoint `/api/meeting-proposals` służy do generowania propozycji spotkań na podstawie notatki użytkownika oraz jego preferencji. System analizuje notatkę, uwzględnia preferencje użytkownika dotyczące dostępności i rozkładu spotkań, a następnie proponuje możliwe terminy wraz z odpowiednimi metadanymi.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Struktura URL:** `/api/meeting-proposals`
- **Parametry:**
  - **Wymagane:**
    - `note` (string): Notatka do analizy
    - `location_name` (string): Nazwa lokalizacji spotkania
  - **Opcjonalne:**
    - `estimated_duration` (number): Szacowany czas trwania w minutach
- **Request Body:**
  ```json
  {
    "note": "Spotkanie z klientem o projekcie XYZ",
    "location_name": "Biuro firmy, sala 202",
    "estimated_duration": 60
  }
  ```

## 3. Wykorzystywane typy
- **Command Model:**
  - `MeetingProposalCommand` - model żądania
- **Response DTO:**
  - `MeetingProposalResponseDto` - model odpowiedzi
  - `MeetingProposalItem` - model pojedynczej propozycji spotkania
- **Dodatkowe typy:**
  - `TimeOfDay` - enum dla pór dnia
  - `MeetingDistribution` - enum dla preferencji rozkładu spotkań
  - `MeetingCategoryEntity` - encja kategorii spotkań
  - `MeetingPreferencesEntity` - encja preferencji spotkań użytkownika

## 4. Szczegóły odpowiedzi
- **Status:** 200 OK
- **Body:**
  ```json
  {
    "proposals": [
      {
        "start_time": "2023-08-15T14:00:00Z",
        "end_time": "2023-08-15T15:00:00Z",
        "title": "Spotkanie z klientem o projekcie XYZ",
        "description": "Omówienie szczegółów współpracy przy projekcie XYZ",
        "category": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "name": "Biznesowe",
          "suggested_attire": "Strój formalny - garnitur/kostium biznesowy"
        },
        "location_name": "Biuro firmy, sala 202",
        "ai_generated_notes": "Proponowane tematy: 1. Omówienie harmonogramu, 2. Budżet projektu, 3. Zasoby",
        "original_note": "Spotkanie z klientem o projekcie XYZ"
      },
      {
        "start_time": "2023-08-16T10:00:00Z",
        "end_time": "2023-08-16T11:00:00Z",
        "title": "Spotkanie z klientem o projekcie XYZ",
        "description": "Omówienie szczegółów współpracy przy projekcie XYZ",
        "category": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "name": "Biznesowe",
          "suggested_attire": "Strój formalny - garnitur/kostium biznesowy"
        },
        "location_name": "Biuro firmy, sala 202",
        "ai_generated_notes": "Proponowane tematy: 1. Omówienie harmonogramu, 2. Budżet projektu, 3. Zasoby",
        "original_note": "Spotkanie z klientem o projekcie XYZ"
      }
    ]
  }
  ```
- **Kody statusu:**
  - 200 OK: Propozycje zostały pomyślnie wygenerowane
  - 400 Bad Request: Nieprawidłowe dane wejściowe
  - 401 Unauthorized: Brak autoryzacji
  - 500 Internal Server Error: Błąd serwera

## 5. Przepływ danych
1. Klient wysyła żądanie POST z notatką, lokalizacją i opcjonalnie szacowanym czasem trwania.
2. System waliduje dane wejściowe.
3. System pobiera preferencje użytkownika z tabeli `meeting_preferences`.
4. System pobiera kategorie spotkań z tabeli `meeting_categories`.
5. System przekazuje notatkę do usługi AI, aby:
   - Analizować treść notatki
   - Zasugerować odpowiednią kategorię spotkania
   - Wygenerować tytuł i opis spotkania
   - Zasugerować dodatkowe notatki
6. System generuje propozycje terminów spotkań, uwzględniając:
   - Preferencje użytkownika dotyczące pór dnia
   - Preferencje rozkładu spotkań (rozłożone/skondensowane)
   - Niedostępne dni tygodnia
   - Minimalne przerwy między spotkaniami
   - Istniejące spotkania użytkownika (aby uniknąć konfliktów)
7. System formatuje i zwraca odpowiedź z propozycjami spotkań.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie:**
  - Endpoint wymaga uwierzytelnienia poprzez Supabase Auth.
  - Użyj middleware Astro do weryfikacji sesji użytkownika.
- **Autoryzacja:**
  - Użytkownik może generować propozycje tylko dla siebie.
- **Walidacja danych:**
  - Użyj Zod do walidacji danych wejściowych.
  - Sanityzuj dane wejściowe, aby zapobiec atakom XSS i injekcjom.
- **Rate limiting:**
  - Zaimplementuj ograniczenia liczby żądań do AI dla każdego użytkownika.
  - Aktualizuj tabelę `proposal_stats` przy każdej generacji propozycji.

## 7. Obsługa błędów
- **400 Bad Request:**
  - Brak wymaganych pól (`note`, `location_name`).
  - Nieprawidłowy format danych (`estimated_duration` nie jest liczbą dodatnią).
  - Pustą notatka lub za krótka do analizy.
- **401 Unauthorized:**
  - Brak tokenu uwierzytelniającego.
  - Wygasły token uwierzytelniający.
- **500 Internal Server Error:**
  - Błąd podczas komunikacji z usługą AI.
  - Błąd bazy danych.
  - Nieoczekiwany wyjątek w logice biznesowej.

## 8. Rozważania dotyczące wydajności
- **Cachowanie:**
  - Cachuj kategorie spotkań, aby zminimalizować zapytania do bazy danych.
- **Optymalizacja zapytań:**
  - Używaj indeksów w bazie danych dla efektywnego wyszukiwania dostępnych terminów.
  - Ogranicz liczbę zwracanych propozycji do maksymalnie 3-ch.
- **Asynchroniczne przetwarzanie:**
  - Implementuj asynchroniczne przetwarzanie żądań AI w celu uniknięcia blokowania.
- **Monitorowanie:**
  - Śledź czasy odpowiedzi i wykorzystanie zasobów AI dla optymalizacji.

## 9. Etapy wdrożenia

### Etap 1: Przygotowanie
1. Utworzenie pliku endpointu w `src/pages/api/meeting-proposals.ts`
2. Utworzenie serwisu AI w `src/lib/services/ai.service.ts` (jeśli nie istnieje)
3. Utworzenie serwisu propozycji spotkań w `src/lib/services/meeting-proposals.service.ts`
4. Zdefiniowanie schematów walidacyjnych Zod w `src/lib/validations/meeting-proposals.validation.ts`

### Etap 2: Implementacja serwisów
1. Implementacja `aiService.analyze_note(note: string)` w serwisie AI:
   ```typescript
   // src/lib/services/ai.service.ts
   export async function analyze_note(note: string): Promise<NoteAnalysisResponseDto> {
     // Komunikacja z zewnętrznym API AI (OpenRouter.ai)
     // Analiza notatki i zwrócenie sugestii
   }
   ```

2. Implementacja `meeting_proposals_service.generate_proposals()` w serwisie propozycji:
   ```typescript
   // src/lib/services/meeting-proposals.service.ts
   export async function generate_proposals(
     user_id: string,
     command: MeetingProposalCommand
   ): Promise<MeetingProposalResponseDto> {
     // Pobranie preferencji użytkownika
     // Analiza notatki przez AI
     // Generowanie propozycji terminów
     // Zwrócenie sformatowanej odpowiedzi
   }
   ```

### Etap 3: Implementacja endpointu
1. Utworzenie endpointu POST w `src/pages/api/meeting-proposals.ts`:
   ```typescript
   // src/pages/api/meeting-proposals.ts
   import { meeting_proposals_schema } from '../../../lib/validations/meeting-proposals.validation';
   import { generate_proposals } from '../../../lib/services/meeting-proposals.service';
   import { z } from 'zod';

   export const prerender = false;

   export async function POST({ request, locals }) {
     try {
       // Weryfikacja uwierzytelnienia
       const session = await locals.getSession();
       if (!session) {
         return new Response(JSON.stringify({ message: 'Unauthorized' }), {
           status: 401,
           headers: { 'Content-Type': 'application/json' }
         });
       }

       // Parsowanie i walidacja danych
       const body = await request.json();
       const validated_data = meeting_proposals_schema.parse(body);

       // Generowanie propozycji
       const proposals = await generate_proposals(session.user.id, validated_data);

       // Aktualizacja statystyk
       await update_proposal_stats(session.user.id);

       return new Response(JSON.stringify(proposals), {
         status: 200,
         headers: { 'Content-Type': 'application/json' }
       });
     } catch (error) {
       if (error instanceof z.ZodError) {
         return new Response(JSON.stringify({ 
           message: 'Nieprawidłowe dane wejściowe',
           errors: error.format() 
         }), {
           status: 400,
           headers: { 'Content-Type': 'application/json' }
         });
       }

       console.error('Error generating meeting proposals:', error);
       return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
         status: 500,
         headers: { 'Content-Type': 'application/json' }
       });
     }
   }

   async function update_proposal_stats(user_id: string) {
     // Aktualizacja statystyk generowania propozycji
   }
   ```

### Etap 4: Implementacja walidacji
1. Utworzenie schematów walidacyjnych Zod:
   ```typescript
   // src/lib/validations/meeting-proposals.validation.ts
   import { z } from 'zod';

   export const meeting_proposals_schema = z.object({
     note: z.string().min(1, 'Notatka jest wymagana'),
     location_name: z.string().min(1, 'Lokalizacja jest wymagana'),
     estimated_duration: z.number().positive().optional(),
   });
   ```

### Etap 6: Dokumentacja
1. Dokumentacja API w formacie OpenAPI/Swagger
2. Dokumentacja wewnętrzna dla zespołu deweloperskiego
3. Przykłady użycia dla klientów API 