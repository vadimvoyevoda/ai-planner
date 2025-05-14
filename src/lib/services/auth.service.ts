/**
 * Serwis autoryzacji obsługujący wszystkie zapytania związane z autentykacją
 */

export const authService = {
  /**
   * Logowanie użytkownika
   */
  async login(email: string, password: string) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Nieprawidłowy email lub hasło");
      } else if (response.status === 400) {
        throw new Error(data.error || "Nieprawidłowe dane logowania");
      } else if (response.status === 429) {
        throw new Error("Zbyt wiele prób logowania. Spróbuj ponownie później.");
      } 
      throw new Error(data.error || "Wystąpił błąd podczas logowania");
    }
    
    return data;
  },
  
  /**
   * Rejestracja użytkownika
   */
  async register(email: string, password: string) {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 400) {
        throw new Error(data.error || "Nieprawidłowe dane rejestracji");
      } else if (response.status === 429) {
        throw new Error("Zbyt wiele prób rejestracji. Spróbuj ponownie później.");
      }
      throw new Error(data.error || "Wystąpił błąd podczas rejestracji");
    }
    
    return data;
  },
  
  /**
   * Resetowanie hasła
   */
  async resetPassword(email: string) {
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 400) {
        throw new Error(data.error || "Nieprawidłowy format adresu email");
      } else if (response.status === 429) {
        throw new Error("Zbyt wiele prób resetowania hasła. Spróbuj ponownie później.");
      }
      throw new Error(data.error || "Wystąpił błąd podczas resetowania hasła");
    }
    
    return data;
  }
}; 