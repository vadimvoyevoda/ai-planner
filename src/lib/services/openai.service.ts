import OpenAI from "openai";

export class OpenAIService {
  private openai: OpenAI;
  private messages: { role: "system" | "user" | "assistant"; content: string }[];
  private isTestEnvironment: boolean;

  constructor() {
    const apiKey = import.meta.env.PLATFORM_OPENAI_KEY;
    // Sprawdź, czy jesteśmy w środowisku testowym lub czy wymuszono mock
    this.isTestEnvironment =
      import.meta.env.MODE === "test" || process.env.NODE_ENV === "test" || import.meta.env.USE_MOCK_OPENAI === "true";

    console.log("OpenAI Service - API Key available:", !!apiKey);
    console.log("OpenAI Service - Test environment:", this.isTestEnvironment);
    console.log("OpenAI Service - USE_MOCK_OPENAI:", import.meta.env.USE_MOCK_OPENAI);

    if (this.isTestEnvironment) {
      console.log("Using mock OpenAI implementation for tests");
      this.openai = this.createMockOpenAI() as unknown as OpenAI;
    } else {
      if (!apiKey) {
        throw new Error("OpenAI API key is not configured. Please check your environment variables.");
      }

      this.openai = new OpenAI({
        apiKey,
        baseURL: "https://api.openai.com/v1",
        dangerouslyAllowBrowser: true,
      });
    }

    this.messages = [];
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
      console.log("Creating chat completion with messages:", this.messages);

      const completion = await this.openai.chat.completions.create({
        messages: this.messages,
        model: "gpt-3.5-turbo",
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
