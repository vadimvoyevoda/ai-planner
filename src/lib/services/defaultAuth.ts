import { createServerSupabase } from "@/lib/supabase";
import type { AstroCookies } from "astro";
import { hasDefaultUserCookie, setDefaultUserCookie, clearDefaultUserCookie } from "./cookieAuth";

/**
 * Dane domyślnego użytkownika - używane gdy flaga auth jest wyłączona
 */
export const DEFAULT_USER = {
  id: "default-user-id",
  email: "default@example.com",
  name: "Użytkownik Domyślny",
  role: "user",
};

/**
 * Tworzy sesję z domyślnym użytkownikiem, gdy flaga auth jest wyłączona
 * Ta funkcja nie wykonuje rzeczywistego logowania, tylko symuluje sesję
 */
export const getDefaultSession = () => {
  return {
    user: {
      ...DEFAULT_USER,
      aud: "authenticated",
      created_at: new Date().toISOString(),
    },
    access_token: "default-access-token",
    refresh_token: "default-refresh-token",
    expires_at: Date.now() + 3600 * 1000,
  };
};

/**
 * Sprawdza czy istnieje sesja, a jeśli nie, i flaga auth jest wyłączona,
 * zwraca domyślną sesję z domyślnym użytkownikiem
 */
export const getSessionOrDefault = async (cookies: AstroCookies, authEnabled: boolean) => {
  // Jeśli auth jest wyłączone, zawsze używamy domyślnego użytkownika
  if (!authEnabled) {
    console.log("[DefaultAuth] Auth wyłączone, używam domyślnego użytkownika:", DEFAULT_USER.email);
    // Ustaw ciasteczko informujące, że używamy domyślnego użytkownika
    setDefaultUserCookie(cookies);
    return { session: getDefaultSession(), isDefaultUser: true, error: null };
  }
  
  // Sprawdź rzeczywistą sesję tylko jeśli auth jest włączone
  const supabase = createServerSupabase(cookies);
  const { data, error } = await supabase.auth.getSession();
  
  console.log("[DefaultAuth] getSessionOrDefault:", {
    authEnabled,
    hasSession: !!data.session,
    error: error?.message,
    path: typeof window !== 'undefined' ? window.location.pathname : 'server-side',
  });
  
  // Jeśli jest sesja, używamy jej
  if (data.session && !error) {
    console.log("[DefaultAuth] Używam istniejącej sesji użytkownika:", data.session.user.email);
    return { session: data.session, isDefaultUser: false, error };
  }
  
  // W przeciwnym wypadku zwracamy null (brak sesji)
  console.log("[DefaultAuth] Brak sesji, auth włączone, wymagane logowanie");
  return { session: null, isDefaultUser: false, error };
}; 