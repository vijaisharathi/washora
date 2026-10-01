/**
 * Backward-compatible adapter for existing services.
 * Proxies all requests to the canonical src/lib/api client.
 */

import {
  apiClient as canonicalApiClient,
  ApiError as CanonicalApiError,
  RequestOptions as CanonicalRequestOptions,
} from '@/lib/api';

export { CanonicalApiError as ApiError };
export type { CanonicalRequestOptions as RequestOptions };

export async function apiClient<T>(
  endpoint: string,
  options: CanonicalRequestOptions = {}
): Promise<T> {
  return canonicalApiClient.request<T>(endpoint, options);
}

export default apiClient;
