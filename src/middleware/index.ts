import { defineMiddleware } from "astro:middleware";
import { createServerSupabase } from "@/lib/supabase";
import { AUTH_TOKEN_COOKIE } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";
import { isFeatureEnabled } from "@/features/featureFlags";

// Define the expected structure for context.locals
// NOTE: Already defined in env.d.ts, but duplicated here for clarity
// declare global {
//   namespace App {
//     interface Locals {
//       supabase: SupabaseClient<Database>;
//       user?: User;
//       session?: Session;
//     }
//   }
// }

const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
  "/api/auth/logout",
  "/api/feature-flags",
  "/auth/verify",
  "/auth/callback",
  // Static assets
  "/favicon.ico",
  "/assets",
  "/images",
];

export const onRequest = defineMiddleware(async (context, next) => {
  try {
    const { request, cookies, redirect } = context;
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Skip auth check for public paths and static assets
    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
      return next();
    }

    // Check if auth feature is enabled - SKIP AUTH CHECK IF DISABLED
    try {
      const authEnabled = isFeatureEnabled("auth");
      if (!authEnabled) {
        return next();
      }
    } catch (error) {
      console.error("Error checking auth feature flag:", error);
      // Default to allowing access if we can't check the feature flag
      return next();
    }

    try {
      // Create the Supabase client for this request
      const supabase = createServerSupabase(cookies);
      
      // Initialize locals with the client
      context.locals = {
        ...context.locals,
        supabase
      };

      // Check for session cookie
      const authToken = cookies.get?.(AUTH_TOKEN_COOKIE);

      // Get session (with error handling)
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!session) {
          if (authToken && typeof cookies.delete === 'function') {
            cookies.delete(AUTH_TOKEN_COOKIE, { path: "/" });
          }
          return redirect("/auth/login");
        }

        // Add user data to locals for use in routes
        context.locals.user = session.user;
        context.locals.session = session;
      } catch (sessionError) {
        console.error("Error getting session:", sessionError);
        // If we can't get the session, redirect to login
        return redirect("/auth/login");
      }
    } catch (error) {
      console.error("Error in middleware:", error);
      // If there's an error in the middleware, allow the request to continue
      // This prevents breaking the site if there's an authentication issue
      return next();
    }

    return next();
  } catch (error) {
    console.error("Unhandled error in middleware:", error);
    // Always continue in case of errors to prevent breaking the site
    return next();
  }
});
