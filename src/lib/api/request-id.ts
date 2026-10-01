/**
 * Request ID tracking and generation for distributed tracing between frontend & backend.
 */

export const X_REQUEST_ID_HEADER = 'X-Request-ID';

export function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `req-${crypto.randomUUID()}`;
  }
  
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `req-${timestamp}-${randomPart}`;
}
