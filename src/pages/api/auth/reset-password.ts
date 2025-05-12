import type { APIRoute } from "astro";
import { createServerSupabase } from "@/lib/supabase";
import { z } from "zod";

const resetPasswordSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
});

export const prerender = false;

// Funkcja pomocnicza do tworzenia odpowiedzi JSON
const jsonResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    if (request.headers.get("Content-Type") !== "application/json") {
      return jsonResponse({ error: "Content-Type musi być application/json" }, 400);
    }

    const data = await request.json();

    try {
      resetPasswordSchema.parse(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return jsonResponse(
          {
            error: "Nieprawidłowy format adresu email",
            details: err.errors,
          },
          400
        );
      }
    }

    const { email } = data;
    const supabase = createServerSupabase(cookies);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/auth/new-password`,
    });

    if (error) {
      console.error("Password reset error:", error);

      if (error.message.includes("Too many requests")) {
        return jsonResponse(
          {
            error: "Zbyt wiele prób resetowania hasła. Spróbuj ponownie później.",
          },
          429
        );
      }

      return jsonResponse(
        {
          error: "Wystąpił błąd podczas wysyłania linku do resetowania hasła",
        },
        500
      );
    }

    return jsonResponse({
      success: true,
      message: "Link do resetowania hasła został wysłany na podany adres email",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return jsonResponse(
      {
        error: "Wystąpił nieoczekiwany błąd podczas resetowania hasła",
      },
      500
    );
  }
};
