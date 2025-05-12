import type { APIRoute } from "astro";
import { createServerSupabase } from "@/lib/supabase";

export const prerender = false;

export const DELETE: APIRoute = async ({ params, cookies }) => {
  try {
    const supabase = createServerSupabase(cookies);
    const { id } = params;

    // Check if user is authenticated
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

    if (!id) {
      return new Response(JSON.stringify({ error: "Meeting ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if meeting exists and belongs to user
    const { data: meeting, error: meetingError } = await supabase
      .from("meetings")
      .select("id")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .is("deleted_at", null)
      .single();

    if (meetingError || !meeting) {
      return new Response(JSON.stringify({ error: "Meeting not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Soft delete the meeting
    const { error: deleteError } = await supabase
      .from("meetings")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (deleteError) {
      throw deleteError;
    }

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
