# OpenAI Platform Service Implementation Plan

## 1. Opis usługi

`OpenAIService` to klasa odpowiedzialna za komunikację z OpenAI API, umożliwiająca aplikacji korzystanie z modeli języka (LLM) w celu generowania odpowiedzi tekstowych i strukturyzowanych. Serwis zarządza całym cyklem życia zapytań do API, od konstruowania zapytania po przetwarzanie odpowiedzi.

## 2. Opis konstruktora

```typescript
constructor(
  apiKey: string,
  options?: {
    defaultModel?: string;
    defaultParams?: ModelParameters;
    baseUrl?: string;
    timeout?: number;
  }
)
```

Parametry:
- `apiKey`: Klucz API do autoryzacji zapytań do OpenAI API
- `options.defaultModel`: Domyślny model do użycia (np. "gpt-4o-mini")
- `options.defaultParams`: Domyślne parametry modelu
- `options.baseUrl`: Opcjonalny niestandardowy URL do API OpenAI
- `options.timeout`: Limit czasu zapytania w milisekundach (domyślnie 30000)

## 3. Publiczne metody i pola

### 3.1. Konfiguracja konwersacji

```typescript
setSystemMessage(message: string): void
```
Ustawia komunikat systemowy, który definiuje zachowanie i kontekst asystenta.

```typescript
addUserMessage(message: string | Array<{type: string, content: any}>): void
```
Dodaje wiadomość użytkownika do konwersacji. Obsługuje zarówno proste teksty, jak i złożone wiadomości z różnymi typami zawartości.

```typescript
addAssistantMessage(message: string): void
```
Dodaje poprzednią wiadomość asystenta do kontekstu konwersacji.

```typescript
clearConversation(): void
```
Czyści historię konwersacji, zachowując komunikat systemowy.

### 3.2. Konfiguracja modelu

```typescript
setModel(modelName: string): void
```
Ustawia model do użycia w zapytaniach.

```typescript
setModelByCapability(requirements: ModelCapabilityRequirements): void
```
Wybiera odpowiedni model na podstawie wymaganych możliwości.

```typescript
setParameters(params: ModelParameters): void
```
Konfiguruje parametry modelu (temperature, top_p, itp.).

```typescript
setParameterPreset(presetName: "balanced" | "creative" | "precise"): void
```
Stosuje predefiniowany zestaw parametrów.

### 3.3. Konfiguracja odpowiedzi

```typescript
setResponseFormat(format: string | ResponseFormatSchema): void
```
Konfiguruje format odpowiedzi, obsługując predefiniowane schematy lub niestandardowe definicje schema JSON.

### 3.4. Wykonywanie zapytań

```typescript
async createChatCompletion(): Promise<ChatCompletionResponse>
```
Wysyła zapytanie o uzupełnienie czatu do API i zwraca pełną odpowiedź.

```typescript
async createChatCompletionStream(): Promise<ReadableStream>
```
Wysyła zapytanie o uzupełnienie czatu w trybie strumieniowym i zwraca strumień odpowiedzi.

```typescript
async createEmbedding(text: string): Promise<number[]>
```
Generuje embedding wektorowy dla podanego tekstu.

### 3.5. Obsługa odpowiedzi

```typescript
parseResponse<T>(response: ChatCompletionResponse): T
```
Przetwarza odpowiedź z API zgodnie z określonym schematem formatowania.

## 4. Prywatne metody i pola

```typescript
private apiKey: string
```
Przechowuje klucz API.

```typescript
private modelName: string
```
Aktualnie wybrany model.

```typescript
private modelParams: ModelParameters
```
Aktualne parametry modelu.

```typescript
private systemMessage: string | null
```
Komunikat systemowy określający rolę asystenta.

```typescript
private conversation: Array<{role: "system" | "user" | "assistant", content: any}>
```
Historia konwersacji.

```typescript
private responseFormat: ResponseFormatSchema | null
```
Format odpowiedzi dla modelu.

```typescript
private buildRequestPayload(): RequestPayload
```
Buduje pełny payload zapytania dla API.

