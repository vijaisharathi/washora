/**
 * Maps backend VALIDATION_ERROR details into field-level errors
 * compatible with React Hook Form's setError.
 */

import { isApiError } from '@/lib/api/errors';
import type { FieldValues, UseFormSetError, Path } from 'react-hook-form';

export interface BackendValidationErrorDetail {
  field?: string;
  property?: string;
  message: string;
}

/**
 * Extracts a key-value map of fieldName -> errorMessage from an ApiError.
 */
export function extractValidationFieldErrors(error: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  if (!isApiError(error) || !error.details) {
    return result;
  }

  const details = error.details;

  // Case 1: Array of detail objects [{ field: "email", message: "..." }]
  if (Array.isArray(details)) {
    for (const item of details) {
      if (typeof item === 'object' && item !== null) {
        const field = (item as any).field || (item as any).property;
        const msg = (item as any).message || (item as any).error;
        if (field && msg) {
          result[field] = msg;
        }
      } else if (typeof item === 'string') {
        result['root'] = item;
      }
    }
    return result;
  }

  // Case 2: Object dictionary { email: "Invalid email", phone: "..." }
  if (typeof details === 'object' && details !== null) {
    for (const [key, val] of Object.entries(details)) {
      if (typeof val === 'string') {
        result[key] = val;
      } else if (typeof val === 'object' && val !== null && 'message' in val) {
        result[key] = String((val as any).message);
      }
    }
  }

  return result;
}

/**
 * Applies extracted API validation errors directly to React Hook Form's setError.
 * Returns true if any field error was applied, false otherwise.
 */
export function applyApiErrorsToForm<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>
): boolean {
  const fieldErrors = extractValidationFieldErrors(error);
  const keys = Object.keys(fieldErrors);
  if (keys.length === 0) return false;

  for (const [field, message] of Object.entries(fieldErrors)) {
    setError(field as Path<T>, {
      type: 'server',
      message,
    });
  }

  return true;
}
