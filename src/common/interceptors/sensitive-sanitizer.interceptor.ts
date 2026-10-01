import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'password_hash',
  'refreshtokenhash',
  'refresh_token_hash',
  'tokenhash',
  'token_hash',
  'secret',
  'clientsecret',
  'client_secret',
  'encryptionkey',
  'encryption_key',
  'apikey',
  'api_key',
  'cvv',
  'cvc',
  'cardnumber',
  'card_number',
  'privatekey',
  'private_key',
]);

export function sanitizePayload<T = any>(obj: T, seen = new WeakSet()): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  // Handle Dates, RegExps, Buffers
  if (obj instanceof Date || obj instanceof RegExp || Buffer.isBuffer(obj)) {
    return obj;
  }

  // Circular reference detection
  if (seen.has(obj as object)) {
    return obj;
  }
  seen.add(obj as object);

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizePayload(item, seen)) as unknown as T;
  }

  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey)) {
      // Exclude field completely
      continue;
    }

    cleaned[key] = sanitizePayload(value, seen);
  }

  return cleaned as T;
}

@Injectable()
export class SensitiveSanitizerInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => sanitizePayload(data)),
    );
  }
}
