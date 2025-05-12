import type { APIRoute } from "astro";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase";
import { transformSupabaseMeeting } from "@/types";
import { generateMeetingSuggestions } from "@/lib/services/ai";

export const prerender = false;

const bodySchema = z.object({
  note: z.string().min(10).max(500),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createServerSupabase(cookies);

    // Validate session
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError || !session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const { note } = bodySchema.parse(body);

    // Generate meeting suggestions using AI
    const suggestions = await generateMeetingSuggestions(note);

    // Save suggested meetings to database
    const meetings = await Promise.all(
      suggestions.map(async (suggestion) => {
        const { data: meeting, error: insertError } = await supabase
          .from("meetings")
          .insert({
            ...suggestion,
            user_id: session.user.id,
            ai_generated: true,
            ai_generated_notes: note,
            created_at: new Date().toISOString(),
          })
          .select("*, meeting_categories(id, name, suggested_attire)")
          .single();

        if (insertError) throw insertError;
        return transformSupabaseMeeting(meeting);
      })
    );

    return new Response(
      JSON.stringify({
        meetings,
        pagination: {
          total: meetings.length,
          page: 1,
          limit: meetings.length,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating meeting suggestions:", error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          details: error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
