import { OpenAIService } from "./ai/openai.service";
import type {
  MeetingProposalCommand,
  MeetingProposalResponseDto,
  MeetingPreferencesEntity,
  MeetingCategoryEntity,
  MeetingDistribution,
  TimeOfDay,
} from "../../types";
import { createClientSupabase } from "@/lib/supabase";
import crypto from "crypto";

// Wydzielenie typu NoteAnalysisResponseDto
export interface NoteAnalysisResponseDto {
  suggested_title: string;
  suggested_description?: string;
  estimated_duration?: number;
  category?: string;
  priority?: string;
  participants_count?: number;
  analyzed_note?: string;
}

// Inicjalizacja serwisu OpenAI
const openAIService = new OpenAIService(import.meta.env.PLATFORM_OPENAI_KEY, {
  defaultModel: "gpt-4",
  timeout: 60000,
});

/**
 * Analizuje notatkę przy użyciu OpenAI API
 * @param note - Tekst notatki do analizy
 * @returns Analiza notatki
 */
async function analyze_note(note: string): Promise<NoteAnalysisResponseDto> {
  try {
    openAIService.setSystemMessage(`Jesteś asystentem do analizy spotkań. Przeanalizuj notatkę i wyodrębnij następujące informacje:
      1. Sugerowany tytuł spotkania
      2. Sugerowany opis spotkania
      3. Szacowany czas trwania w minutach
      4. Kategoria spotkania
      5. Priorytet spotkania
      6. Szacowana liczba uczestników
      7. Analiza notatki`);

    openAIService.setResponseFormat({
      type: "json_schema",
      json_schema: {
        type: "object",
        properties: {
          suggested_title: { type: "string" },
          suggested_description: { type: "string" },
          estimated_duration: { type: "integer" },
          category: { type: "string" },
          priority: { type: "string" },
          participants_count: { type: "integer" },
          analyzed_note: { type: "string" },
        },
      },
    });

    openAIService.addUserMessage(note);
    const completion = await openAIService.createChatCompletion();
    return openAIService.parseResponse<NoteAnalysisResponseDto>(completion);
  } catch (error) {
    console.error("Error analyzing note with OpenAI:", error);
    // Fallback w przypadku błędu
    return {
      suggested_title: "Nowe spotkanie",
      suggested_description: note,
      estimated_duration: 60,
      category: "Ogólne",
      priority: "średni",
      analyzed_note: note,
    };
  }
}

/**
 * Retrieves user preferences for meetings from the database
 * @param user_id - The ID of the user
 */
async function get_user_preferences(user_id: string): Promise<MeetingPreferencesEntity> {
  const supabase = createClientSupabase();
  const { data, error } = await supabase.from("meeting_preferences").select("*").eq("user_id", user_id).single();

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching user preferences:", error);
    // Return default preferences if not found
    return {
      id: crypto.randomUUID(),
      user_id,
      preferred_distribution: "rozłożone" as MeetingDistribution,
      preferred_times_of_day: ["rano", "dzień", "wieczór"] as TimeOfDay[],
      min_break_minutes: 30,
      unavailable_weekdays: [0, 6], // Sunday and Saturday
    };
  }

  return data;
}

/**
 * Retrieves meeting categories from the database
 */
async function get_meeting_categories(): Promise<MeetingCategoryEntity[]> {
  const supabase = createClientSupabase();
  const { data, error } = await supabase.from("meeting_categories").select("*");

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching meeting categories:", error);
    // Return default category if error
    return [
      {
        id: crypto.createHash("md5").update("default-category").digest("hex"),
        name: "General",
        suggested_attire: "Business casual",
        created_at: new Date().toISOString(),
      },
    ];
  }

  return data;
}

/**
 * Matches the AI analysis category to an existing category
 */
function match_category(
  note_analysis: NoteAnalysisResponseDto,
  categories: MeetingCategoryEntity[]
): MeetingCategoryEntity {
  // For now, return the first category or default to General
  // In a real implementation, this would use text similarity or other matching techniques
  return categories.length > 0
    ? categories[0]
    : {
        id: crypto.createHash("md5").update("default-category").digest("hex"),
        name: "General",
        suggested_attire: "Business casual",
        created_at: new Date().toISOString(),
      };
}

/**
 * Generates meeting time proposals
 * @param user_id - The ID of the user
 * @param command - The original command
 * @param note_analysis - The AI analysis results
 * @param user_preferences - The user preferences
 * @param category - The matched meeting category
 */
