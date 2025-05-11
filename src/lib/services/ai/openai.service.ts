import type {
  ModelParameters,
  ModelCapabilityRequirements,
  ResponseFormatSchema,
  RequestPayload,
  ChatCompletionResponse,
  ConversationMessage,
  MessageContent,
  RateLimitConfig,
  MonitoringStats,
  StreamChunk,
} from "./types";
import {
  OpenAIServiceError,
  OpenAIApiError,
  OpenAIRateLimitError,
  OpenAITimeoutError,
  OpenAINetworkError,
  OpenAIValidationError,
} from "./errors";
import { findModelByCapabilities, getModelInfo } from "./modelRegistry";

export class OpenAIService {
  private apiKey: string;
  private modelName: string;
  private modelParams: ModelParameters;
  private systemMessage: string | null = null;
  private conversation: ConversationMessage[] = [];
  private responseFormat: ResponseFormatSchema | null = null;
  private baseUrl: string;
  private timeout: number;

  // Rate limiting
  private rateLimitConfig: RateLimitConfig;
  private requestQueue: (() => Promise<unknown>)[] = [];
  private activeRequests = 0;
  private retryCount = 0;

  // Monitoring
  private stats: MonitoringStats = {
    totalRequests: 0,
    totalTokens: 0,
    totalErrors: 0,
    averageLatency: 0,
    rateLimitHits: 0,
  };

  constructor(
    apiKey?: string,
    options?: {
      defaultModel?: string;
      defaultParams?: ModelParameters;
      baseUrl?: string;
      timeout?: number;
      rateLimitConfig?: Partial<RateLimitConfig>;
    }
  ) {
    // Try to get API key from environment variable if not provided
    console.log("Constructor - Provided API Key:", apiKey);
    console.log("Constructor - Environment Variable:", import.meta.env.PLATFORM_OPENAI_KEY);

    const finalApiKey = apiKey || import.meta.env.PLATFORM_OPENAI_KEY;
    console.log("Constructor - Final API Key:", finalApiKey);

    if (!finalApiKey) {
      throw new OpenAIValidationError(
        "API key is required. Provide it directly or set PLATFORM_OPENAI_KEY environment variable"
      );
    }

    this.apiKey = finalApiKey;
    this.modelName = options?.defaultModel || "gpt-4o-mini";
    this.modelParams = options?.defaultParams || {
      temperature: 0.7,
      top_p: 1,
      max_tokens: 1000,
    };
    this.baseUrl = options?.baseUrl || "https://api.openai.com/v1";
    this.timeout = options?.timeout || 30000;

    // Initialize rate limiting config
    this.rateLimitConfig = {
      maxRetries: options?.rateLimitConfig?.maxRetries ?? 3,
      retryDelay: options?.rateLimitConfig?.retryDelay ?? 1000,
      maxConcurrentRequests: options?.rateLimitConfig?.maxConcurrentRequests ?? 5,
    };

    try {
      getModelInfo(this.modelName);
    } catch {
      throw new OpenAIValidationError(`Invalid default model: ${this.modelName}`);
    }
  }

  // Conversation Management Methods
  setSystemMessage(message: string): void {
    if (!message.trim()) {
      throw new OpenAIValidationError("System message cannot be empty");
    }
    this.systemMessage = message;
  }

  addUserMessage(message: string | MessageContent[]): void {
    if (typeof message === "string" && !message.trim()) {
      throw new OpenAIValidationError("User message cannot be empty");
    }
    this.conversation.push({
      role: "user",
      content: message,
    });
  }

  addAssistantMessage(message: string): void {
    if (!message.trim()) {
      throw new OpenAIValidationError("Assistant message cannot be empty");
    }
    this.conversation.push({
      role: "assistant",
      content: message,
    });
  }

  clearConversation(): void {
    this.conversation = [];
  }

  // Model Configuration Methods
  setModel(modelName: string): void {
    try {
      getModelInfo(modelName);
      this.modelName = modelName;
    } catch {
      throw new OpenAIValidationError(`Invalid model: ${modelName}`);
    }
  }

  setModelByCapability(requirements: ModelCapabilityRequirements): void {
    try {
      const modelName = findModelByCapabilities(requirements);
      this.modelName = modelName;
    } catch (error) {
      throw new OpenAIValidationError("Failed to find suitable model: " + (error as Error).message);
    }
  }

  setParameters(params: ModelParameters): void {
    if (params.temperature !== undefined && (params.temperature < 0 || params.temperature > 2)) {
      throw new OpenAIValidationError("Temperature must be between 0 and 2");
    }
    if (params.top_p !== undefined && (params.top_p < 0 || params.top_p > 1)) {
      throw new OpenAIValidationError("Top P must be between 0 and 1");
    }
    if (params.max_tokens !== undefined && params.max_tokens < 1) {
      throw new OpenAIValidationError("Max tokens must be greater than 0");
    }

    this.modelParams = {
      ...this.modelParams,
      ...params,
    };
  }

  setParameterPreset(presetName: "balanced" | "creative" | "precise"): void {
    switch (presetName) {
      case "balanced":
        this.modelParams = {
          temperature: 0.7,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
        };
        break;
      case "creative":
        this.modelParams = {
          temperature: 0.9,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.6,
        };
        break;
      case "precise":
        this.modelParams = {
          temperature: 0.2,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
        };
        break;
      default:
        throw new OpenAIValidationError(`Unknown parameter preset: ${presetName}`);
    }
  }

