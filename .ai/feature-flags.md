# Plan integracji systemu Feature Flag

## Przegląd

Ten dokument przedstawia plan integracji systemu feature flag, który umożliwi rozdzielenie deploymentów od releasów funkcjonalności w aplikacji. System pozwoli na włączanie/wyłączanie funkcji w zależności od środowiska (local, integration, prod) bez konieczności wprowadzania zmian w kodzie.

## Architektura

System feature flag składa się z następujących komponentów:

1. **Moduł core (`src/features/featureFlags.ts`)** - zawiera główną logikę zarządzania flagami
2. **Integracja z API (`src/features/featureFlagsApi.ts`)** - umożliwia dynamiczne pobieranie flag z backendu
3. **Endpoint API (`src/pages/api/feature-flags.ts`)** - dostarcza i aktualizuje flagi
4. **Inicjalizator (`src/features/featureFlags.init.ts`)** - inicjuje system flag przy starcie aplikacji

## Wykonane dotychczas

- ✅ Stworzenie modułu z logiką feature flag w `src/features/featureFlags.ts`
- ✅ Dodanie integracji z API w `src/features/featureFlagsApi.ts`
- ✅ Implementacja endpointu API w `src/pages/api/feature-flags.ts`
- ✅ Aktualizacja typów w `src/env.d.ts` dla zmiennych środowiskowych
- ✅ Dokumentacja użycia w `src/features/README.md`
- ✅ Integracja przykładowa w stronach auth i komponentach ProposalCard/ProposalsPage

## Następne kroki

### 1. Poprawki i uzupełnienia

- [ ] Poprawić komponenty Astro (np. FeatureFlagDemo) zgodnie z poprawną składnią Astro (dodać frontmatter ---)
- [ ] Dodać inicjalizację flag w głównej aplikacji (już zaimplementowane w Layout.astro)
- [ ] Rozszerzyć middleware Astro o obsługę feature flag
- [ ] Dodać panel administracyjny do zarządzania flagami (opcjonalnie)

### 2. Integracja z istniejącymi komponentami

- [ ] Dodać sprawdzanie flag w pozostałych endpointach API
- [ ] Zintegrować z mechanizmem uwierzytelniania
- [ ] Dodać wsparcie dla flag specyficznych dla użytkownika/roli (opcjonalnie)

### 3. Testowanie

- [ ] Dodać testy dla różnych konfiguracji flag
- [ ] Testować zachowanie aplikacji z różnymi wartościami flag
- [ ] Testy integracyjne dla systemu feature flag

### 4. Monitorowanie i analityka

- [ ] Dodać narzędzia do monitorowania statusu flag
- [ ] Implementować pełne logowanie zmian i użycia flag
- [ ] Dodać metryki do śledzenia wpływu włączenia/wyłączenia funkcji

## Dostępne flagi funkcjonalności

| Flaga | Opis | Domyślna wartość (local/integration) | Domyślna wartość (prod) |
|-------|------|-------------------------------------|------------------------|
| auth | Kontroluje dostęp do funkcji uwierzytelniania | true | false |
| collections | Kontroluje dostęp do funkcji kolekcji/propozycji | true | false |

## Zarządzanie flagami

### Poprzez zmienne środowiskowe

Flagi można konfigurować za pomocą zmiennych środowiskowych:

```env
# Environment for feature flags (local, integration, prod)
ENV_NAME=local

# Feature flags overrides
FF_AUTH=true
FF_COLLECTIONS=false
```

### Poprzez API

Flagi można również aktualizować dynamicznie za pomocą API:

```http
POST /api/feature-flags
Content-Type: application/json

{
  "env": "integration",
  "flags": {
    "auth": true,
    "collections": false
  }
}
```

## Wdrożenie i utrzymanie

1. Dodanie nowej flagi wymaga:
   - Zaktualizowania typu `FeatureFlagName` w `src/features/featureFlags.ts`
   - Dodania domyślnych wartości dla wszystkich środowisk
   - Zaktualizowania dokumentacji

2. Usunięcie flagi (po pełnym wdrożeniu funkcji):
   - Usunięcie sprawdzeń flag z kodu
   - Usunięcie flagi z typu `FeatureFlagName`
   - Usunięcie z domyślnej konfiguracji

## Przyszłe rozszerzenia

- Integracja z zewnętrznym systemem zarządzania flagami (np. LaunchDarkly, Split.io)
- Implementacja systemu A/B testowania bazującego na feature flagach
- Dodanie flag dla grup użytkowników/ról
- System automatycznego wyłączania funkcji w przypadku wykrycia problemów 