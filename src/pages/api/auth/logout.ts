import type { APIRoute } from "astro";
import { createServerSupabase } from "@/lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ cookies, redirect }) => {
  try {
    const supabase = createServerSupabase(cookies);
    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return redirect("/auth/login");
  } catch (err) {
    return new Response(JSON.stringify({ error: "Wystąpił błąd podczas wylogowywania" }), { status: 500 });
  }
};
