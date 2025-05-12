import type { APIRoute } from "astro";
import { createServerSupabase } from "@/lib/supabase";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const data = await request.json();
    const { email, password } = registerSchema.parse(data);

    const supabase = createServerSupabase(cookies);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/auth/login`,
      },
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ message: "Sprawdź swoją skrzynkę email aby potwierdzić rejestrację" }), {
      status: 200,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: "Nieprawidłowe dane rejestracji" }), { status: 400 });
    }

    return new Response(JSON.stringify({ error: "Wystąpił błąd podczas rejestracji" }), { status: 500 });
  }
};
