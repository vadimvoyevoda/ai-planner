import { z } from "zod";

// Typy dla flag funkcjonalności
export type FeatureFlagName = "auth" | "collections" | "dev_tools";
export type Environment = "local" | "integration" | "prod";

// Schemat dla walidacji flag
const featureFlagSchema = z.record(z.string(), z.boolean());
const environmentConfigSchema = z.record(z.enum(["local", "integration", "prod"]), featureFlagSchema);

// Domyślna konfiguracja flag dla różnych środowisk
const defaultFlags: Record<Environment, Record<FeatureFlagName, boolean>> = {
  local: {
    auth: true,
    collections: true,
    dev_tools: true,
  },
  integration: {
    auth: true,
    collections: true,
    dev_tools: false,
  },
  prod: {
    auth: true,
    collections: true,
    dev_tools: false,
  },
};

// Dynamiczna konfiguracja flag
const dynamicFlags: Record<Environment, Record<string, boolean>> = {
  local: {},
  integration: {},
  prod: {},
};

// Logi
const logLevels = {
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
} as const;

type LogLevel = typeof logLevels[keyof typeof logLevels];

// Zoptymalizowana funkcja logowania - tylko błędy w trybie produkcyjnym
const logFeatureFlag = (
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>
) => {
  // W produkcji logujemy tylko błędy
  const isProd = import.meta.env.PUBLIC_ENV_NAME === "prod";
  if (isProd && level !== logLevels.ERROR) {
    return;
  }

  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    context: "FeatureFlags",
    message,
    ...meta,
  };
  
  if (level === logLevels.ERROR) {
    console.error(JSON.stringify(logData));
  } else if (level === logLevels.WARN) {
    console.warn(JSON.stringify(logData));
  } else {
    console.log(JSON.stringify(logData));
  }
};

// Cache dla bieżącego środowiska
let currentEnvironmentCache: Environment | null = null;

/**
 * Pobiera bieżące środowisko z zmiennych środowiskowych
 */
export const getCurrentEnvironment = (): Environment => {
  if (currentEnvironmentCache) {
    return currentEnvironmentCache;
  }

  // Sprawdź najpierw zmienną środowiskową
  const envName = import.meta.env.PUBLIC_ENV_NAME || "";
  
  if (envName === "local" || envName === "integration" || envName === "prod") {
    currentEnvironmentCache = envName;
    return envName;
  }
  
  // Jeśli nie ma zmiennej środowiskowej, spróbuj wykryć na podstawie URL
  try {
    const url = new URL(window.location.href);
    
    // Sprawdź domenę - jeśli zawiera .pages.dev, jest to prawdopodobnie środowisko produkcyjne
    if (url.hostname.includes('.pages.dev') || 
        url.hostname.includes('.vercel.app') || 
        !url.hostname.includes('localhost')) {
      console.log("Wykryto środowisko produkcyjne na podstawie URL:", url.hostname);
      currentEnvironmentCache = "prod";
      return "prod";
    }
  } catch (e) {
    console.warn("Nie udało się wykryć środowiska na podstawie URL:", e);
  }
  
  // Domyślnie zwróć local
  console.log("Używam domyślnego środowiska 'local'");
  currentEnvironmentCache = "local";
  return "local";
};

// Cache dla flag z env
const envFlagCache: Record<string, boolean | undefined> = {};

/**
 * Pobiera wartość flagi z zmiennych środowiskowych
 */
const getEnvFlag = (flagName: string): boolean | undefined => {
  // Sprawdź cache
  if (envFlagCache[flagName] !== undefined) {
    return envFlagCache[flagName];
  }

  const envVarName = `FF_${flagName.toUpperCase()}`;
  const envValue = import.meta.env[envVarName];
  
  if (envValue === undefined) {
    envFlagCache[flagName] = undefined;
    return undefined;
  }
  
  // Konwersja stringa na boolean
  if (envValue === "true" || envValue === "1" || envValue === "yes") {
    envFlagCache[flagName] = true;
    return true;
  }
  
  if (envValue === "false" || envValue === "0" || envValue === "no") {
    envFlagCache[flagName] = false;
    return false;
  }
  
  envFlagCache[flagName] = undefined;
  return undefined;
};

// Cache dla flag funkcjonalności
const featureFlagCache: Record<string, boolean> = {};

/**
 * Sprawdza, czy dana funkcjonalność jest włączona
 */
