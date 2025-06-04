import { z } from "zod";
import OpenAI from "openai";
import { getOpenAIKey } from "./cloudflare-env";

// Use lazy initialization instead of creating at module load time
let openaiClient: OpenAI | null = null;

// Function to get or create the OpenAI client
function getOpenAIClient(): OpenAI {
  if (openaiClient) {
    return openaiClient;
  }
  
  // Check OpenAI keys only
  const platformKey = import.meta.env.PLATFORM_OPENAI_KEY;
  const openaiKey = import.meta.env.OPENAI_API_KEY;
  
  // Try CloudFlare utility
  const cloudflareKey = getOpenAIKey();
  
  // Check if we're in production environment
  const isProd = import.meta.env.PUBLIC_ENV_NAME === "prod";
  
  // Combine all possible keys
  const apiKey = platformKey || openaiKey || cloudflareKey;
  
  // Detailed logging for debugging
  console.log("AI Service - API Key detection:");
  console.log("PLATFORM_OPENAI_KEY present:", !!platformKey);
  console.log("OPENAI_API_KEY present:", !!openaiKey);
  console.log("Environment:", import.meta.env.PUBLIC_ENV_NAME);
  console.log("Is Production:", isProd);
  console.log("Final API Key exists:", !!apiKey);
  
  if (!apiKey) {
    throw new Error("OpenAI API key is missing. Please check environment variables.");
  }
  
  // Create the OpenAI client with OpenAI API only
  openaiClient = new OpenAI({
    apiKey,
    baseURL: "https://api.openai.com/v1",
    dangerouslyAllowBrowser: true,
  });
  
  return openaiClient;
}

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
    // Get the client only when needed
    const openai = getOpenAIClient();
    
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
