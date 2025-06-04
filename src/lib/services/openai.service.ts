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
      console.log("Using mock OpenAI implementation for tests");
      this.openai = this.createMockOpenAI() as unknown as OpenAI;
      return this.openai;
    }
    
    // Try direct environment variables - ONLY OpenAI keys
    const platformKey = import.meta.env.PLATFORM_OPENAI_KEY;
    const fallbackKey = import.meta.env.OPENAI_API_KEY;
    
    // Then try our CloudFlare utility
    const cloudflareKey = getOpenAIKey();
    
    // Check if we're in production environment based on PUBLIC_ENV_NAME
    const isProd = import.meta.env.PUBLIC_ENV_NAME === "prod";
    
    // Use only OpenAI keys, no OpenRouter
    const apiKey = platformKey || fallbackKey || cloudflareKey;
    
    // Improved logging for debugging
    console.log("OpenAI Service - API Key detection:");
    console.log("PLATFORM_OPENAI_KEY present:", !!platformKey);
    console.log("OPENAI_API_KEY present:", !!fallbackKey);
    console.log("CloudFlare key present:", !!cloudflareKey);
    console.log("Environment:", import.meta.env.PUBLIC_ENV_NAME);
    console.log("Is Production:", isProd);
    console.log("Final API Key exists:", !!apiKey);
    
    if (!apiKey) {
      throw new Error("OpenAI API key is not configured. Please check your environment variables.");
    }

    // Always use OpenAI API
    const baseURL = "https://api.openai.com/v1";
    
    console.log("OpenAI Service - Using base URL:", baseURL);
    
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
            console.log("MOCK: Creating fake chat completion");
            // Symuluj opóźnienie, aby zachowanie było bardziej realistyczne
            await new Promise((resolve) => setTimeout(resolve, 500));

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
      console.log("Creating chat completion with messages:", this.messages);

      // Użyj modelu z zmiennych środowiskowych lub domyślnego
      const model = import.meta.env.OPENAI_MODEL || "gpt-3.5-turbo";
      console.log("Using model:", model);

      const completion = await openai.chat.completions.create({
        messages: this.messages,
        model,
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      });

      console.log("Received completion response:", completion.choices[0].message);
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