```typescript
private validateResponseFormat(format: ResponseFormatSchema): boolean
```
Sprawdza poprawność schematu formatu odpowiedzi.

```typescript
private handleApiError(error: any): never
```
Obsługuje błędy zwrócone przez API.

```typescript
private async makeApiRequest(endpoint: string, payload: any): Promise<any>
```
Wykonuje podstawowe zapytanie HTTP do API OpenAI.

## 5. Obsługa błędów

### 5.1. Hierarchia błędów

```typescript
class OpenAIServiceError extends Error {
  constructor(message: string, public code: string, public cause?: Error) {
    super(message);
    this.name = "OpenAIServiceError";
  }
}

class OpenAIApiError extends OpenAIServiceError {
  constructor(message: string, public statusCode: number, public responseBody: any) {
    super(message, `api_error_${statusCode}`);
    this.name = "OpenAIApiError";
  }
}

class OpenAIRateLimitError extends OpenAIApiError {
  constructor(message: string, responseBody: any) {
    super(message, 429, responseBody);
    this.name = "OpenAIRateLimitError";
  }
}

// Kolejne klasy błędów...
```

### 5.2. Scenariusze błędów

1. **Błędy autentykacji** (nieprawidłowy klucz API, niewystarczające uprawnienia)
2. **Błędy formatowania zapytań** (nieprawidłowy JSON, nieprawidłowe parametry)
3. **Ograniczenia szybkości i limitu** (przekroczenie limitu zapytań)
4. **Błędy sieci i połączenia** (timeout, problemy z siecią)
5. **Błędy specyficzne dla modelu** (naruszenia zasad treści, przekroczenie długości kontekstu)
6. **Błędy przetwarzania odpowiedzi** (nieprawidłowe odpowiedzi, błędy walidacji schematu)
7. **Błędy przekroczenia czasu** (timeout na zapytanie)
8. **Nieoczekiwane błędy serwera** (błędy 5xx z API)

## 6. Kwestie bezpieczeństwa

### 6.1. Zabezpieczanie kluczy API
- Przechowywać klucz API w zmiennych środowiskowych
- Nie zapisywać kluczy API w kodzie źródłowym
- Rozważyć użycie usługi zarządzania sekretami (np. DigitalOcean Secrets)

### 6.2. Sanityzacja danych wejściowych
- Sprawdzać i czyścić dane wejściowe od użytkowników
- Zapobiegać atakom przez wstrzykiwanie promptów

### 6.3. Ograniczenia użycia
- Ustanowić limity zapytań na użytkownika
- Monitorować zużycie tokenów dla kontroli kosztów

### 6.4. Walidacja odpowiedzi
- Zawsze walidować odpowiedzi przed ich wykorzystaniem w aplikacji
- Nie ufać bezpośrednio treści generowanej przez model

## 7. Plan wdrożenia krok po kroku

### Krok 1: Utwórz strukturę plików

```
src/
  lib/
    openai/
      OpenAIService.ts
      types.ts
      errors.ts
      modelRegistry.ts
      utils.ts
```

### Krok 2: Zdefiniuj typy i interfejsy

W pliku `src/lib/openai/types.ts`:

```typescript
export interface ModelParameters {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  // inne parametry...
}

export interface ModelCapabilityRequirements {
  minTokens?: number;
  features?: Array<"function_calling" | "json_mode" | "vision">;
  // inne wymagania...
}

export interface ResponseFormatSchema {
  type: 'json_schema';
  json_schema: {
    name: string;
    strict: boolean;
    schema: Record<string, any>;
  }
}

export interface RequestPayload {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: any;
  }>;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  response_format?: ResponseFormatSchema;
  // inne pola...
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

### Krok 3: Zdefiniuj klasy błędów

W pliku `src/lib/openai/errors.ts`:

```typescript
export class OpenAIServiceError extends Error {
  constructor(message: string, public code: string, public cause?: Error) {
    super(message);
    this.name = "OpenAIServiceError";
  }
}

