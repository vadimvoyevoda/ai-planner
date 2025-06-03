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
  "/auth/verify",
  "/auth/callback",
  // Static assets
  "/favicon.ico",
  "/assets",
  "/images",
];

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, cookies, redirect } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Create the Supabase client for this request
  const supabase = createServerSupabase(cookies);
  
  // Initialize locals with the client
  context.locals = { 
    supabase
  };

  // Skip auth check for public paths and static assets
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    console.log("[Middleware] Skipping auth check for public path:", pathname);
    return next();
  }

  // Check if auth feature is enabled - SKIP AUTH CHECK IF DISABLED
  const authEnabled = isFeatureEnabled("auth");
  if (!authEnabled) {
    console.log("[Middleware] Auth feature is disabled, skipping auth check");
    return next();
  }

  // Check for session cookie
  const authToken = cookies.get(AUTH_TOKEN_COOKIE);

  console.log("[Middleware] Checking auth for path:", pathname);
  console.log("[Middleware] Auth token present:", !!authToken);

  // Pobieramy sesję
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  console.log("[Middleware] Session check result:", {
    hasSession: !!session,
    error: error?.message,
    user: session?.user?.email,
  });

  if (!session) {
    console.log("[Middleware] No valid session found, redirecting to login");
    if (authToken) {
      cookies.delete(AUTH_TOKEN_COOKIE, { path: "/" });
    }
    return redirect("/auth/login");
  }

  // Add user data to locals for use in routes
  context.locals.user = session.user;
  context.locals.session = session;

  // Using optional chaining to safely access user.email
  console.log("[Middleware] Valid session found for user:", session.user?.email || "unknown email");
  return next();
});
