import { defineMiddleware } from "astro:middleware";
import { createServerSupabase } from "@/lib/supabase";
import { AUTH_TOKEN_COOKIE } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AstroWithLocals {
  locals: {
    user?: User;
    session?: any;
  };
}

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
  // Initialize locals if it doesn't exist
  if (!context.locals) {
    context.locals = {};
  }

  const { request, cookies, redirect } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Skip auth check for public paths and static assets
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    console.log("[Middleware] Skipping auth check for public path:", pathname);
    return next();
  }

  // Check for session cookie
  const authToken = cookies.get(AUTH_TOKEN_COOKIE);

  console.log("[Middleware] Checking auth for path:", pathname);
  console.log("[Middleware] Auth token present:", !!authToken);

  // Próbujemy pobrać sesję niezależnie od obecności ciasteczka
  const supabase = createServerSupabase(cookies);
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

  console.log("[Middleware] Valid session found for user:", session.user.email);
  return next();
});