export class OpenAIApiError extends OpenAIServiceError {
  constructor(message: string, public statusCode: number, public responseBody: any) {
    super(message, `api_error_${statusCode}`);
    this.name = "OpenAIApiError";
  }
}

export class OpenAIRateLimitError extends OpenAIApiError {
  constructor(message: string, responseBody: any) {
    super(message, 429, responseBody);
    this.name = "OpenAIRateLimitError";
  }
}

// Zdefiniuj pozostałe klasy błędów...
```

### Krok 4: Utwórz rejestr modeli

W pliku `src/lib/openai/modelRegistry.ts`:

```typescript
import type { ModelCapabilityRequirements } from './types';

interface ModelInfo {
  name: string;
  maxTokens: number;
  features: Array<"function_calling" | "json_mode" | "vision">;
}

const MODEL_REGISTRY: Record<string, ModelInfo> = {
  "gpt-3.5-turbo": {
    name: "gpt-3.5-turbo",
    maxTokens: 4096,
    features: ["function_calling", "json_mode"]
  },
  "gpt-4o": {
    name: "gpt-4o",
    maxTokens: 8192,
    features: ["function_calling", "json_mode", "vision"]
  },
  // Dodaj więcej modeli...
};

export function findModelByCapabilities(requirements: ModelCapabilityRequirements): string {
  const candidates = Object.values(MODEL_REGISTRY).filter(model => {
    if (requirements.minTokens && model.maxTokens < requirements.minTokens) {
      return false;
    }
    
    if (requirements.features && !requirements.features.every(feature => 
      model.features.includes(feature))) {
      return false;
    }
    
    return true;
  });
  
  if (candidates.length === 0) {
    throw new Error("No model matches the specified requirements");
  }
  
  // Zwróć model z największą ilością tokenów lub najlepszy model
  return candidates.sort((a, b) => b.maxTokens - a.maxTokens)[0].name;
}

export function getModelInfo(modelName: string): ModelInfo {
  if (!MODEL_REGISTRY[modelName]) {
    throw new Error(`Unknown model: ${modelName}`);
  }
  return MODEL_REGISTRY[modelName];
}
```

### Krok 5: Zaimplementuj klasę OpenAIService

W pliku `src/lib/openai/OpenAIService.ts`:

```typescript
import type {
  ModelParameters,
  ModelCapabilityRequirements,
  ResponseFormatSchema,
  RequestPayload,
  ChatCompletionResponse
} from './types';
import { OpenAIServiceError, OpenAIApiError, OpenAIRateLimitError } from './errors';
import { findModelByCapabilities, getModelInfo } from './modelRegistry';

export class OpenAIService {
  private apiKey: string;
  private modelName: string;
  private modelParams: ModelParameters;
  private systemMessage: string | null = null;
  private conversation: Array<{role: "system" | "user" | "assistant", content: any}> = [];
  private responseFormat: ResponseFormatSchema | null = null;
  private baseUrl: string;
  private timeout: number;

  constructor(
    apiKey: string,
    options?: {
      defaultModel?: string;
      defaultParams?: ModelParameters;
      baseUrl?: string;
      timeout?: number;
    }
  ) {
    if (!apiKey) {
      throw new OpenAIServiceError("API key is required", "missing_api_key");
    }
    
    this.apiKey = apiKey;
    this.modelName = options?.defaultModel || "gpt-3.5-turbo";
    this.modelParams = options?.defaultParams || {
      temperature: 0.7,
      top_p: 1,
      max_tokens: 1000
    };
    this.baseUrl = options?.baseUrl || "https://api.openai.com/v1";
    this.timeout = options?.timeout || 30000;
  }

  setSystemMessage(message: string): void {
    this.systemMessage = message;
  }

  addUserMessage(message: string | Array<{type: string, content: any}>): void {
    this.conversation.push({
      role: "user",
      content: message
    });
  }

  addAssistantMessage(message: string): void {
    this.conversation.push({
      role: "assistant",
      content: message
    });
  }

