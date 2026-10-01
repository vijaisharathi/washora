import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminRepository } from '../admin.repository';
import { AuditEventQueryDto } from '../dto/operations-admin.dto';
import { AdminErrorCode } from '../types/admin.types';

export function sanitizeAuditMetadata(metadata?: Record<string, any> | null): Record<string, any> | undefined {
  if (!metadata) return undefined;
  const sanitized = { ...metadata };
  const sensitiveKeys = [
    'password',
    'token',
    'refreshtoken',
    'secret',
    'cvv',
    'cardnumber',
    'pan',
    'pin',
    'authorization',
    'apikey',
  ];

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((s) => lowerKey.includes(s))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null && !Array.isArray(sanitized[key])) {
      sanitized[key] = sanitizeAuditMetadata(sanitized[key]);
    }
  }
  return sanitized;
}

@Injectable()
export class AdminAuditService {
  constructor(private readonly adminRepo: AdminRepository) {}

  async record(params: {
    organizationId?: string | null;
    actorUserId?: string | null;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, any> | null;
    ipHash?: string | null;
  }) {
    const cleanMeta = sanitizeAuditMetadata(params.metadata);
    return this.adminRepo.createAuditEvent({
      organizationId: params.organizationId ?? undefined,
      actorUserId: params.actorUserId ?? undefined,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadataJson: cleanMeta,
      ipHash: params.ipHash ?? undefined,
    });
  }

  async listAuditEvents(orgId: string, query: AuditEventQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const { total, items } = await this.adminRepo.findAuditEvents(orgId, {
      actorUserId: query.actorUserId,
      action: query.action,
      entityType: query.entityType,
      entityId: query.entityId,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      skip,
      take: limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAuditEventById(orgId: string, auditEventId: string) {
    const event = await this.adminRepo.findAuditEventById(auditEventId, orgId);
    if (!event) {
      throw new NotFoundException({
        code: AdminErrorCode.AUDIT_EVENT_NOT_FOUND,
        message: `Audit event with id ${auditEventId} not found`,
      });
    }
    return event;
  }
}
