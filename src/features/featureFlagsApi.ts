import { Environment, updateFeatureFlags, logFeatureFlag } from "./featureFlags";

/**
 * Pobiera konfigurację flag z API
 */
export const fetchFeatureFlagsFromApi = async (environment: Environment): Promise<void> => {
  try {
    // Adres API może być różny w zależności od środowiska
    const apiUrl = `/api/feature-flags?env=${environment}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Aktualizacja flag w systemie
    await updateFeatureFlags(environment, data.flags);
    
    return;
  } catch (error) {
    console.error(`Błąd podczas pobierania flag z API: ${error}`);
    throw error;
  }
};

/**
 * Inicjalizuje system flag, pobierając je z API dla bieżącego środowiska
 * Można wywołać tę funkcję przy starcie aplikacji
 */
export const initializeFeatureFlags = async (environment: Environment): Promise<void> => {
  try {
    await fetchFeatureFlagsFromApi(environment);
    console.log(`Pomyślnie zainicjalizowano flagi dla środowiska ${environment}`);
  } catch (error) {
    console.error(`Nie udało się zainicjalizować flag: ${error}`);
    // Kontynuuj z domyślnymi flagami
  }
}; 