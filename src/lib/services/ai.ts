import { z } from "zod";
import OpenAI from "openai";

const apiKey = import.meta.env.OPENAI_API_KEY || import.meta.env.PLATFORM_OPENAI_KEY;
const openai = new OpenAI({
  apiKey,
});

const meetingSuggestionSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  locationName: z.string().optional(),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
});

export type MeetingSuggestion = z.infer<typeof meetingSuggestionSchema>;

const systemPrompt = `You are an AI assistant that helps schedule meetings based on natural language notes.
Your task is to analyze the note and suggest meeting details including:
- Title (clear and concise)
- Description (more detailed explanation)
- Category (work, personal, family, or other)
- Start and end times (in ISO format)
- Location (if mentioned)
- Coordinates (if location is specific)

Format your response as a JSON array of meeting objects.`;

export async function generateMeetingSuggestions(note: string): Promise<MeetingSuggestion[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: note },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(response);
    if (!Array.isArray(parsed.meetings)) {
      throw new Error("Invalid AI response format");
    }

    // Validate each suggestion
    const suggestions = parsed.meetings.map((suggestion) => meetingSuggestionSchema.parse(suggestion));

    return suggestions;
  } catch (error) {
    console.error("Error generating meeting suggestions:", error);
    throw new Error("Failed to generate meeting suggestions");
  }
}
