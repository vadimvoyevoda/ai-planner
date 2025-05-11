export class OpenRouterError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export class AuthenticationError extends OpenRouterError {
  constructor(message: string, details?: any) {
    super(message, "authentication_error", details);
    this.name = "AuthenticationError";
  }
}

export class RateLimitError extends OpenRouterError {
  constructor(message: string, details?: any) {
    super(message, "rate_limit_error", details);
    this.name = "RateLimitError";
  }
}

export class QuotaExceededError extends OpenRouterError {
  constructor(message: string, details?: any) {
    super(message, "quota_exceeded_error", details);
    this.name = "QuotaExceededError";
  }
}

export class InvalidRequestError extends OpenRouterError {
  constructor(message: string, details?: any) {
    super(message, "invalid_request_error", details);
    this.name = "InvalidRequestError";
  }
}

export class ModelError extends OpenRouterError {
  constructor(message: string, details?: any) {
    super(message, "model_error", details);
    this.name = "ModelError";
  }
}

export class NetworkError extends OpenRouterError {
  constructor(message: string, details?: any) {
    super(message, "network_error", details);
    this.name = "NetworkError";
  }
}

export class TimeoutError extends OpenRouterError {
  constructor(message: string, details?: any) {
    super(message, "timeout_error", details);
    this.name = "TimeoutError";
  }
}

export class BudgetLimitError extends OpenRouterError {
  constructor(message: string, details?: any) {
    super(message, "budget_limit_error", details);
    this.name = "BudgetLimitError";
  }
}
