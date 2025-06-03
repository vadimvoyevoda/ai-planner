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

const logFeatureFlag = (
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>
) => {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    context: "FeatureFlags",
    message,
    ...meta,
  };
  
  // W środowisku produkcyjnym można zintegrować z rzeczywistym systemem logowania
  if (level === logLevels.ERROR) {
    console.error(JSON.stringify(logData));
  } else if (level === logLevels.WARN) {
    console.warn(JSON.stringify(logData));
  } else {
    console.log(JSON.stringify(logData));
  }
};

/**
 * Pobiera bieżące środowisko z zmiennych środowiskowych
 */
export const getCurrentEnvironment = (): Environment => {
  const envName = import.meta.env.ENV_NAME || "local";
  
  if (envName === "local" || envName === "integration" || envName === "prod") {
    return envName;
  }
  
  logFeatureFlag(
    logLevels.WARN,
    `Nieznane środowisko: ${envName}, używam domyślnego (local)`,
    { providedEnv: envName }
  );
  return "local";
};

/**
 * Pobiera wartość flagi z zmiennych środowiskowych
 */
const getEnvFlag = (flagName: string): boolean | undefined => {
  const envVarName = `FF_${flagName.toUpperCase()}`;
  const envValue = import.meta.env[envVarName];
  
  if (envValue === undefined) {
    return undefined;
  }
  
  // Konwersja stringa na boolean
  if (envValue === "true" || envValue === "1" || envValue === "yes") {
    return true;
  }
  
  if (envValue === "false" || envValue === "0" || envValue === "no") {
    return false;
  }
  
  logFeatureFlag(
    logLevels.WARN,
    `Nieprawidłowa wartość zmiennej środowiskowej ${envVarName}: ${envValue}`,
    { envValue }
  );
  
  return undefined;
};

/**
 * Sprawdza, czy dana funkcjonalność jest włączona
 */
export const isFeatureEnabled = (featureName: string, environment?: Environment): boolean => {
  const env = environment || getCurrentEnvironment();
  
  try {
    // Najpierw sprawdź zmienne środowiskowe
    const envValue = getEnvFlag(featureName);
    if (envValue !== undefined) {
      logFeatureFlag(
        logLevels.INFO,
        `Odczytano flagę ze zmiennej środowiskowej ${featureName}`,
        { environment: env, value: envValue }
      );
      return envValue;
    }
    
    // Następnie sprawdź flagi dynamiczne
    const dynamicValue = dynamicFlags[env]?.[featureName];
    if (dynamicValue !== undefined) {
      logFeatureFlag(
        logLevels.INFO,
        `Odczytano dynamiczną flagę ${featureName}`,
        { environment: env, value: dynamicValue }
      );
      return dynamicValue;
    }
    
    // Na końcu sprawdź domyślne flagi
    const defaultValue = defaultFlags[env]?.[featureName as FeatureFlagName];
    if (defaultValue !== undefined) {
      logFeatureFlag(
        logLevels.INFO,
        `Odczytano domyślną flagę ${featureName}`,
        { environment: env, value: defaultValue }
      );
      return defaultValue;
    }
    
    // Jeśli flaga nie jest zdefiniowana, zwróć false
    logFeatureFlag(
      logLevels.WARN,
      `Flaga ${featureName} nie jest zdefiniowana dla środowiska ${env}, zwracam false`,
      { environment: env }
    );
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
    
    logFeatureFlag(
      logLevels.INFO,
      `Rozpoczęto pobieranie flag dla środowiska ${environment}`,
      { environment }
    );
    
    // Przykładowa implementacja (do zastąpienia rzeczywistym kodem)
    setTimeout(() => {
      const mockData = {
        auth: Math.random() > 0.5,
        collections: Math.random() > 0.5,
      };
      
      updateFeatureFlags(environment, mockData)
        .then(() => {
          logFeatureFlag(
            logLevels.INFO,
            `Pomyślnie pobrano flagi dla środowiska ${environment}`,
            { flags: mockData }
          );
        })
        .catch((error) => {
          logFeatureFlag(
            logLevels.ERROR,
            `Błąd podczas aktualizacji pobranych flag`,
            { error: String(error) }
          );
        });
    }, 1000);
  } catch (error) {
    logFeatureFlag(
      logLevels.ERROR,
      `Błąd podczas pobierania flag dla środowiska ${environment}`,
      { error: String(error) }
    );
  }
};

/**
 * Resetuje dynamiczne flagi do wartości domyślnych
 */
export const resetFeatureFlags = (environment: Environment): void => {
  dynamicFlags[environment] = {};
  
  logFeatureFlag(
    logLevels.INFO,
    `Zresetowano flagi dla środowiska ${environment}`,
    { environment }
  );
};

/**
 * Pobiera listę wszystkich dostępnych flag
 */
export const getAllFeatureFlags = (environment: Environment): Record<string, boolean> => {
  const env = environment || getCurrentEnvironment();
  
  // Połącz domyślne i dynamiczne flagi
  const allFlags = {
    ...defaultFlags[env],
    ...dynamicFlags[env],
  };
  
  logFeatureFlag(
    logLevels.INFO,
    `Pobrano wszystkie flagi dla środowiska ${env}`,
    { flagCount: Object.keys(allFlags).length }
  );
  
  return allFlags;
}; 