  // Response Format Configuration
  setResponseFormat(format: string | ResponseFormatSchema): void {
    if (typeof format === "string") {
      switch (format) {
        case "json":
          this.responseFormat = {
            type: "json_schema",
            json_schema: {
              name: "generic_json",
              strict: true,
              schema: { type: "object" },
            },
          };
          break;
        default:
          throw new OpenAIValidationError(`Unknown predefined format: ${format}`);
      }
    } else {
      if (!this.validateResponseFormat(format)) {
        throw new OpenAIValidationError("Invalid response format schema");
      }
      this.responseFormat = format;
    }
  }

  // API Communication Methods
  buildRequestPayload(): RequestPayload {
    const messages: ConversationMessage[] = [];

    if (this.systemMessage) {
      messages.push({
        role: "system",
        content: this.systemMessage,
      });
    }

    messages.push(...this.conversation);

    const payload: RequestPayload = {
      model: this.modelName,
      messages,
      ...this.modelParams,
    };

    if (this.responseFormat) {
      payload.response_format = this.responseFormat;
    }

    console.log("Building request payload:", {
      model: this.modelName,
      systemMessage: this.systemMessage,
      conversation: this.conversation,
      modelParams: this.modelParams,
      responseFormat: this.responseFormat,
    });

    return payload;
  }

  // Response Parsing Methods
  parseResponse<T>(response: ChatCompletionResponse): T {
    try {
      const content = response.choices[0].message.content;
      return JSON.parse(content) as T;
    } catch (error) {
      throw new OpenAIValidationError("Failed to parse response as JSON");
    }
  }

  async *streamResponse(stream: ReadableStream): AsyncGenerator<string, void, unknown> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine === "data: [DONE]") continue;

          try {
            const data = JSON.parse(trimmedLine.slice(6)); // Remove "data: " prefix
            const chunk = data as StreamChunk;
            const content = chunk.choices[0].delta.content;
            if (content) yield content;
          } catch {
            continue;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // Rate Limiting Methods
  private async enqueueRequest<T>(request: () => Promise<T>): Promise<T> {
    if (this.activeRequests >= this.rateLimitConfig.maxConcurrentRequests) {
      return new Promise((resolve, reject) => {
        this.requestQueue.push(async () => {
          try {
            resolve(await this.executeRequest(request));
          } catch (error) {
            reject(error);
          }
        });
      });
    }

    return this.executeRequest(request);
  }

  private async executeRequest<T>(request: () => Promise<T>): Promise<T> {
    this.activeRequests++;
    const startTime = Date.now();

    try {
      const result = await request();
      this.updateStats(startTime);
      return result;
    } catch (error) {
      this.handleRequestError(error, startTime);
      throw error;
    } finally {
      this.activeRequests--;
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.requestQueue.length === 0) return;
    if (this.activeRequests >= this.rateLimitConfig.maxConcurrentRequests) return;

    const nextRequest = this.requestQueue.shift();
    if (nextRequest) {
      await nextRequest();
    }
  }

  // Monitoring Methods
  private updateStats(startTime: number): void {
    const latency = Date.now() - startTime;
    this.stats.totalRequests++;
    this.stats.averageLatency =
      (this.stats.averageLatency * (this.stats.totalRequests - 1) + latency) / this.stats.totalRequests;
  }

  private handleRequestError(error: unknown, startTime: number): void {
    this.stats.totalErrors++;
    if (error instanceof OpenAIRateLimitError) {
      this.stats.rateLimitHits++;
    }
    this.updateStats(startTime);
  }

  getStats(): MonitoringStats {
    return { ...this.stats };
  }

  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      totalTokens: 0,
      totalErrors: 0,
      averageLatency: 0,
      rateLimitHits: 0,
    };
  }

  // Override existing API methods to use rate limiting
  async createChatCompletion(): Promise<ChatCompletionResponse> {
    return this.enqueueRequest(async () => {
      const payload = this.buildRequestPayload();

      try {
        const response = await this.makeApiRequest("/chat/completions", payload);
        const typedResponse = response as ChatCompletionResponse;
        this.stats.totalTokens += typedResponse.usage.prompt_tokens + typedResponse.usage.completion_tokens;
        return typedResponse;
      } catch (error) {
        this.handleApiError(error);
      }
    });
  }

  async createChatCompletionStream(): Promise<ReadableStream> {
    return this.enqueueRequest(async () => {
      const payload = this.buildRequestPayload();
      payload.stream = true;

      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new OpenAIApiError(
            `API returned error: ${response.status} ${response.statusText}`,
            response.status,
            errorData
          );
        }

        return response.body as ReadableStream;
      } catch (error) {
        this.handleApiError(error);
      }
    });
  }

  private async makeApiRequest(endpoint: string, payload: unknown): Promise<unknown> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 429) {
          throw new OpenAIRateLimitError("Rate limit exceeded", errorData);
        }

        throw new OpenAIApiError(
          `API returned error: ${response.status} ${response.statusText}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof OpenAIServiceError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        throw new OpenAITimeoutError();
      }

      throw new OpenAINetworkError("Failed to make API request", error as Error);
    }
  }

  private validateResponseFormat(format: ResponseFormatSchema): boolean {
    if (format.type !== "json_schema") {
      return false;
    }

    if (!format.json_schema || typeof format.json_schema !== "object") {
      return false;
    }

    if (format.json_schema.type !== "object") {
      return false;
    }

    if (!format.json_schema.properties || typeof format.json_schema.properties !== "object") {
      return false;
    }

    return true;
  }

  private handleApiError(error: unknown): never {
    if (error instanceof OpenAIServiceError) {
      throw error;
    }

    throw new OpenAIServiceError("Unexpected error during API call", "unknown_error", error as Error);
  }
}
