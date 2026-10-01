/**
 * Strongly-typed API request & response contracts for WASHORA frontend.
 */

export interface ApiPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiPaginated<T> {
  success: true;
  data: T[];
  meta: ApiPaginationMeta;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorPayload;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiPaginated<T> | ApiErrorResponse;

export type QueryParams = Record<
  string,
  string | number | boolean | undefined | null | (string | number | boolean)[]
>;

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  /**
   * Query parameters to append to the URL
   */
  params?: QueryParams;
  /**
   * Request payload
   */
  body?: unknown;
  /**
   * Timeout in milliseconds. Defaults to 15,000ms.
   */
  timeout?: number;
  /**
   * Whether this request requires authentication (default: true)
   */
  auth?: boolean;
  /**
   * Optional explicit organization ID (overrides active context)
   */
  organizationId?: string;
  /**
   * Optional idempotency key for financial/unsafe mutations
   */
  idempotencyKey?: string;
  /**
   * Custom retry count or disable retry
   */
  retry?: boolean | number;
  /**
   * Custom request ID
   */
  requestId?: string;
}
