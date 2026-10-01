/**
 * API client constants, default headers, and timeouts.
 */

import { envConfig, getApiUrl } from '@/config/env';

export const DEFAULT_TIMEOUT_MS = 15_000;

export const AUTH_HEADER = 'Authorization';
export const ORG_HEADER = 'X-Organization-ID';
export const IDEMPOTENCY_HEADER = 'Idempotency-Key';

export const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

export { envConfig, getApiUrl };
