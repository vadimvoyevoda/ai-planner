import type { APIRoute } from "astro";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase";
import { transformSupabaseMeeting } from "@/types";
import type { MeetingAcceptRequest } from "@/types";

const bodySchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  title: z.string(),
  description: z.string(),
  categoryId: z.string(),
  locationName: z.string(),
  aiGeneratedNotes: z.string(),
  originalNote: z.string(),
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
    const validatedBody = bodySchema.parse(body) as MeetingAcceptRequest;

    // Get category details
    const { data: category, error: categoryError } = await supabase
      .from("meeting_categories")
      .select("*")
      .eq("id", validatedBody.categoryId)
      .single();

    if (categoryError || !category) {
      console.error("Category error:", categoryError);
      return new Response(JSON.stringify({ error: "Invalid meeting category" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check for conflicts
    const { data: conflicts, error: conflictsError } = await supabase
      .from("meetings")
      .select("id, title, start_time, end_time")
      .eq("user_id", session.user.id)
      .is("deleted_at", null)
      .or(
        `and(start_time.lte.${validatedBody.endTime},end_time.gte.${validatedBody.startTime}),` +
          `and(start_time.gte.${validatedBody.startTime},start_time.lt.${validatedBody.endTime}),` +
          `and(end_time.gt.${validatedBody.startTime},end_time.lte.${validatedBody.endTime})`
      );

    if (conflictsError) {
      console.error("Conflicts check error:", conflictsError);
      return new Response(JSON.stringify({ error: "Error checking for conflicts" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Prepare meeting data
    const meetingData = {
      user_id: session.user.id,
      title: validatedBody.title,
      description: validatedBody.description,
      category_id: validatedBody.categoryId,
      start_time: validatedBody.startTime,
      end_time: validatedBody.endTime,
      location_name: validatedBody.locationName,
      ai_generated: true,
      original_note: validatedBody.originalNote,
      ai_generated_notes: validatedBody.aiGeneratedNotes,
    };

    // Save the meeting
    const { data: meeting, error: insertError } = await supabase
      .from("meetings")
      .insert(meetingData)
      .select("*, meeting_categories(id, name, suggested_attire)")
      .single();

    if (insertError) {
      console.error("Meeting insert error:", insertError);
      return new Response(
        JSON.stringify({
          error: "Error saving meeting",
          details: insertError.message,
          code: insertError.code,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!meeting) {
      console.error("No meeting data returned after insert");
      return new Response(JSON.stringify({ error: "Error saving meeting - no data returned" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Transform the meeting data
    const transformedMeeting = transformSupabaseMeeting(meeting);

    // Add conflicts to the response
    const response = {
      ...transformedMeeting,
      conflicts: conflicts?.map((conflict) => ({
        id: conflict.id,
        title: conflict.title,
        startTime: conflict.start_time,
        endTime: conflict.end_time,
      })),
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Redirect": "/proposals",
      },
    });
  } catch (error) {
    console.error("Error accepting meeting proposal:", error);

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
