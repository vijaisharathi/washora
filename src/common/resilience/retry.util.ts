export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  jitter?: boolean;
  retryIf?: (error: any) => boolean;
}

export function isRetryableError(error: any): boolean {
  if (!error) return false;

  // Network level errors
  const networkCodes = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED', 'EAI_AGAIN'];
  if (networkCodes.includes(error.code)) {
    return true;
  }

  // HTTP status codes: 429, 502, 503, 504 are retryable
  const status = error.status || error.statusCode || error.response?.status;
  if (status) {
    if (status === 429 || status === 502 || status === 503 || status === 504) {
      return true;
    }
    // 4xx client errors are non-retryable
    if (status >= 400 && status < 500) {
      return false;
    }
  }

  return false;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 200;
  const maxDelayMs = options.maxDelayMs ?? 2000;
  const backoffFactor = options.backoffFactor ?? 2;
  const jitter = options.jitter ?? true;
  const retryIf = options.retryIf ?? isRetryableError;

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (err: any) {
      lastError = err;

      if (attempt >= maxAttempts || !retryIf(err)) {
        throw err;
      }

      // Calculate exponential backoff
      let delay = Math.min(baseDelayMs * Math.pow(backoffFactor, attempt - 1), maxDelayMs);
      if (jitter) {
        delay = delay * (0.5 + Math.random() * 0.5);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
