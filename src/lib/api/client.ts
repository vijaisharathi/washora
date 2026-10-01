/**
 * WASHORA Canonical HTTP / API Client.
 * Implements fetch with request IDs, token injection, single-flight 401 refresh,
 * organization headers, timeouts, AbortSignal cancellation, and retry policies.
 */

import { getApiUrl } from '@/config/env';
import {
  DEFAULT_HEADERS,
  DEFAULT_TIMEOUT_MS,
  AUTH_HEADER,
  ORG_HEADER,
  IDEMPOTENCY_HEADER,
} from './config';
import { ApiError } from './errors';
import { generateRequestId, X_REQUEST_ID_HEADER } from './request-id';
import {
  resolveAccessToken,
  resolveOrganizationId,
  handleUnauthorizedRefresh,
} from './auth-interceptor';
import { shouldRetryRequest, calculateBackoffDelay } from './retry';
import type { RequestOptions, QueryParams } from './types';

function buildQueryString(params?: QueryParams): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item));
        }
      }
    } else {
      searchParams.append(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export class WashoraApiClient {
  /**
   * Primary request method handling all HTTP options, retries, and errors.
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const method = (options.method || 'GET').toUpperCase();
    const requestId = options.requestId || generateRequestId();
    const timeoutMs = options.timeout ?? DEFAULT_TIMEOUT_MS;
    const isAuthRequired = options.auth !== false;
    const maxRetryAttempts = typeof options.retry === 'number' ? options.retry : options.retry === false ? 0 : 2;

    const queryString = buildQueryString(options.params);
    const targetUrl = `${getApiUrl(endpoint)}${queryString}`;

    let attempt = 0;
    let is401Refreshed = false;

    while (true) {
      // 1. Setup AbortController for timeout + user signal linking
      const controller = new AbortController();
      let isTimeoutTriggered = false;
      const timerId = setTimeout(() => {
        isTimeoutTriggered = true;
        controller.abort();
      }, timeoutMs);

      // Link external abort signal if provided
      const userSignal = options.signal;
      const onUserAbort = () => controller.abort();
      if (userSignal) {
        if (userSignal.aborted) {
          clearTimeout(timerId);
          throw ApiError.cancelled(requestId);
        }
        userSignal.addEventListener('abort', onUserAbort);
      }

      // 2. Prepare headers
      const headers: Record<string, string> = {
        ...DEFAULT_HEADERS,
        [X_REQUEST_ID_HEADER]: requestId,
      };

      // Custom headers passed by user
      if (options.headers) {
        if (options.headers instanceof Headers) {
          options.headers.forEach((val, key) => {
            headers[key] = val;
          });
        } else if (typeof options.headers === 'object') {
          Object.assign(headers, options.headers);
        }
      }

      // Attach authentication token if needed
      if (isAuthRequired && !headers[AUTH_HEADER]) {
        const token = await resolveAccessToken();
        if (token) {
          headers[AUTH_HEADER] = `Bearer ${token}`;
        }
      }

      // Attach organization ID if available
      if (!headers[ORG_HEADER]) {
        const orgId = options.organizationId || (await resolveOrganizationId());
        if (orgId) {
          headers[ORG_HEADER] = orgId;
        }
      }

      // Attach idempotency key if specified
      if (options.idempotencyKey && !headers[IDEMPOTENCY_HEADER]) {
        headers[IDEMPOTENCY_HEADER] = options.idempotencyKey;
      }

      // 3. Serialize request body
      let bodyData: BodyInit | undefined = undefined;
      if (options.body !== undefined && options.body !== null) {
        if (
          typeof options.body === 'string' ||
          options.body instanceof FormData ||
          options.body instanceof Blob ||
          options.body instanceof URLSearchParams
        ) {
          bodyData = options.body as BodyInit;
        } else {
          bodyData = JSON.stringify(options.body);
        }
      }

      const fetchConfig: RequestInit = {
        method,
        headers,
        body: bodyData,
        signal: controller.signal,
      };

      try {
        const response = await fetch(targetUrl, fetchConfig);
        clearTimeout(timerId);
        if (userSignal) {
          userSignal.removeEventListener('abort', onUserAbort);
        }

        // 4. Handle 401 Unauthorized token refresh
        if (response.status === 401 && isAuthRequired && !is401Refreshed) {
          is401Refreshed = true;
          const newToken = await handleUnauthorizedRefresh();
          if (newToken) {
            // Retry request once with new token
            continue;
          }
        }

        // 5. Check if response is successful
        if (!response.ok) {
          let errorPayload: any = null;
          try {
            errorPayload = await response.json();
          } catch {
            // Ignore JSON parse failure on error body
          }

          const status = response.status;
          const errorCode = errorPayload?.error?.code || errorPayload?.code;
          const errorMessage =
            errorPayload?.error?.message ||
            errorPayload?.message ||
            `HTTP ${status}: ${response.statusText}`;
          const errorDetails = errorPayload?.error?.details || errorPayload?.details;
          const resRequestId = response.headers.get(X_REQUEST_ID_HEADER) || requestId;

          const errorInstance = new ApiError(
            errorMessage,
            status,
            errorCode,
            errorDetails,
            resRequestId
          );

          // Check if retryable transient error
          if (
            shouldRetryRequest({
              method,
              attempt,
              maxAttempts: maxRetryAttempts,
              status,
              error: errorInstance,
              hasIdempotencyKey: Boolean(options.idempotencyKey),
            })
          ) {
            attempt++;
            const delay = calculateBackoffDelay(attempt);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }

          throw errorInstance;
        }

        // 6. Parse successful response
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const json = await response.json();
          return json as T;
        }

        const text = await response.text();
        return text as unknown as T;
      } catch (err: unknown) {
        clearTimeout(timerId);
        if (userSignal) {
          userSignal.removeEventListener('abort', onUserAbort);
        }

        if (err instanceof ApiError) {
          throw err;
        }

        // Aborted / Timeout handling
        if (isTimeoutTriggered) {
          const timeoutErr = ApiError.timeoutError(timeoutMs, requestId);
          if (
            shouldRetryRequest({
              method,
              attempt,
              maxAttempts: maxRetryAttempts,
              error: timeoutErr,
              hasIdempotencyKey: Boolean(options.idempotencyKey),
            })
          ) {
            attempt++;
            const delay = calculateBackoffDelay(attempt);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
          throw timeoutErr;
        }

        if (userSignal?.aborted) {
          throw ApiError.cancelled(requestId);
        }

        // Network or fetch connection failure
        const networkErr = ApiError.networkError(err, requestId);
        if (
          shouldRetryRequest({
            method,
            attempt,
            maxAttempts: maxRetryAttempts,
            status: 0,
            error: networkErr,
            hasIdempotencyKey: Boolean(options.idempotencyKey),
          })
        ) {
          attempt++;
          const delay = calculateBackoffDelay(attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        throw networkErr;
      }
    }
  }

  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new WashoraApiClient();
