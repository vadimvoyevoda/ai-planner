import OpenAI from "openai";

export class OpenAIService {
  private openai: OpenAI;
  private messages: { role: "system" | "user" | "assistant"; content: string }[];

  constructor() {
    const apiKey = import.meta.env.PLATFORM_OPENAI_KEY;
    console.log("OpenAI Service - API Key available:", !!apiKey);

    if (!apiKey) {
      throw new Error("OpenAI API key is not configured. Please check your environment variables.");
    }

    this.openai = new OpenAI({
      apiKey,
      baseURL: "https://api.openai.com/v1",
      dangerouslyAllowBrowser: true,
    });
    this.messages = [];
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
