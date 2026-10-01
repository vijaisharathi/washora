import { Injectable, Logger } from '@nestjs/common';
import { maskSensitiveLogData } from '../logging/structured-logger.service';

export type SecurityEventType =
  | 'AUTH_FAILURE'
  | 'AUTH_SUCCESS'
  | 'TOKEN_REUSE_DETECTED'
  | 'TOKEN_REVOKED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'IDOR_ATTEMPT'
  | 'TENANT_MISMATCH'
  | 'WEBHOOK_SIGNATURE_MISMATCH'
  | 'PRIVILEGED_ACTION'
  | 'PASSWORD_POLICY_VIOLATION';

export interface SecurityEventData {
  type: SecurityEventType;
  userId?: string;
  tenantId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  details?: Record<string, any>;
}

@Injectable()
export class SecurityLoggerService {
  private readonly logger = new Logger('SecurityAudit');

  logSecurityEvent(event: SecurityEventData): void {
    const payload = {
      timestamp: new Date().toISOString(),
      audit: 'SECURITY_AUDIT',
      type: event.type,
      userId: event.userId || 'anonymous',
      tenantId: event.tenantId || 'global',
      ipAddress: event.ipAddress || 'unknown',
      userAgent: event.userAgent || 'unknown',
      resource: event.resource,
      action: event.action,
      details: event.details ? maskSensitiveLogData(event.details) : undefined,
    };

    if (
      event.type === 'TOKEN_REUSE_DETECTED' ||
      event.type === 'IDOR_ATTEMPT' ||
      event.type === 'TENANT_MISMATCH' ||
      event.type === 'WEBHOOK_SIGNATURE_MISMATCH'
    ) {
      this.logger.error(`[SECURITY ALERT] ${event.type}: ${JSON.stringify(payload)}`);
    } else if (event.type === 'AUTH_FAILURE' || event.type === 'RATE_LIMIT_EXCEEDED') {
      this.logger.warn(`[SECURITY WARNING] ${event.type}: ${JSON.stringify(payload)}`);
    } else {
      this.logger.log(`[SECURITY EVENT] ${event.type}: ${JSON.stringify(payload)}`);
    }
  }
}
