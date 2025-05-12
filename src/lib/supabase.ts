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

export const createServerSupabase = (cookies: AstroCookies) => {
  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get(key: string) {
        return cookies.get(key)?.value;
      },
      set(key: string, value: string, options) {
        cookies.set(key, value, {
          ...options,
          httpOnly: true,
          secure: import.meta.env.PROD,
          sameSite: "lax",
          path: "/",
        });
      },
      remove(key: string) {
        cookies.delete(key, { path: "/" });
      },
    },
  });
};

export { AUTH_TOKEN_COOKIE };
