# Feature Flag System

## Konfiguracja zmiennych środowiskowych

Aby skonfigurować system feature flag, dodaj następujące zmienne środowiskowe do pliku `.env`:

```env
# Environment for feature flags (local, integration, prod)
ENV_NAME=local

# Feature flags overrides (optional)
# Uncomment to override default values
# FF_AUTH=true
# FF_COLLECTIONS=true
```

## Dostępne środowiska

- `local` - środowisko lokalne (domyślnie wszystkie flagi włączone)
- `integration` - środowisko testowe (domyślnie wszystkie flagi włączone)
- `prod` - środowisko produkcyjne (domyślnie wszystkie flagi wyłączone)

## Dostępne flagi funkcjonalności

- `auth` - kontroluje dostęp do funkcji uwierzytelniania
- `collections` - kontroluje dostęp do funkcji kolekcji/propozycji

## Używanie flag w kodzie

### W komponentach Astro (SSR)

```astro
---
import { isFeatureEnabled } from "@/features/featureFlags";

const authEnabled = isFeatureEnabled("auth");

// Gdy funkcjonalność jest wyłączona, przekieruj na stronę główną
if (!authEnabled) {
  return Astro.redirect("/");
}
---
```

### W komponentach React (CSR)

```tsx
import { useEffect, useState } from "react";
import { isFeatureEnabled } from "@/features/featureFlags";

function MyComponent() {
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    setIsEnabled(isFeatureEnabled("featureName"));
  }, []);

  if (!isEnabled) {
    return null; // lub komponent zastępczy
  }

  return (
    // Twój komponent
  );
}
```

### W API endpoints

```typescript
import { isFeatureEnabled } from "@/features/featureFlags";

export const GET: APIRoute = async ({ request }) => {
  const featureEnabled = isFeatureEnabled("featureName");

  if (!featureEnabled) {
    return new Response(
      JSON.stringify({
        error: "Funkcja tymczasowo niedostępna",
      }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // Obsługa zapytania
};
``` 