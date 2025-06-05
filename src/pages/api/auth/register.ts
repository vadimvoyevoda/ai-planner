import type { APIRoute } from "astro";
import { createServerSupabase } from "@/lib/supabase";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const prerender = false;

/**
 * Funkcja wykrywająca publiczny URL na podstawie nagłówków żądania.
 * Szczególnie przydatna gdy aplikacja działa za reverse proxy jak Cloudflare.
 */
function getPublicUrl(request: Request): string {
  // Pobierz protokół (http/https)
  let protocol = "https";
  const forwardedProto = request.headers.get("x-forwarded-proto") || 
                         request.headers.get("X-Forwarded-Proto");
  if (forwardedProto) {
    protocol = forwardedProto.split(",")[0].trim();
  }

  // Pobierz hosta (domenę)
  let host = request.headers.get("host") || 
             request.headers.get("Host") ||
             request.headers.get("x-forwarded-host") || 
             request.headers.get("X-Forwarded-Host");
  
  if (!host) {
    // Jeśli nie znaleziono w nagłówkach, próbujemy wyciągnąć z URL
    try {
      host = new URL(request.url).host;
    } catch (e) {
      // Fallback, choć nie powinien być nigdy potrzebny
      console.error("Nie można określić hosta z request.url:", e);
      host = "localhost:4321"; // domyślny port Astro
    }
  }

  // Cloudflare może dodawać port do nagłówka Host, usuwamy go dla HTTPS
  if (protocol === "https" && host.includes(":")) {
    host = host.split(":")[0];
  }

  return `${protocol}://${host}`;
}

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const data = await request.json();
    const { email, password } = registerSchema.parse(data);

    const supabase = createServerSupabase(cookies);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getPublicUrl(request)}/auth/login`,
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
