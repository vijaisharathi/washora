/**
 * Standard Database Error Mapping & Handling Utility
 * Maps Prisma engine error codes (P2002, P2003, P2025, etc.) to structured, safe business error objects
 * preventing internal database details and stack traces from leaking to clients.
 */

export interface DatabaseErrorResult {
  isDatabaseError: boolean;
  code: string;
  statusCode: number;
  message: string;
  target?: string[];
}

export function handleDatabaseError(error: any): DatabaseErrorResult {
  if (!error) {
    return {
      isDatabaseError: false,
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
      message: 'An unexpected error occurred',
    };
  }

  // Prisma Known Request Error
  if (error.code && typeof error.code === 'string' && error.code.startsWith('P')) {
    switch (error.code) {
      case 'P2002':
        return {
          isDatabaseError: true,
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
          statusCode: 409,
          message: `A record with this ${error.meta?.target ? error.meta.target.join(', ') : 'unique field'} already exists.`,
          target: error.meta?.target,
        };

      case 'P2003':
        return {
          isDatabaseError: true,
          code: 'FOREIGN_KEY_VIOLATION',
          statusCode: 400,
          message: 'The referenced related record does not exist or belongs to another organization.',
          target: error.meta?.field_name ? [error.meta.field_name] : undefined,
        };

      case 'P2025':
        return {
          isDatabaseError: true,
          code: 'RECORD_NOT_FOUND',
          statusCode: 404,
          message: error.meta?.cause || 'The requested record was not found in this organization.',
        };

      case 'P2000':
        return {
          isDatabaseError: true,
          code: 'VALUE_OUT_OF_RANGE',
          statusCode: 400,
          message: 'The provided value exceeds the allowed column length or precision.',
        };

      case 'P2014':
        return {
          isDatabaseError: true,
          code: 'RELATION_VIOLATION',
          statusCode: 400,
          message: 'The change violates a required relation between records.',
        };

      default:
        return {
          isDatabaseError: true,
          code: `DB_${error.code}`,
          statusCode: 500,
          message: 'A database error occurred during operation execution.',
        };
    }
  }

  return {
    isDatabaseError: false,
    code: 'GENERAL_ERROR',
    statusCode: 500,
    message: error.message || 'An unexpected operational error occurred.',
  };
}
