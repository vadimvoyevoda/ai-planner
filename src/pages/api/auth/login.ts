import type { APIRoute } from "astro";
import { createServerSupabase } from "@/lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const data = await request.json();
    
    // Diagnostyczne logi
    console.log("Login attempt:", { 
      email: data.email ? data.email.substring(0, 3) + "***" : "undefined", 
      passwordProvided: !!data.password,
      cookies: cookies ? "available" : "unavailable",
      url: process.env.PUBLIC_SUPABASE_URL ? process.env.PUBLIC_SUPABASE_URL.substring(0, 10) + "***" : "undefined",
      key: process.env.PUBLIC_SUPABASE_KEY ? "available" : "undefined"
    });

    const supabase = createServerSupabase(cookies);
    
    // Wywołanie autentykacji
    console.log("Calling Supabase auth...");
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    console.log("Supabase auth response:", { 
      success: !!authData?.session, 
      error: error ? { message: error.message, status: error.status } : null,
      sessionExpires: authData?.session?.expires_at ? new Date(authData.session.expires_at * 1000).toISOString() : null
    });

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
          status: error.status,
          name: error.name,
        }),
        {
          status: error.status || 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Wyraźnie określ URL przekierowania
    const redirectUrl = "/";
    console.log("Login successful, redirecting to:", redirectUrl);

    return new Response(
      JSON.stringify({
        success: true,
        redirect: redirectUrl,
        session: {
          access_token: authData.session?.access_token,
          expires_at: authData.session?.expires_at,
          user: {
            email: authData.session?.user.email,
            id: authData.session?.user.id,
          },
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Login error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Unexpected error during login",
        details: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