export const isFeatureEnabled = (featureName: string, environment?: Environment): boolean => {
  const env = environment || getCurrentEnvironment();
  const cacheKey = `${env}:${featureName}`;
  
  // Sprawdź cache
  if (featureFlagCache[cacheKey] !== undefined) {
    return featureFlagCache[cacheKey];
  }
  
  try {
    // Najpierw sprawdź zmienne środowiskowe
    const envValue = getEnvFlag(featureName);
    if (envValue !== undefined) {
      featureFlagCache[cacheKey] = envValue;
      return envValue;
    }
    
    // Następnie sprawdź flagi dynamiczne
    const dynamicValue = dynamicFlags[env]?.[featureName];
    if (dynamicValue !== undefined) {
      featureFlagCache[cacheKey] = dynamicValue;
      return dynamicValue;
    }
    
    // Na końcu sprawdź domyślne flagi
    const defaultValue = defaultFlags[env]?.[featureName as FeatureFlagName];
    if (defaultValue !== undefined) {
      featureFlagCache[cacheKey] = defaultValue;
      return defaultValue;
    }
    
    // Jeśli flaga nie jest zdefiniowana, zwróć false
    featureFlagCache[cacheKey] = false;
    return false;
  } catch (error) {
    logFeatureFlag(
      logLevels.ERROR,
      `Błąd podczas sprawdzania flagi ${featureName}`,
      { environment: env, error: String(error) }
    );
    return false;
  }
};

/**
 * Aktualizuje konfigurację flag dla danego środowiska
 */
export const updateFeatureFlags = async (
  environment: Environment,
  flags: Record<string, boolean>
): Promise<void> => {
  try {
    // Walidacja danych wejściowych
    const validatedFlags = featureFlagSchema.parse(flags);
    
    // Aktualizacja flag
    dynamicFlags[environment] = {
      ...dynamicFlags[environment],
      ...validatedFlags,
    };
    
    // Wyczyść cache dla tego środowiska
    Object.keys(featureFlagCache).forEach(key => {
      if (key.startsWith(`${environment}:`)) {
        delete featureFlagCache[key];
      }
    });
    
    logFeatureFlag(
      logLevels.INFO,
      `Zaktualizowano flagi dla środowiska ${environment}`,
      { updatedFlags: validatedFlags }
    );
  } catch (error) {
    logFeatureFlag(
      logLevels.ERROR,
      `Błąd podczas aktualizacji flag dla środowiska ${environment}`,
      { error: String(error) }
    );
    throw new Error(`Nie można zaktualizować flag: ${error}`);
  }
};

/**
 * Pobiera flagi z zewnętrznego źródła (API, baza danych itp.)
 * Ta funkcja powinna być zaimplementowana zgodnie z konkretnym źródłem danych
 */
export const fetchFeatureFlags = async (environment: Environment): Promise<void> => {
  try {
    // Tutaj można dodać kod do pobierania flag z API lub bazy danych
    // Na przykład:
    // const response = await fetch('/api/feature-flags');
    // const data = await response.json();
    // updateFeatureFlags(environment, data);
    
    // Przykładowa implementacja (do zastąpienia rzeczywistym kodem)
    setTimeout(() => {
      const mockData = {
        auth: Math.random() > 0.5,
        collections: true,
      };
      
      updateFeatureFlags(environment, mockData)
        .catch((error) => {
          logFeatureFlag(
            logLevels.ERROR,
            `Błąd podczas aktualizacji pobranych flag`,
            { error: String(error) }
          );
        });
    }, 200);
  } catch (error) {
    logFeatureFlag(
      logLevels.ERROR,
      `Błąd podczas pobierania flag dla środowiska ${environment}`,
      { error: String(error) }
    );
  }
};

/**
 * Resetuje konfigurację flag dla danego środowiska do wartości domyślnych
 */
export const resetFeatureFlags = (environment: Environment): void => {
  // Reset do wartości domyślnych
  dynamicFlags[environment] = {};
  
  // Wyczyść cache dla tego środowiska
  Object.keys(featureFlagCache).forEach(key => {
    if (key.startsWith(`${environment}:`)) {
      delete featureFlagCache[key];
    }
  });
  
  logFeatureFlag(
    logLevels.INFO,
    `Zresetowano flagi dla środowiska ${environment} do wartości domyślnych`
  );
};

/**
 * Pobiera wszystkie aktywne flagi dla danego środowiska
 */
export const getAllFeatureFlags = (environment: Environment): Record<string, boolean> => {
  const flags: Record<string, boolean> = {};
  
  // Dodaj domyślne flagi
  Object.entries(defaultFlags[environment] || {}).forEach(([key, value]) => {
    flags[key] = value;
  });
  
  // Nadpisz dynamicznymi flagami
  Object.entries(dynamicFlags[environment] || {}).forEach(([key, value]) => {
    flags[key] = value;
  });
  
  // Nadpisz flagami z zmiennych środowiskowych
  Object.keys(flags).forEach((key) => {
    const envValue = getEnvFlag(key);
    if (envValue !== undefined) {
      flags[key] = envValue;
    }
  });
  
  return flags;
}; 