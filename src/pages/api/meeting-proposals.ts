import { z } from "zod";
import { meeting_proposals_schema } from "../../lib/validations/meeting-proposals.validation";
import { generate_proposals } from "../../lib/services/meeting-proposals.service";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parsowanie i walidacja danych
    const body = await request.json();
    const validated_data = meeting_proposals_schema.parse(body);

    // Generowanie propozycji - używamy DEFAULT_USER_ID zamiast autoryzacji
    const proposals = await generate_proposals(DEFAULT_USER_ID, validated_data);

    // Aktualizacja statystyk
    await update_proposal_stats(DEFAULT_USER_ID);

    return new Response(JSON.stringify(proposals), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          message: "Nieprawidłowe dane wejściowe",
          errors: (error as z.ZodError).format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // eslint-disable-next-line no-console
    console.error("Error generating meeting proposals:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

async function update_proposal_stats(user_id: string) {
  try {
    const { supabaseClient } = await import("../../db/supabase.client");

    // Get current date for period calculations
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-01`;

    // Check if entry exists for current month
    const { data, error } = await supabaseClient
      .from("proposal_stats")
      .select("*")
      .eq("user_id", user_id)
      .eq("period_type", "month")
      .eq("period_start_date", currentMonth)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned" error
      // eslint-disable-next-line no-console
      console.error("Error checking proposal stats:", error);
      return;
    }

    if (data) {
      // Update existing record
      await supabaseClient
        .from("proposal_stats")
        .update({
          total_generations: data.total_generations + 1,
          last_updated: new Date().toISOString(),
        })
        .eq("id", data.id);
    } else {
      // Create new record
      await supabaseClient.from("proposal_stats").insert({
        user_id,
        period_type: "month",
        period_start_date: currentMonth,
        total_generations: 1,
        accepted_proposals: 0,
        last_updated: new Date().toISOString(),
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error updating proposal stats:", error);
    // Non-critical functionality, so we don't throw an error that would affect the main response
  }
}
