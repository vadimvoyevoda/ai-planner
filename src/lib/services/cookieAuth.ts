import type { AstroCookies } from "astro";
import { DEFAULT_USER } from "./defaultAuth";

/**
 * Nazwa ciasteczka do śledzenia, czy używamy domyślnego użytkownika
 */
export const DEFAULT_USER_COOKIE = "using_default_user";

/**
 * Ustawia ciasteczko informujące, że używamy domyślnego użytkownika
 */
export const setDefaultUserCookie = (cookies: AstroCookies) => {
  try {
    cookies.set(DEFAULT_USER_COOKIE, "true", {
      path: "/",
      maxAge: 60 * 60 * 24, // 24 godziny
      httpOnly: false,
      secure: import.meta.env.PROD, // tylko w produkcji
      sameSite: "lax",
    });
    console.log("[CookieAuth] Ustawiono ciasteczko domyślnego użytkownika");
    return true;
  } catch (error) {
    console.error("[CookieAuth] Błąd podczas ustawiania ciasteczka:", error);
    return false;
  }
};

/**
 * Sprawdza, czy mamy ciasteczko domyślnego użytkownika
 */
export const hasDefaultUserCookie = (cookies: AstroCookies): boolean => {
  const cookie = cookies.get(DEFAULT_USER_COOKIE);
  return cookie?.value === "true";
};

/**
 * Usuwa ciasteczko domyślnego użytkownika
 */
export const clearDefaultUserCookie = (cookies: AstroCookies) => {
  try {
    cookies.delete(DEFAULT_USER_COOKIE, { path: "/" });
    console.log("[CookieAuth] Usunięto ciasteczko domyślnego użytkownika");
    return true;
  } catch (error) {
    console.error("[CookieAuth] Błąd podczas usuwania ciasteczka:", error);
    return false;
  }
}; 