async function generate_meeting_times(
  user_id: string,
  command: MeetingProposalCommand,
  note_analysis: NoteAnalysisResponseDto,
  user_preferences: MeetingPreferencesEntity,
  category: MeetingCategoryEntity
) {
  // Get user's existing meetings to avoid conflicts
  const supabase = createClientSupabase();
  if (!supabase) {
    throw new Error("Supabase client not available");
  }
  const { data: existing_meetings } = await supabase
    .from("meetings")
    .select("start_time, end_time")
    .eq("user_id", user_id)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true });

  // Duration from command or analysis, with default fallback
  const duration = command.estimated_duration || note_analysis.estimated_duration || 60; // Default to 60 minutes

  // Generate a list of potential days for meetings (next 7 days)
  const potentialDays: Date[] = [];
  for (let i = 1; i <= 7; i++) {
    const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
    // Skip days that are marked as unavailable in user preferences
    if (!isUnavailableDay(date, user_preferences.unavailable_weekdays)) {
      potentialDays.push(date);
    }
  }

  // No available days found
  if (potentialDays.length === 0) {
    // Fallback: just use the next two days regardless of availability settings
    potentialDays.push(new Date(Date.now() + 24 * 60 * 60 * 1000), new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));
  }

  // Determine number of proposals (2 or 3 based on some logic)
  // For now, use 3 proposals if we have at least 3 potential days
  const numProposals = Math.min(potentialDays.length, potentialDays.length >= 3 ? 3 : 2);

  // Apply distribution preference
  let selectedDays: Date[] = [];
  const distributed = "rozłożone" as MeetingDistribution;

  if (user_preferences.preferred_distribution === distributed) {
    // For distributed preferences, select days spread out across the available ones
    selectedDays = distributeDays(potentialDays, numProposals);
  } else {
    // For condensed preferences, select consecutive days if possible
    selectedDays = condenseDays(potentialDays, numProposals);
  }

  // Prepare each day with appropriate meeting time based on preferences
  const proposals = [];
  for (const day of selectedDays) {
    // Set initial time based on user preferred times of day
    setPreferredTime(day, user_preferences.preferred_times_of_day);

    // Adjust time if there are conflicts with existing meetings
    if (existing_meetings) {
      adjustForConflicts(day, duration, existing_meetings, user_preferences.min_break_minutes || 30);
    }

    // Add proposal to the list
    proposals.push({
      start_time: day.toISOString(),
      end_time: new Date(day.getTime() + duration * 60 * 1000).toISOString(),
      title: note_analysis.suggested_title || command.note,
      description: note_analysis.suggested_description || "",
      category: {
        id: category.id,
        name: category.name,
        suggested_attire: category.suggested_attire,
      },
      location_name: command.location_name,
      ai_generated_notes: note_analysis.analyzed_note || "",
      original_note: command.note,
    });
  }

  return proposals;
}

/**
 * Checks if a given date falls on a day that's marked as unavailable
 */
function isUnavailableDay(date: Date, unavailable_weekdays: number[]): boolean {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  return unavailable_weekdays.includes(dayOfWeek);
}

/**
 * Distributes days across available days for "distributed" preference
 */
function distributeDays(availableDays: Date[], count: number): Date[] {
  if (availableDays.length <= count) {
    return [...availableDays]; // Return all available days if fewer than requested
  }

  const result: Date[] = [];
  // Calculate step size to distribute evenly
  const step = Math.floor(availableDays.length / count);

  for (let i = 0; i < count; i++) {
    result.push(availableDays[i * step]);
  }

  return result;
}

/**
 * Selects consecutive days when possible for "condensed" preference
 */
function condenseDays(availableDays: Date[], count: number): Date[] {
  if (availableDays.length <= count) {
    return [...availableDays]; // Return all available days if fewer than requested
  }

  // Try to find consecutive days
  for (let i = 0; i <= availableDays.length - count; i++) {
    // Check if days from i to i+count-1 are consecutive
    let consecutive = true;
    for (let j = i; j < i + count - 1; j++) {
      const day1 = availableDays[j].getDate();
      const month1 = availableDays[j].getMonth();
      const year1 = availableDays[j].getFullYear();

      const day2 = availableDays[j + 1].getDate();
      const month2 = availableDays[j + 1].getMonth();
      const year2 = availableDays[j + 1].getFullYear();

      // Check if dates are 1 day apart
      const date1 = new Date(year1, month1, day1);
      const date2 = new Date(year2, month2, day2);
      const diffTime = Math.abs(date2.getTime() - date1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays !== 1) {
        consecutive = false;
        break;
      }
    }

    if (consecutive) {
      return availableDays.slice(i, i + count);
    }
  }

  // If no consecutive days found, just return the first 'count' days
  return availableDays.slice(0, count);
}

