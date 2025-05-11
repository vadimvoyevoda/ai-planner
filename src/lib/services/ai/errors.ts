export class OpenAIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: Error
  ) {
    super(message);
    this.name = "OpenAIServiceError";
  }
}

export class OpenAIApiError extends OpenAIServiceError {
  constructor(
    message: string,
    public statusCode: number,
    public responseBody: any
  ) {
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

export class OpenAITimeoutError extends OpenAIServiceError {
  constructor(message = "Request timed out") {
    super(message, "timeout");
    this.name = "OpenAITimeoutError";
  }
}

export class OpenAINetworkError extends OpenAIServiceError {
  constructor(message = "Network error occurred", cause?: Error) {
    super(message, "network_error", cause);
    this.name = "OpenAINetworkError";
  }
}

export class OpenAIValidationError extends OpenAIServiceError {
  constructor(message: string) {
    super(message, "validation_error");
    this.name = "OpenAIValidationError";
  }
}
