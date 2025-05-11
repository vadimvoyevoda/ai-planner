# OpenRouter Service Implementation Plan

## 1. Opis usługi

OpenRouter to serwis, który umożliwia dostęp do różnych modeli AI (OpenAI, Anthropic, Google i inne) poprzez jednolite API. Niniejszy plan opisuje implementację usługi do komunikacji z API OpenRouter w celu integracji z czatami opartymi na LLM w aplikacji.

## 2. Opis konstruktora

```typescript
class OpenRouterService {
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
    // Inicjalizacja serwisu
  }
}
```

Konstruktor przyjmuje obiekt konfiguracyjny z następującymi polami:
- `apiKey` (wymagane): Klucz API dla OpenRouter
- `defaultModel` (opcjonalne): Domyślny model do użycia, jeśli nie określono inaczej
- `baseUrl` (opcjonalne): Alternatywny URL bazowy API
- `timeout` (opcjonalne): Limit czasu dla żądań w milisekundach
- `retryConfig` (opcjonalne): Konfiguracja mechanizmu ponawiania żądań
- `budgetLimits` (opcjonalne): Limity budżetowe dla monitorowania kosztów

## 3. Publiczne metody i pola

### 3.1. Metody komunikacji z modelem

```typescript
async chat(options: {
  messages: Message[];
  model?: string;
  responseFormat?: ResponseFormat;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  onProgress?: (chunk: ChatResponseChunk) => void;
}): Promise<ChatResponse>
```

Główna metoda do komunikacji z modelem. Obsługuje zarówno standardowe jak i strumieniowe odpowiedzi.

```typescript
async completions(options: {
  prompt: string;
  model?: string;
  responseFormat?: ResponseFormat;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  onProgress?: (chunk: CompletionResponseChunk) => void;
}): Promise<CompletionResponse>
```

Alternatywna metoda dla prostszych przypadków, gdzie nie jest potrzebny format konwersacji.

### 3.2. Metody konfiguracji

```typescript
setDefaultModel(model: string): void
```

Ustawia domyślny model dla wszystkich przyszłych żądań.

```typescript
setSystemMessage(systemMessage: string): void
```

Ustawia domyślną wiadomość systemową dla wszystkich przyszłych czatów.

```typescript
createResponseFormat(schema: object, name?: string): ResponseFormat
```

Tworzy obiekt formatu odpowiedzi do użycia w żądaniach.

### 3.3. Metody pomocnicze

```typescript
estimateTokens(text: string): number
```

Szacuje liczbę tokenów dla danego tekstu.

```typescript
getModelInfo(model: string): ModelInfo | null
```

Zwraca informacje o konkretnym modelu, w tym limity tokenów i koszty.

```typescript
getUsageStats(): UsageStats
```

Zwraca statystyki użycia, w tym koszt, liczbę żądań i tokenów.

## 4. Prywatne metody i pola

### 4.1. Komunikacja z API

```typescript
private async makeRequest(endpoint: string, options: RequestOptions): Promise<any>
```

Bazowa metoda do komunikacji z API OpenRouter.

```typescript
private async handleStreamingResponse(response: Response, onProgress: Function): Promise<any>
```

Obsługuje odpowiedzi strumieniowe z API.

### 4.2. Zarządzanie błędami

```typescript
private handleApiError(error: any): never
```

Przetwarza błędy z API i rzuca odpowiednie wyjątki.

### 4.3. Zarządzanie budżetem

```typescript
private trackUsage(model: string, inputTokens: number, outputTokens: number): void
```

Śledzi wykorzystanie usługi do celów budżetowania.

```typescript
private checkBudgetLimits(): void
```

Sprawdza, czy obecne wykorzystanie nie przekracza ustawionych limitów budżetowych.

## 5. Obsługa błędów

### 5.1. Typy błędów

```typescript
class OpenRouterError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

class AuthenticationError extends OpenRouterError { /* ... */ }
class RateLimitError extends OpenRouterError { /* ... */ }
class QuotaExceededError extends OpenRouterError { /* ... */ }
class InvalidRequestError extends OpenRouterError { /* ... */ }
class ModelError extends OpenRouterError { /* ... */ }
class NetworkError extends OpenRouterError { /* ... */ }
class TimeoutError extends OpenRouterError { /* ... */ }
class BudgetLimitError extends OpenRouterError { /* ... */ }
```