/**
 * Sets the time of day based on user preferences
 */
function setPreferredTime(date: Date, preferred_times: TimeOfDay[]): void {
  // Default to afternoon if no preferences
  if (!preferred_times || preferred_times.length === 0) {
    date.setHours(14, 0, 0, 0);
    return;
  }

  // Pick a time based on preferences
  const morning = "rano" as TimeOfDay;
  const afternoon = "dzień" as TimeOfDay;
  const evening = "wieczór" as TimeOfDay;

  if (preferred_times.includes(morning)) {
    date.setHours(9, 0, 0, 0);
  } else if (preferred_times.includes(afternoon)) {
    date.setHours(14, 0, 0, 0);
  } else if (preferred_times.includes(evening)) {
    date.setHours(18, 0, 0, 0);
  } else {
    // Default fallback
    date.setHours(14, 0, 0, 0);
  }
}

/**
 * Adjusts proposed meeting time to avoid conflicts with existing meetings
 */
function adjustForConflicts(
  proposedDate: Date,
  duration: number,
  existingMeetings: { start_time: string; end_time: string }[],
  minBreakMinutes: number
): void {
  const endTime = new Date(proposedDate.getTime() + duration * 60 * 1000);

  for (const meeting of existingMeetings) {
    const meetingStart = new Date(meeting.start_time);
    const meetingEnd = new Date(meeting.end_time);

    // Check if proposed time overlaps with existing meeting
    const hasConflict =
      (proposedDate >= meetingStart && proposedDate <= meetingEnd) ||
      (endTime >= meetingStart && endTime <= meetingEnd) ||
      (proposedDate <= meetingStart && endTime >= meetingEnd);

    if (hasConflict) {
      // Move proposed time to after the meeting plus break time
      const newStartTime = new Date(meetingEnd.getTime() + minBreakMinutes * 60 * 1000);
      proposedDate.setTime(newStartTime.getTime());

      // Recalculate end time
      endTime.setTime(proposedDate.getTime() + duration * 60 * 1000);

      // Re-check all meetings for conflicts with the new time
      // This is necessary because moving the time might create new conflicts
      adjustForConflicts(proposedDate, duration, existingMeetings, minBreakMinutes);
      break;
    }
  }
}

/**
 * Generates meeting proposals based on user preferences and AI analysis
 * @param user_id - The ID of the user requesting proposals
 * @param command - The command containing the note, location, and optional duration
 * @returns A response with meeting proposals
 */
export async function generate_proposals(
  user_id: string,
  command: MeetingProposalCommand
): Promise<MeetingProposalResponseDto> {
  try {
    // Pobranie preferencji użytkownika
    const user_preferences = await get_user_preferences(user_id);

    // Analiza notatki przez AI
    const note_analysis = await analyze_note(command.note);

    // Pobranie kategorii spotkań
    const categories = await get_meeting_categories();

    // Dopasowanie kategorii z analizy AI do istniejących kategorii
    const matched_category = match_category(note_analysis, categories);

    // Generowanie propozycji terminów
    const proposals = await generate_meeting_times(user_id, command, note_analysis, user_preferences, matched_category);

    // Zwrócenie sformatowanej odpowiedzi
    return {
      proposals,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error generating meeting proposals:", error);
    throw error;
  }
}

/**
 * Updates proposal statistics for a user
 * @param user_id - The ID of the user
 */
export async function update_proposal_stats(user_id: string) {
  try {
    const supabase = createClientSupabase();
    if (!supabase) {
      console.error("Supabase client not available");
      return;
    }

    // Get current date for period calculations
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-01`;

    // Check if entry exists for current month
    const { data, error } = await supabase
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
      await supabase
        .from("proposal_stats")
        .update({
          total_generations: data.total_generations + 1,
          last_updated: new Date().toISOString(),
        })
        .eq("id", data.id);
    } else {
      // Create new record
      await supabase.from("proposal_stats").insert({
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
