import type { NoteAnalysisResponseDto } from "../../types";
import crypto from "crypto";

/**
 * AI service for analyzing notes and generating meeting suggestions
 */

/**
 * Analyzes a note to extract meeting information and generate suggestions
 * @param note - The note to analyze
 * @returns Analysis results including title, description, category, and generated notes
 */
export async function analyze_note(note: string): Promise<NoteAnalysisResponseDto> {
  try {
    // TODO: Implement actual AI service integration with OpenRouter.ai
    // This is a placeholder implementation

    // Simulate AI analysis with a delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate a stable ID based on the note content
    const category_id = crypto
      .createHash("md5")
      .update(`category-${note.substring(0, 10)}`)
      .digest("hex");

    // Return mock analysis results
    return {
      analyzed_note: note,
      suggested_title: `Meeting: ${note.substring(0, 30)}${note.length > 30 ? "..." : ""}`,
      suggested_description: `Discussion regarding: ${note}`,
      suggested_category: {
        id: category_id,
        name: "Biznesowe",
        suggested_attire: "Strój formalny - garnitur/kostium biznesowy",
      },
      estimated_duration: 60, // Default duration in minutes
    };
  } catch (error) {
    console.error("Error in AI analysis:", error);
    throw new Error("Failed to analyze note with AI service");
  }
}

/**
 * Response data structure for note analysis
 */
interface NoteAnalysisResponseDto {
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
    suggested_attire: string;
  };
  generated_notes: string;
}