### 5.2. Strategia obsługi błędów

1. Wczesne wykrywanie błędów (walidacja parametrów przed żądaniem)
2. Automatyczne ponawianie w przypadku tymczasowych błędów
3. Szczegółowe komunikaty błędów z sugestiami rozwiązań
4. Logging błędów z kontekstem dla łatwiejszego debugowania

## 6. Kwestie bezpieczeństwa

### 6.1. Zarządzanie kluczem API

1. Przechowywanie klucza API w zmiennych środowiskowych
2. Nigdy nie umieszczanie klucza API w kodzie źródłowym ani konfiguracji frontendowej
3. Wykorzystanie middleware do bezpiecznego przekazywania zapytań do OpenRouter

### 6.2. Sanityzacja danych

1. Walidacja wszystkich danych wejściowych przed wysłaniem do API
2. Zapobieganie wstrzykiwaniom prompt poprzez filtrowanie niebezpiecznych wzorców
3. Ograniczenie długości prompta, aby unikać nadmiernych kosztów

### 6.3. Kontrola dostępu

1. Implementacja limitów dostępu dla użytkowników
2. Monitorowanie kosztów i użycia na poziomie użytkownika
3. Opcjonalne wymuszanie zatwierdzenia dla kosztownych operacji

## 7. Plan wdrożenia krok po kroku

### 7.1. Ustawienie infrastruktury

1. Utwórz katalog `src/lib/openrouter` do przechowywania kodu usługi
2. Dodaj zmienne środowiskowe w pliku `.env`:
   ```
   OPENROUTER_API_KEY=your_api_key
   OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
   OPENROUTER_DEFAULT_MODEL=anthropic/claude-3-sonnet
   OPENROUTER_BUDGET_DAILY=10
   OPENROUTER_BUDGET_MONTHLY=100
   ```
3. Zaktualizuj metadane w `astro.config.mjs` lub `package.json` zgodnie z potrzebami

### 7.2. Implementacja typów

Utwórz plik `src/lib/openrouter/types.ts`:

```typescript
export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  tool_call_id?: string;
}

export interface ResponseFormat {
  type: 'json_schema';
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
```

### 7.3. Implementacja głównej usługi

Utwórz plik `src/lib/openrouter/service.ts`:

```typescript
import type { 
  Message, 
  ResponseFormat, 
  ChatResponse, 
  ChatResponseChunk,
  ModelInfo,
  UsageStats
} from './types';

export class OpenRouterError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

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
  private systemMessage: string = '';
  private usageStats: UsageStats = {
    requests: 0,
    tokenCount: {
      prompt: 0,
      completion: 0,
      total: 0
    },
    cost: 0
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
    this.baseUrl = options.baseUrl || 'https://openrouter.ai/api/v1';
    this.defaultModel = options.defaultModel || 'anthropic/claude-3-sonnet';
    this.timeout = options.timeout || 30000;
    this.retryConfig = options.retryConfig || {
      maxRetries: 3,
      initialDelay: 1000,
      backoffFactor: 2
    };
    this.budgetLimits = options.budgetLimits;
  }

  // Implementacja metod publicznych i prywatnych...
}
```

### 7.4. Implementacja metod komunikacyjnych

Uzupełnij klasę `OpenRouterService` o metody do komunikacji z API:

```typescript
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
  if (this.systemMessage && !messages.some(m => m.role === 'system')) {
    messages.unshift({ role: 'system', content: this.systemMessage });
  }

  // Przygotowanie danych żądania
  const requestData = {
    model: options.model || this.defaultModel,
    messages,
    temperature: options.temperature,
    max_tokens: options.maxTokens,
    response_format: options.responseFormat,
    stream: options.stream
  };

  try {
    if (options.stream && options.onProgress) {
      return await this.makeStreamingRequest('/chat/completions', requestData, options.onProgress);
    } else {
      return await this.makeRequest('/chat/completions', requestData);
    }
  } catch (error) {
    this.handleApiError(error);
  }
}

private async makeRequest(endpoint: string, data: any): Promise<any> {
  let retries = 0;
  let delay = this.retryConfig.initialDelay;

  while (true) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new OpenRouterError(
          errorData.error?.message || `HTTP error ${response.status}`,
          `api_error_${response.status}`,
          errorData
        );
      }

      const result = await response.json();
      
      // Aktualizacja statystyk użycia
      this.trackUsage(
        data.model,
        result.usage?.prompt_tokens || 0,
        result.usage?.completion_tokens || 0
      );

      return result;
    } catch (error: any) {
      // Jeśli to ostatnia próba lub błąd nie jest tymczasowy, rzuć go dalej
      if (
        retries >= this.retryConfig.maxRetries ||
        !this.isRetryableError(error)
      ) {
        throw error;
      }

      // Czekaj przed kolejną próbą
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Zwiększ opóźnienie dla następnej próby
      delay *= this.retryConfig.backoffFactor;
      retries++;
    }
  }
}

private async makeStreamingRequest(endpoint: string, data: any, onProgress: Function): Promise<any> {
  // Implementacja obsługi odpowiedzi strumieniowej
  // ...
}
```