  clearConversation(): void {
    this.conversation = [];
  }

  setModel(modelName: string): void {
    try {
      getModelInfo(modelName); // Sprawdź, czy model istnieje
      this.modelName = modelName;
    } catch (error) {
      throw new OpenAIServiceError(`Invalid model: ${modelName}`, "invalid_model");
    }
  }

  setModelByCapability(requirements: ModelCapabilityRequirements): void {
    try {
      const modelName = findModelByCapabilities(requirements);
      this.modelName = modelName;
    } catch (error) {
      throw new OpenAIServiceError("Failed to find suitable model", "model_selection_failed", error as Error);
    }
  }

  setParameters(params: ModelParameters): void {
    this.modelParams = {
      ...this.modelParams,
      ...params
    };
  }

  setParameterPreset(presetName: "balanced" | "creative" | "precise"): void {
    switch (presetName) {
      case "balanced":
        this.modelParams = {
          temperature: 0.7,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0
        };
        break;
      case "creative":
        this.modelParams = {
          temperature: 0.9,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.6
        };
        break;
      case "precise":
        this.modelParams = {
          temperature: 0.2,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0
        };
        break;
    }
  }

  setResponseFormat(format: string | ResponseFormatSchema): void {
    if (typeof format === 'string') {
      // Obsługa predefiniowanych formatów
      switch(format) {
        case "json":
          this.responseFormat = {
            type: 'json_schema',
            json_schema: {
              name: "generic_json",
              strict: true,
              schema: { type: "object" }
            }
          };
          break;
        // Dodaj więcej predefiniowanych formatów
        default:
          throw new OpenAIServiceError(`Unknown predefined format: ${format}`, "invalid_format");
      }
    } else {
      // Niestandardowy schemat JSON
      if (this.validateResponseFormat(format)) {
        this.responseFormat = format;
      } else {
        throw new OpenAIServiceError("Invalid response format schema", "invalid_format");
      }
    }
  }

  private validateResponseFormat(format: ResponseFormatSchema): boolean {
    // Podstawowa walidacja schematu formatu odpowiedzi
    if (format.type !== 'json_schema') {
      return false;
    }
    
    if (!format.json_schema || typeof format.json_schema !== 'object') {
      return false;
    }
    
    if (!format.json_schema.schema || typeof format.json_schema.schema !== 'object') {
      return false;
    }
    
    return true;
  }

  private buildRequestPayload(): RequestPayload {
    // Tworzymy pełny payload z wiadomościami i parametrami
    const messages = [];
    
    if (this.systemMessage) {
      messages.push({
        role: "system",
        content: this.systemMessage
      });
    }
    
    // Dodaj resztę konwersacji
    messages.push(...this.conversation);
    
    const payload: RequestPayload = {
      model: this.modelName,
      messages,
      ...this.modelParams
    };
    
    if (this.responseFormat) {
      payload.response_format = this.responseFormat;
    }
    
    return payload;
  }

