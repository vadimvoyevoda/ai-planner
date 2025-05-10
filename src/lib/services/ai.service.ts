import type { NoteAnalysisResponseDto } from "../../types";
import crypto from "crypto";

/**
 * AI service for analyzing notes and generating meeting suggestions
 */

/**
 * Analyzes a meeting note using AI to extract key information
 * @param note - The note text to analyze
 * @returns Analysis results including suggested title, description, and duration
 */
export async function analyze_note(note: string): Promise<NoteAnalysisResponseDto> {
  try {
    // In a real implementation, this would call an AI service
    // For now, returning basic mock data based on the note

    // Extract a title from the first few words of the note
    const words = note.split(" ");
    const title = words.slice(0, 3).join(" ") + (words.length > 3 ? "..." : "");

    // Generate a stable category ID based on the note content
    const category_id = crypto
      .createHash("md5")
      .update(`category-${note.substring(0, 10)}`)
      .digest("hex");

    // Default values
    return {
      analyzed_note: `Analysis of: ${note}`,
      suggested_title: title,
      suggested_description: note,
      suggested_category: {
        id: category_id,
        name: "General",
        suggested_attire: "Business casual",
      },
      estimated_duration: 30, // Default 30 minutes
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error analyzing note:", error);
    // Provide default values in case of error
    const fallback_id = crypto.createHash("md5").update("default-category").digest("hex");

    return {
      analyzed_note: "",
      suggested_title: "Meeting",
      suggested_description: note,
      suggested_category: {
        id: fallback_id,
        name: "General",
        suggested_attire: "Business casual",
      },
      estimated_duration: 60,
    };
  }
}
