import { getCurrentEnvironment, fetchFeatureFlags } from "./featureFlags";
import { fetchFeatureFlagsFromApi } from "./featureFlagsApi";

/**
 * Inicjalizacja systemu feature flag
 * Ten plik powinien być importowany w głównym pliku aplikacji (np. layout.astro)
 */
export const initializeFeatureFlags = async () => {
  try {
    const currentEnv = getCurrentEnvironment();
    console.log(`Inicjalizacja flag funkcjonalności dla środowiska: ${currentEnv}`);
    
    // Próba pobrania flag z API
    try {
      await fetchFeatureFlagsFromApi(currentEnv);
      console.log("Pomyślnie załadowano flagi z API");
    } catch (error) {
      console.warn("Nie udało się pobrać flag z API, używam domyślnych wartości", error);
      // Kontynuujemy z domyślnymi flagami
    }
    
    return true;
  } catch (error) {
    console.error("Błąd podczas inicjalizacji systemu feature flag:", error);
    return false;
  }
}; 