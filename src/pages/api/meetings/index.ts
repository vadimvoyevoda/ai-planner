import type { APIRoute } from "astro";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase";
import { transformSupabaseMeeting } from "@/types";

const querySchema = z.object({
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("10"),
  upcoming: z.string().optional(),
});

export const GET: APIRoute = async ({ url, cookies }) => {
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

    // Parse and validate query parameters
    const searchParams = Object.fromEntries(url.searchParams);
    const { page, limit, upcoming } = querySchema.parse(searchParams);

    // Build query
    let query = supabase
      .from("meetings")
      .select("*, meeting_categories(id, name, suggested_attire)")
      .eq("user_id", session.user.id)
      .is("deleted_at", null)
      .order("start_time", { ascending: true });

    // Add upcoming filter if requested
    if (upcoming === "true") {
      const now = new Date().toISOString();
      query = query.gte("start_time", now);
    }

    // Add pagination
    query = query.range((page - 1) * limit, page * limit - 1);

    // Execute the query
    const { data: meetingsData, error: meetingsError } = await query;

    if (meetingsError) {
      throw meetingsError;
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from("meetings")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id)
      .is("deleted_at", null);

    if (countError) {
      throw countError;
    }

    // Transform the data
    const meetings = (meetingsData || []).map(transformSupabaseMeeting);

    return new Response(
      JSON.stringify({
        meetings,
        pagination: {
          page,
          limit,
          total: count || 0,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