### 7.5. Implementacja endpoint API

Utwórz plik `src/pages/api/chat.ts`:

```typescript
import type { APIRoute } from 'astro';
import { OpenRouterService } from '../../lib/openrouter/service';

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    // Pobierz dane żądania
    const requestData = await request.json();
    
    // Utwórz instancję usługi
    const openRouterService = new OpenRouterService({
      apiKey: import.meta.env.OPENROUTER_API_KEY,
      defaultModel: import.meta.env.OPENROUTER_DEFAULT_MODEL,
      budgetLimits: {
        daily: Number(import.meta.env.OPENROUTER_BUDGET_DAILY),
        monthly: Number(import.meta.env.OPENROUTER_BUDGET_MONTHLY)
      }
    });
    
    // Wywołaj API OpenRouter
    const response = await openRouterService.chat({
      messages: requestData.messages,
      model: requestData.model,
      responseFormat: requestData.responseFormat,
      temperature: requestData.temperature,
      maxTokens: requestData.maxTokens
    });
    
    // Zwróć odpowiedź
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    // Obsługa błędów
    return new Response(
      JSON.stringify({
        error: {
          message: error.message || 'Unknown error',
          code: error.code || 'unknown_error',
          details: error.details
        }
      }),
      {
        status: error.code?.includes('401') ? 401 :
                error.code?.includes('429') ? 429 :
                error.code?.includes('400') ? 400 : 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};
```

### 7.6. Implementacja komponentu React

Utwórz plik `src/components/ChatInterface.tsx`:

```tsx
import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          model: 'anthropic/claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 1000
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.choices[0].message.content
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <Card key={index} className={`p-3 ${message.role === 'user' ? 'bg-blue-50' : 'bg-gray-50'}`}>
            <div className="font-semibold">
              {message.role === 'user' ? 'You' : 'Assistant'}:
            </div>
            <div className="mt-1 whitespace-pre-wrap">{message.content}</div>
          </Card>
        ))}
        {isLoading && (
          <Card className="p-3 bg-gray-50">
            <div className="animate-pulse">Assistant is typing...</div>
          </Card>
        )}
      </div>
      
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button 
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### 7.7. Przykład użycia Response Format

Aby wykorzystać strukturyzowane odpowiedzi przy pomocy `response_format`, rozszerz endpoint API:

```typescript
// W src/pages/api/structured-chat.ts

import type { APIRoute } from 'astro';
import { OpenRouterService } from '../../lib/openrouter/service';

export const POST: APIRoute = async ({ request }) => {
  try {
    const requestData = await request.json();
    const openRouterService = new OpenRouterService({
      apiKey: import.meta.env.OPENROUTER_API_KEY
    });
    
    // Przykład schematu JSON dla strukturyzowanej odpowiedzi
    const responseFormat = {
      type: 'json_schema',
      json_schema: {
        name: 'event',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            location: { type: 'string' },
            participants: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['title', 'startTime', 'endTime']
        }
      }
    };
    
    const response = await openRouterService.chat({
      messages: requestData.messages,
      model: requestData.model || 'anthropic/claude-3-opus',
      responseFormat: responseFormat,
      temperature: 0.2  // Niższa temperatura dla bardziej deterministycznych odpowiedzi
    });
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: {
          message: error.message || 'Unknown error',
          code: error.code || 'unknown_error'
        }
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
```

### 7.8. Testowanie i uruchomienie

1. Wykonaj testy jednostkowe dla usługi OpenRouter
2. Zintegruj komponent ChatInterface z główną aplikacją
3. Monitoruj wykorzystanie API i koszty
4. Skaluj rozwiązanie w miarę potrzeb 