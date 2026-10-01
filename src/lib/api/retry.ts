/**
 * Transient retry policy for the WASHORA API client.
 * Strictly avoids retrying non-idempotent mutations without idempotency keys.
 */

import { isApiError } from './errors';

export interface RetryEvaluationParams {
  method: string;
  attempt: number;
  maxAttempts?: number;
  status?: number;
  error?: unknown;
  hasIdempotencyKey?: boolean;
}

const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const RETRYABLE_STATUS_CODES = new Set([408, 500, 502, 503, 504]);

export function shouldRetryRequest({
  method,
  attempt,
  maxAttempts = 2,
  status,
  error,
  hasIdempotencyKey = false,
}: RetryEvaluationParams): boolean {
  if (attempt >= maxAttempts) {
    return false;
  }

  // Idempotency check: mutations are strictly prohibited unless protected by idempotency key
  const isIdempotent = IDEMPOTENT_METHODS.has(method.toUpperCase()) || hasIdempotencyKey;
  if (!isIdempotent) {
    return false;
  }

  // Network/connection failures with no response status are retryable
  if (status === 0 || (isApiError(error) && error.code === 'NETWORK_ERROR')) {
    return true;
  }

  // Explicit status check: only retry transient 5xx / timeout
  if (status && RETRYABLE_STATUS_CODES.has(status)) {
    return true;
  }

  return false;
}

export function calculateBackoffDelay(
  attempt: number,
  baseDelayMs: number = 300,
  maxDelayMs: number = 2000
): number {
  const exponential = baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * 100;
  return Math.min(exponential + jitter, maxDelayMs);
}
