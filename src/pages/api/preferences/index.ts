import type { APIRoute } from "astro";
import { createServerSupabase } from "@/lib/supabase";
import { z } from "zod";
import type { MeetingPreferencesEntity } from "@/types";

const preferencesSchema = z.object({
  preferred_distribution: z.enum(["rozłożone", "skondensowane"]),
  preferred_times_of_day: z.array(z.enum(["rano", "dzień", "wieczór"])),
  min_break_minutes: z.number().nullable(),
  unavailable_weekdays: z.array(z.number().min(0).max(6)),
});

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const supabase = createServerSupabase(cookies);

    // Sprawdź czy użytkownik jest zalogowany
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Pobierz preferencje użytkownika
    const { data: preferences, error } = await supabase
      .from("meeting_preferences")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching preferences:", error);
      return new Response(JSON.stringify({ message: "Błąd podczas pobierania preferencji" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(preferences || null), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ message: "Wystąpił nieoczekiwany błąd" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createServerSupabase(cookies);

    // Sprawdź czy użytkownik jest zalogowany
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();

    // Walidacja danych wejściowych
    const validatedData = preferencesSchema.parse(body);

    // Sprawdź czy preferencje już istnieją
    const { data: existingPreferences, error: checkError } = await supabase
      .from("meeting_preferences")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking preferences:", checkError);
      return new Response(JSON.stringify({ message: "Błąd podczas sprawdzania preferencji" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    let result;
    if (existingPreferences) {
      // Aktualizuj istniejące preferencje
      const { data, error } = await supabase
        .from("meeting_preferences")
        .update(validatedData)
        .eq("id", existingPreferences.id)
        .select()
        .single();

      result = { data, error };
    } else {
      // Utwórz nowe preferencje
      const { data, error } = await supabase
        .from("meeting_preferences")
        .insert([{ ...validatedData, user_id: session.user.id }])
        .select()
        .single();

      result = { data, error };
    }

    if (result.error) {
      console.error("Error saving preferences:", result.error);
      return new Response(JSON.stringify({ message: "Błąd podczas zapisywania preferencji" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ message: "Nieprawidłowe dane", errors: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ message: "Wystąpił nieoczekiwany błąd" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
