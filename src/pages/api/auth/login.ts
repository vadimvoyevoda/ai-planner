import type { APIRoute } from "astro";
import { createServerSupabase } from "@/lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const data = await request.json();

    const supabase = createServerSupabase(cookies);
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
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

    return new Response(
      JSON.stringify({
        success: true,
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
