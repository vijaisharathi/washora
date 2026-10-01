/**
 * Normalized API error classes and discrimination helpers.
 */

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'INTERNAL_SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'CANCELLED'
  | 'UNKNOWN_ERROR';

export function mapStatusToErrorCode(status: number): ApiErrorCode {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'VALIDATION_ERROR';
    case 429:
      return 'RATE_LIMITED';
    case 502:
    case 503:
    case 504:
      return 'SERVICE_UNAVAILABLE';
    case 500:
      return 'INTERNAL_SERVER_ERROR';
    default:
      if (status >= 400 && status < 500) return 'BAD_REQUEST';
      if (status >= 500) return 'INTERNAL_SERVER_ERROR';
      return 'UNKNOWN_ERROR';
  }
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;
  readonly requestId?: string;

  constructor(
    message: string,
    status: number = 500,
    code?: string,
    details?: unknown,
    requestId?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code || mapStatusToErrorCode(status);
    this.details = details;
    this.requestId = requestId;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static networkError(originalError?: unknown, requestId?: string): ApiError {
    return new ApiError(
      'Unable to connect to WASHORA right now. Please check your internet connection and try again.',
      0,
      'NETWORK_ERROR',
      originalError,
      requestId
    );
  }

  static timeoutError(timeoutMs: number, requestId?: string): ApiError {
    return new ApiError(
      `Request timed out after ${timeoutMs}ms. Please try again.`,
      408,
      'TIMEOUT',
      { timeoutMs },
      requestId
    );
  }

  static cancelled(requestId?: string): ApiError {
    return new ApiError(
      'Request was cancelled.',
      0,
      'CANCELLED',
      undefined,
      requestId
    );
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isAuthError(error: unknown): boolean {
  return isApiError(error) && error.status === 401;
}

export function isForbiddenError(error: unknown): boolean {
  return isApiError(error) && error.status === 403;
}

export function isNotFoundError(error: unknown): boolean {
  return isApiError(error) && error.status === 404;
}

export function isValidationError(error: unknown): boolean {
  return (
    isApiError(error) &&
    (error.status === 422 || error.code === 'VALIDATION_ERROR' || error.status === 400)
  );
}

export function isNetworkError(error: unknown): boolean {
  return isApiError(error) && (error.code === 'NETWORK_ERROR' || error.status === 0);
}

export function isTimeoutError(error: unknown): boolean {
  return isApiError(error) && (error.code === 'TIMEOUT' || error.status === 408);
}
