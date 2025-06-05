import OpenAI from "openai";
import { getOpenAIKey } from "./cloudflare-env";

export class OpenAIService {
  private openai: OpenAI | null = null;
  private messages: { role: "system" | "user" | "assistant"; content: string }[];
  private isTestEnvironment: boolean;

  constructor() {
    // Sprawdź, czy jesteśmy w środowisku testowym lub czy wymuszono mock
    this.isTestEnvironment =
      import.meta.env.MODE === "test" || 
      import.meta.env.NODE_ENV === "test" || 
      import.meta.env.USE_MOCK_OPENAI === "true";
    
    this.messages = [];
  }

  // Lazy initialization of OpenAI client
  private getOpenAIClient(): OpenAI {
    if (this.openai) {
      return this.openai;
    }
    
    if (this.isTestEnvironment) {
      this.openai = this.createMockOpenAI() as unknown as OpenAI;
      return this.openai;
    }
    
    // Try direct environment variables - ONLY OpenAI keys
    const platformKey = import.meta.env.PLATFORM_OPENAI_KEY;
    const fallbackKey = import.meta.env.OPENAI_API_KEY;
    
    // Then try our CloudFlare utility
    const cloudflareKey = getOpenAIKey();
    
    // Use only OpenAI keys, no OpenRouter
    const apiKey = platformKey || fallbackKey || cloudflareKey;
    
    if (!apiKey) {
      throw new Error("OpenAI API key is not configured. Please check your environment variables.");
    }

    // Always use OpenAI API
    const baseURL = "https://api.openai.com/v1";
    
    this.openai = new OpenAI({
      apiKey,
      baseURL,
      dangerouslyAllowBrowser: true,
    });
    
    return this.openai;
  }

  private createMockOpenAI() {
    // Mock implementacja OpenAI dla testów
    return {
      chat: {
        completions: {
          create: async () => {
            // Symuluj opóźnienie, aby zachowanie było bardziej realistyczne
            await new Promise((resolve) => setTimeout(resolve, 50));

            // Zwróć zmockowaną odpowiedź z propozycjami spotkań
            return {
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      proposals: [
                        {
                          category: "Spotkanie biznesowe",
                          startTime: new Date(Date.now() + 86400000).toISOString(), // jutro
                          endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(), // jutro + 1h
                          title: "Mock spotkanie biznesowe",
                          description: "Testowe spotkanie biznesowe wygenerowane przez mock",
                          locationName: "Biuro testowe, ul. Testowa 123",
                          suggestedAttire: "Strój biznesowy",
                        },
                        {
                          category: "Przerwa kawowa",
                          startTime: new Date(Date.now() + 172800000).toISOString(), // pojutrze
                          endTime: new Date(Date.now() + 172800000 + 1800000).toISOString(), // pojutrze + 30min
                          title: "Mock przerwa kawowa",
                          description: "Testowa przerwa kawowa wygenerowana przez mock",
                          locationName: "Kawiarnia Testowa, ul. Kawowa 42",
                          suggestedAttire: "Strój casualowy",
                        },
                      ],
                    }),
                  },
                },
              ],
            };
          },
        },
      },
    };
  }

  setSystemMessage(content: string) {
    // Reset messages and set new system message
    this.messages = [{ role: "system", content }];
  }

  addUserMessage(content: string) {
    this.messages.push({ role: "user", content });
  }

  async createChatCompletion() {
    try {
      // Get OpenAI client lazily
      const openai = this.getOpenAIClient();

      // Użyj modelu z zmiennych środowiskowych lub domyślnego
      const model = import.meta.env.OPENAI_MODEL || "gpt-3.5-turbo";

      const completion = await openai.chat.completions.create({
        messages: this.messages,
        model,
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error("Error in OpenAI chat completion:", error);
      if (error instanceof Error) {
        throw new Error(`Nie udało się wygenerować propozycji: ${error.message}`);
      }
      throw new Error("Nie udało się wygenerować propozycji. Spróbuj ponownie później.");
    }
  }

  parseResponse<T>(response: string | null): T {
    if (!response) {
      throw new Error("Otrzymano pustą odpowiedź od AI.");
    }

    try {
      return JSON.parse(response) as T;
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      throw new Error("Nie udało się przetworzyć odpowiedzi AI.");
    }
  }
}
