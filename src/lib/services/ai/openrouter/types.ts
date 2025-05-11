export interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  tool_call_id?: string;
}

export interface ResponseFormat {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: boolean;
    schema: object;
  };
}

export interface ChatResponse {
  id: string;
  model: string;
  choices: {
    message: Message;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatResponseChunk {
  id: string;
  model: string;
  choices: {
    delta: Partial<Message>;
    finish_reason: string | null;
  }[];
}

export interface CompletionResponse {
  id: string;
  model: string;
  choices: {
    text: string;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface CompletionResponseChunk {
  id: string;
  model: string;
  choices: {
    delta: { text: string };
    finish_reason: string | null;
  }[];
}

export interface ModelInfo {
  id: string;
  name: string;
  maxTokens: number;
  pricing: {
    prompt: number;
    completion: number;
  };
}

export interface UsageStats {
  requests: number;
  tokenCount: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;
}

export interface RequestOptions {
  method: string;
  headers: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}