  async createChatCompletion(): Promise<ChatCompletionResponse> {
    const payload = this.buildRequestPayload();
    
    try {
      return await this.makeApiRequest('/chat/completions', payload);
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async createChatCompletionStream(): Promise<ReadableStream> {
    const payload = this.buildRequestPayload();
    payload['stream'] = true;
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.timeout)
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
  }

  async createEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.makeApiRequest('/embeddings', {
        model: "text-embedding-ada-002", // Używamy standardowego modelu dla embeddingów
        input: text
      });
      
      return response.data[0].embedding;
    } catch (error) {
      this.handleApiError(error);
    }
  }

  parseResponse<T>(response: ChatCompletionResponse): T {
    try {
      const content = response.choices[0].message.content;
      return JSON.parse(content) as T;
    } catch (error) {
      throw new OpenAIServiceError(
        "Failed to parse response as JSON",
        "parse_error",
        error as Error
      );
    }
  }

  private async makeApiRequest(endpoint: string, payload: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.timeout)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Obsługa różnych kodów błędów
        if (response.status === 429) {
          throw new OpenAIRateLimitError(
            "Rate limit exceeded",
            errorData
          );
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
      
      if (error instanceof TypeError && error.message.includes('timeout')) {
        throw new OpenAIServiceError(
          "Request timed out",
          "timeout",
          error
        );
      }
      
      throw new OpenAIServiceError(
        "Failed to make API request",
        "network_error",
        error as Error
      );
    }
  }

  private handleApiError(error: any): never {
    if (error instanceof OpenAIServiceError) {
      throw error;
    }
    
    throw new OpenAIServiceError(
      "Unexpected error during API call",
      "unknown_error",
      error
    );
  }
}
```

### Krok 6: Utworzenie punktu wejścia dla eksportu

W pliku `src/lib/openai/index.ts`:

```typescript
export { OpenAIService } from './OpenAIService';
export type {
  ModelParameters,
  ModelCapabilityRequirements,
  ResponseFormatSchema,
  RequestPayload,
  ChatCompletionResponse
} from './types';
export {
  OpenAIServiceError,
  OpenAIApiError,
  OpenAIRateLimitError
} from './errors';
```

### Krok 7: Konfiguracja środowiska

1. Dodaj klucz API OpenAI do zmiennych środowiskowych w pliku `.env`:

```
PLATFORM_OPENAI_KEY=your_api_key_here
```

2. Zaktualizuj plik `.gitignore`, aby upewnić się, że `.env` nie jest uwzględniony w repozytorium:

```
.env
```

### Krok 8: Przykład użycia

```typescript
import { OpenAIService } from '../lib/openai';

// Inicjalizacja serwisu
const openaiService = new OpenAIService(import.meta.env.PLATFORM_OPENAI_KEY, {
  defaultModel: "gpt-4o-mini",
  defaultParams: {
    temperature: 0.7,
    max_tokens: 1000
  }
});

// Konfiguracja konwersacji
openaiService.setSystemMessage("Jesteś pomocnym asystentem, który pomaga użytkownikom planować ich harmonogram.");

// Dodanie wiadomości użytkownika
openaiService.addUserMessage("Potrzebuję zaplanować spotkanie na przyszły tydzień.");

// Konfiguracja formatu odpowiedzi
openaiService.setResponseFormat({
  type: 'json_schema',
  json_schema: {
    name: "meeting_suggestion",
    strict: true,
    schema: {
      type: "object",
      properties: {
        suggestedDates: {
          type: "array",
          items: {
            type: "object",
            properties: {
              date: { type: "string", format: "date" },
              time: { type: "string", format: "time" },
              duration: { type: "integer", minimum: 15 }
            },
            required: ["date", "time", "duration"]
          }
        },
        notes: { type: "string" }
      },
      required: ["suggestedDates"]
    }
  }
});

// Uzyskanie odpowiedzi
try {
  const response = await openaiService.createChatCompletion();
  const parsedResponse = openaiService.parseResponse(response);
  
  console.log("Sugerowane terminy spotkań:", parsedResponse.suggestedDates);
} catch (error) {
  console.error("Wystąpił błąd:", error);
}
```

### Krok 9: Monitorowanie i logowanie

Dodaj system monitorowania i logowania, aby śledzić użycie API i koszty:

```typescript
import { OpenAIService } from '../lib/openai';
import { logger } from '../lib/logger'; // Zakładamy, że istnieje logger

export class MonitoredOpenAIService extends OpenAIService {
  async createChatCompletion() {
    const startTime = Date.now();
    try {
      const response = await super.createChatCompletion();
      
      // Loguj sukces i zużycie tokenów
      logger.info('OpenAI API call successful', {
        model: response.model,
        tokensUsed: response.usage.total_tokens,
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        latency: Date.now() - startTime
      });
      
      return response;
    } catch (error) {
      // Loguj błędy
      logger.error('OpenAI API call failed', {
        error: error.message,
        code: error.code,
        latency: Date.now() - startTime
      });
      
      throw error;
    }
  }
}
``` 