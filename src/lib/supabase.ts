import { createBrowserClient } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import type { AstroCookies } from "astro";
import type { Database } from "../db/database.types";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_KEY;

// Supabase używa formatu sb-{project-ref}-auth-token
// W tym przypadku project-ref to "127"
const AUTH_TOKEN_COOKIE = "sb-127-auth-token";

export const createClientSupabase = () => {
  if (typeof document === "undefined") {
    throw new Error("createClientSupabase can only be used in the browser");
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
};

export const createServerSupabase = (cookies: AstroCookies | any) => {
  // Check if cookies is valid
  if (!cookies) {
    console.error("No cookies object provided to createServerSupabase");
    // Provide a fallback cookie handler for CloudFlare
    return createServerClient<Database>(supabaseUrl, supabaseKey, {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {}
      }
    });
  }

  // Handle different cookie APIs (standard Astro vs CloudFlare)
  const getCookie = (key: string) => {
    try {
      // Try the standard Astro cookies API
      if (typeof cookies.get === 'function') {
        return cookies.get(key)?.value;
      }
      
      // CloudFlare may provide cookies as a plain object
      if (cookies[key]) {
        return cookies[key];
      }
      
      // If cookies is a Request object, try to extract cookies from headers
      if (cookies.headers && typeof cookies.headers.get === 'function') {
        const cookieHeader = cookies.headers.get('cookie');
        if (cookieHeader) {
          const match = new RegExp(`${key}=([^;]+)`).exec(cookieHeader);
          return match ? match[1] : undefined;
        }
      }
      
      return undefined;
    } catch (error) {
      console.error(`Error getting cookie ${key}:`, error);
      return undefined;
    }
  };

  const setCookie = (key: string, value: string, options?: any) => {
    try {
      if (typeof cookies.set === 'function') {
        cookies.set(key, value, {
          ...options,
          httpOnly: true,
          secure: import.meta.env.PROD,
          sameSite: "lax",
          path: "/",
        });
      } else if (cookies.headers && typeof cookies.headers.set === 'function') {
        // Handle Response object in CloudFlare
        const cookieValue = `${key}=${value}; Path=/; HttpOnly; ${import.meta.env.PROD ? 'Secure; ' : ''}SameSite=Lax`;
        cookies.headers.set('Set-Cookie', cookieValue);
      } else {
        console.warn('Unable to set cookie, no valid cookie API available');
      }
    } catch (error) {
      console.error(`Error setting cookie ${key}:`, error);
    }
  };

  const removeCookie = (key: string) => {
    try {
      if (typeof cookies.delete === 'function') {
        cookies.delete(key, { path: "/" });
      } else if (cookies.headers && typeof cookies.headers.set === 'function') {
        // Expire the cookie for CloudFlare
        const cookieValue = `${key}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        cookies.headers.set('Set-Cookie', cookieValue);
      } else {
        console.warn('Unable to remove cookie, no valid cookie API available');
      }
    } catch (error) {
      console.error(`Error removing cookie ${key}:`, error);
    }
  };

  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get: getCookie,
      set: setCookie,
      remove: removeCookie,
    },
  });
};

export { AUTH_TOKEN_COOKIE };
