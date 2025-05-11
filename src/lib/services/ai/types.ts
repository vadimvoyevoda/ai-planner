export interface RateLimitConfig {
  maxRetries: number;
  retryDelay: number;
  maxConcurrentRequests: number;
}

export interface MonitoringStats {
  totalRequests: number;
  totalTokens: number;
  totalErrors: number;
  averageLatency: number;
  rateLimitHits: number;
}

export interface MessageContent {
  type: string;
  content: string | number | boolean | Record<string, unknown>;
}

export interface ConversationMessage {
  role: "system" | "user" | "assistant";
  content: string | MessageContent[];
}

export interface ModelParameters {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
}

export interface ModelCapabilityRequirements {
  minTokens?: number;
  features?: ("function_calling" | "json_mode" | "vision")[];
}

export interface ResponseFormatSchema {
  type: "json_schema";
  json_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface RequestPayload {
  model: string;
  messages: ConversationMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  response_format?: ResponseFormatSchema;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    delta: {
      content?: string;
      role?: string;
    };
    index: number;
    finish_reason: string | null;
  }[];
}
