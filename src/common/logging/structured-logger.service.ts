import { Injectable, LoggerService, LogLevel, Scope } from '@nestjs/common';

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  correlationId?: string;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const REDACTED_KEYS = new Set([
  'password',
  'secret',
  'token',
  'authorization',
  'refreshtoken',
  'apikey',
  'cvv',
  'cardnumber',
  'encryptionkey',
]);

export function maskSensitiveLogData(data: any, seen = new WeakSet()): any {
  if (!data || typeof data !== 'object') return data;
  if (data instanceof Date || Buffer.isBuffer(data)) return data;

  if (seen.has(data)) return '[CIRCULAR]';
  seen.add(data);

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveLogData(item, seen));
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const lower = key.toLowerCase();
    if (REDACTED_KEYS.has(lower) || lower.includes('secret') || lower.includes('token') || lower.includes('password')) {
      sanitized[key] = '********';
    } else if (typeof value === 'object') {
      sanitized[key] = maskSensitiveLogData(value, seen);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

@Injectable({ scope: Scope.TRANSIENT })
export class StructuredLoggerService implements LoggerService {
  private context?: string;
  private correlationId?: string;

  setContext(context: string): void {
    this.context = context;
  }

  setCorrelationId(correlationId: string): void {
    this.correlationId = correlationId;
  }

  private formatEntry(level: string, message: any, context?: string, metadata?: Record<string, any>, error?: Error): string {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: typeof message === 'string' ? message : JSON.stringify(message),
      context: context || this.context,
      correlationId: this.correlationId,
      metadata: metadata ? maskSensitiveLogData(metadata) : undefined,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      };
    }

    return JSON.stringify(entry);
  }

  log(message: any, context?: string, metadata?: Record<string, any>): void {
    console.log(this.formatEntry('INFO', message, context, metadata));
  }

  error(message: any, trace?: string, context?: string, metadata?: Record<string, any>): void {
    const errorObj = trace ? new Error(trace) : undefined;
    console.error(this.formatEntry('ERROR', message, context, metadata, errorObj));
  }

  warn(message: any, context?: string, metadata?: Record<string, any>): void {
    console.warn(this.formatEntry('WARN', message, context, metadata));
  }

  debug(message: any, context?: string, metadata?: Record<string, any>): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatEntry('DEBUG', message, context, metadata));
    }
  }

  verbose(message: any, context?: string, metadata?: Record<string, any>): void {
    if (process.env.NODE_ENV !== 'production') {
      console.log(this.formatEntry('VERBOSE', message, context, metadata));
    }
  }
}
