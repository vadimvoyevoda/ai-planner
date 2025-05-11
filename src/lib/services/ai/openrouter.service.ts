import type {
  Message,
  ResponseFormat,
  ChatResponse,
  ChatResponseChunk,
  CompletionResponse,
  CompletionResponseChunk,
  ModelInfo,
  UsageStats,
  RequestOptions,
} from "./openrouter/types";

import {
  OpenRouterError,
  AuthenticationError,
  RateLimitError,
  QuotaExceededError,
  InvalidRequestError,
  ModelError,
  NetworkError,
  TimeoutError,
  BudgetLimitError,
} from "./openrouter/errors";

export class OpenRouterService {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;
  private timeout: number;
  private retryConfig: {
    maxRetries: number;
    initialDelay: number;
    backoffFactor: number;
  };
  private budgetLimits?: {
    daily?: number;
    monthly?: number;
  };
  private systemMessage = "";
  private usageStats: UsageStats = {
    requests: 0,
    tokenCount: {
      prompt: 0,
      completion: 0,
      total: 0,
    },
    cost: 0,
  };

  constructor(options: {
    apiKey: string;
    defaultModel?: string;
    baseUrl?: string;
    timeout?: number;
    retryConfig?: {
      maxRetries: number;
      initialDelay: number;
      backoffFactor: number;
    };
    budgetLimits?: {
      daily?: number;
      monthly?: number;
    };
  }) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || "https://openrouter.ai/api/v1";
    this.defaultModel = options.defaultModel || "openai/gpt-4o-mini";
    this.timeout = options.timeout || 30000;
    this.retryConfig = options.retryConfig || {
      maxRetries: 3,
      initialDelay: 1000,
      backoffFactor: 2,
    };
    this.budgetLimits = options.budgetLimits;
  }

  // Metody publiczne

  /**
   * Ustawia domyślny model dla wszystkich przyszłych żądań
   */
  setDefaultModel(model: string): void {
    this.defaultModel = model;
  }

  /**
   * Ustawia domyślną wiadomość systemową dla wszystkich przyszłych czatów
   */
  setSystemMessage(systemMessage: string): void {
    this.systemMessage = systemMessage;
  }

  /**
   * Tworzy obiekt formatu odpowiedzi do użycia w żądaniach
   */
  createResponseFormat(schema: object, name = "result"): ResponseFormat {
    return {
      type: "json_schema",
      json_schema: {
        name,
        strict: true,
        schema,
      },
    };
  }

  /**
   * Zwraca statystyki użycia
   */
  getUsageStats(): UsageStats {
    return { ...this.usageStats };
  }

  /**
   * Główna metoda do komunikacji z modelem w formacie konwersacji
   */
  async chat(options: {
    messages: Message[];
    model?: string;
    responseFormat?: ResponseFormat;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
    onProgress?: (chunk: ChatResponseChunk) => void;
  }): Promise<ChatResponse> {
    // Sprawdzenie limitów budżetowych
    this.checkBudgetLimits();

    // Przygotowanie wiadomości z systemowym komunikatem
    const messages = [...options.messages];
    if (this.systemMessage && !messages.some((m) => m.role === "system")) {
      messages.unshift({ role: "system", content: this.systemMessage });
    }

    // Przygotowanie danych żądania
    const requestData = {
      model: options.model || this.defaultModel,
      messages,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      response_format: options.responseFormat,
      stream: options.stream,
    };

    try {
      if (options.stream && options.onProgress) {
        return await this.makeStreamingRequest("/chat/completions", requestData, options.onProgress);
      } else {
        return await this.makeRequest("/chat/completions", requestData);
      }
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Analizuje notatkę za pomocą AI i zwraca ustrukturyzowane dane
   */
  async analyzeNote(note: string, schema?: object): Promise<any> {
    const defaultSchema = {
      type: "object",
      properties: {
        suggested_title: {
          type: "string",
          description: "Sugerowany tytuł spotkania",
        },
        suggested_description: {
          type: "string",
          description: "Sugerowany opis spotkania",
        },
        estimated_duration: {
          type: "number",
          description: "Szacowany czas trwania spotkania w minutach",
        },
        category: {
          type: "string",
          description: "Kategoria spotkania (np. biznesowe, prywatne, szkolenie)",
        },
        priority: {
          type: "string",
          enum: ["wysoki", "średni", "niski"],
          description: "Priorytet spotkania",
        },
        participants_count: {
          type: "number",
          description: "Szacowana liczba uczestników spotkania",
        },
        analyzed_note: {
          type: "string",
          description: "Podsumowanie i analiza notatki",
        },
      },
      required: ["suggested_title", "category", "estimated_duration", "analyzed_note"],
    };

    const responseFormat = this.createResponseFormat(schema || defaultSchema, "meeting_analysis");

    const messages: Message[] = [
      {
        role: "system",
        content:
          "Jesteś asystentem specjalizującym się w analizie notatek dotyczących spotkań. " +
          "Twoim zadaniem jest analiza treści notatki, zaproponowanie tytułu, kategorii, " +
          "opisu, szacowanego czasu trwania oraz ogólne podsumowanie. " +
          "Odpowiedz wyłącznie w formacie JSON zgodnym ze schematem, bez dodatkowych informacji.",
      },
      {
        role: "user",
        content: `Przeanalizuj notatkę dotyczącą spotkania: "${note}"`,
      },
    ];

    const response = await this.chat({
      messages,
      responseFormat,
      temperature: 0.3,
      model: "openai/gpt-4o-mini", // Możemy używać modelu, który dobrze radzi sobie z analizą tekstu
    });

    // Przykładowa odpowiedź może być w różnych formatach zależnie od API
    // Sprawdzamy czy mamy poprawny format odpowiedzi
    try {
      if (typeof response.choices[0].message.content === "string") {
        return JSON.parse(response.choices[0].message.content);
      } else {
        return response.choices[0].message.content;
      }
    } catch (error) {
      throw new InvalidRequestError("Nie udało się przetworzyć odpowiedzi AI", { originalResponse: response });
    }
  }

  // Metody prywatne

  /**
   * Sprawdza limity budżetowe
   */
  private checkBudgetLimits(): void {
    // Implementacja sprawdzenia limitów budżetowych
    if (!this.budgetLimits) return;

    const { daily, monthly } = this.budgetLimits;
    const currentCost = this.usageStats.cost;

    if (daily && currentCost > daily) {
      throw new BudgetLimitError(`Przekroczono dzienny limit budżetu: ${daily}`);
    }

    if (monthly && currentCost > monthly) {
      throw new BudgetLimitError(`Przekroczono miesięczny limit budżetu: ${monthly}`);
    }
  }

  /**
   * Bazowa metoda do komunikacji z API OpenRouter
   */
  private async makeRequest(endpoint: string, data: any): Promise<any> {
    let retries = 0;
    let delay = this.retryConfig.initialDelay;

    while (true) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": "https://myscheduler.app",
            "X-Title": "MyScheduler",
          },
          body: JSON.stringify(data),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
          throw new OpenRouterError(
            errorData.error?.message || `HTTP error ${response.status}`,
            `api_error_${response.status}`,
            errorData
          );
        }

        const result = await response.json();

        // Aktualizacja statystyk użycia
        this.trackUsage(data.model, result.usage?.prompt_tokens || 0, result.usage?.completion_tokens || 0);

        return result;
      } catch (error: any) {
        // Jeśli to ostatnia próba lub błąd nie jest tymczasowy, rzuć go dalej
        if (retries >= this.retryConfig.maxRetries || !this.isRetryableError(error)) {
          throw error;
        }

        // Czekaj przed kolejną próbą
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Zwiększ opóźnienie dla następnej próby
        delay *= this.retryConfig.backoffFactor;
        retries++;
      }
    }
  }

  /**
   * Obsługuje odpowiedzi strumieniowe z API
   */
  private async makeStreamingRequest(endpoint: string, data: any, onProgress: Function): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://myscheduler.app",
          "X-Title": "MyScheduler",
        },
        body: JSON.stringify({ ...data, stream: true }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
        throw new OpenRouterError(
          errorData.error?.message || `HTTP error ${response.status}`,
          `api_error_${response.status}`,
          errorData
        );
      }

      if (!response.body) {
        throw new NetworkError("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const chunks = [];
      const result: any = {};
      let promptTokens = 0;
      let completionTokens = 0;

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((line) => line.trim().startsWith("data:"));

          for (const line of lines) {
            const jsonStr = line.replace(/^data: /, "").trim();
            if (jsonStr === "[DONE]") continue;

            try {
              const chunkData = JSON.parse(jsonStr);
              chunks.push(chunkData);

              // Wywołanie funkcji callback z chunkiem
              onProgress(chunkData);

              // Aktualizacja tokena ID, wybranie ostatniego modelu
              result.id = chunkData.id;
              result.model = chunkData.model;

              // Aktualizacja informacji o tokenach, jeśli są dostępne
              if (chunkData.usage) {
                promptTokens = chunkData.usage.prompt_tokens || promptTokens;
                completionTokens += chunkData.usage.completion_tokens || 0;
              }
            } catch (e) {
              // Ignoruj błędne fragmenty JSON
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Skomponowanie pełnej odpowiedzi z fragmentów
      result.choices = this.mergeStreamingChunks(chunks);
      result.usage = {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens,
      };

      // Aktualizacja statystyk
      this.trackUsage(data.model, promptTokens, completionTokens);

      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Łączy chunki odpowiedzi strumieniowej w jedną odpowiedź
   */
  private mergeStreamingChunks(chunks: ChatResponseChunk[]): ChatResponse["choices"] {
    if (chunks.length === 0) {
      return [];
    }

    const messages: Record<string, Message> = {};

    for (const chunk of chunks) {
      for (const choice of chunk.choices) {
        const index = choice.index ?? 0;

        if (!messages[index]) {
          messages[index] = { role: "assistant", content: "" };
        }

        // Aktualizacja wiadomości na podstawie delty
        if (choice.delta?.content) {
          messages[index].content += choice.delta.content;
        }

        if (choice.delta?.role) {
          messages[index].role = choice.delta.role;
        }

        if (choice.delta?.name) {
          messages[index].name = choice.delta.name;
        }

        if (choice.delta?.tool_call_id) {
          messages[index].tool_call_id = choice.delta.tool_call_id;
        }
      }
    }

    // Tworzenie finalnych wyborów na podstawie zrekonstruowanych wiadomości
    return Object.entries(messages).map(([index, message]) => {
      return {
        index: parseInt(index),
        message,
        finish_reason: chunks[chunks.length - 1].choices[parseInt(index)]?.finish_reason || null,
      };
    });
  }

  /**
   * Śledzi wykorzystanie usługi
   */
  private trackUsage(model: string, inputTokens: number, outputTokens: number): void {
    this.usageStats.requests += 1;
    this.usageStats.tokenCount.prompt += inputTokens;
    this.usageStats.tokenCount.completion += outputTokens;
    this.usageStats.tokenCount.total += inputTokens + outputTokens;

    // W rzeczywistej implementacji tutaj byłoby obliczanie kosztu na podstawie cen modelu
    // Dla uproszczenia przyjmiemy stałe stawki
    const costPerPromptToken = 0.00001;
    const costPerCompletionToken = 0.00002;

    this.usageStats.cost += inputTokens * costPerPromptToken + outputTokens * costPerCompletionToken;
  }

  /**
   * Sprawdza, czy błąd kwalifikuje się do ponowienia próby
   */
  private isRetryableError(error: any): boolean {
    // Błędy sieciowe i timeouty kwalifikują się do ponowienia
    if (error instanceof NetworkError || error instanceof TimeoutError) {
      return true;
    }

    // Błędy API z kodami 429, 500, 502, 503, 504 kwalifikują się do ponowienia
    if (error instanceof OpenRouterError) {
      const statusCode = parseInt(error.code.replace("api_error_", ""));
      return [429, 500, 502, 503, 504].includes(statusCode);
    }

    return false;
  }

  /**
   * Przekształca błędy API na odpowiednie wyjątki
   */
  private handleApiError(error: any): never {
    if (error instanceof OpenRouterError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new TimeoutError("Żądanie przekroczyło limit czasu");
      }

      if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
        throw new NetworkError("Błąd sieci podczas komunikacji z API");
      }

      throw new OpenRouterError(error.message, "unknown_error");
    }

    throw new OpenRouterError("Nieznany błąd", "unknown_error");
  }
}
