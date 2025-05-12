import type { APIRoute } from "astro";
import { createServerSupabase } from "@/lib/supabase";
import { z } from "zod";

const newPasswordSchema = z.object({
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
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
      newPasswordSchema.parse(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return jsonResponse(
          {
            error: "Hasło nie spełnia wymagań",
            details: err.errors,
          },
          400
        );
      }
    }

    const { password } = data;
    const supabase = createServerSupabase(cookies);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error("Update password error:", error);

      if (error.message.includes("Too many requests")) {
        return jsonResponse(
          {
            error: "Zbyt wiele prób zmiany hasła. Spróbuj ponownie później.",
          },
          429
        );
      }

      if (error.message.includes("Auth session missing")) {
        return jsonResponse(
          {
            error: "Link do resetowania hasła wygasł lub jest nieprawidłowy",
          },
          401
        );
      }

      return jsonResponse(
        {
          error: "Wystąpił błąd podczas zmiany hasła",
        },
        500
      );
    }

    return jsonResponse({
      success: true,
      message: "Hasło zostało zmienione. Możesz się teraz zalogować.",
      redirect: "/auth/login",
    });
  } catch (err) {
    console.error("Update password error:", err);
    return jsonResponse(
      {
        error: "Wystąpił nieoczekiwany błąd podczas zmiany hasła",
      },
      500
    );
  }
};
