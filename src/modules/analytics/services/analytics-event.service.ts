import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IngestAnalyticsEventDto, BatchIngestAnalyticsEventsDto } from '../dto/analytics-event.dto';
import { AnalyticsQueryDto } from '../dto/analytics-query.dto';

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /authorization/i,
  /credit_?card/i,
  /card_?number/i,
  /cvv/i,
  /ssn/i,
  /pin/i,
  /private_?key/i,
];

@Injectable()
export class AnalyticsEventService {
  private readonly logger = new Logger(AnalyticsEventService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sanitizes payload properties by stripping any keys matching sensitive patterns.
   */
  public sanitizeProperties(properties?: Record<string, any>): Record<string, any> {
    if (!properties || typeof properties !== 'object') {
      return {};
    }

    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(properties)) {
      const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
      if (isSensitive) {
        clean[key] = '[REDACTED]';
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        clean[key] = this.sanitizeProperties(value);
      } else {
        clean[key] = value;
      }
    }
    return clean;
  }

  /**
   * Ingest a single analytics telemetry event.
   */
  async ingestEvent(
    organizationId: string,
    dto: IngestAnalyticsEventDto,
    actorUserId?: string,
    ipAddress?: string,
  ) {
    const cleanProps = this.sanitizeProperties(dto.properties);

    return this.prisma.analyticsEvent.create({
      data: {
        organizationId,
        eventName: dto.eventName,
        eventCategory: dto.eventCategory,
        actorUserId: actorUserId || null,
        actorRole: dto.actorRole ? String(dto.actorRole) : 'ANONYMOUS',
        sessionId: dto.sessionId || null,
        platform: dto.deviceType || 'web',
        source: 'client',
        properties: cleanProps,
      },
    });
  }

  /**
   * Ingest a batch of events within a single database transaction.
   */
  async ingestBatch(
    organizationId: string,
    dto: BatchIngestAnalyticsEventsDto,
    actorUserId?: string,
    ipAddress?: string,
  ) {
    const events = dto.events.map((evt) => ({
      organizationId,
      eventName: evt.eventName,
      eventCategory: evt.eventCategory,
      actorUserId: actorUserId || null,
      actorRole: evt.actorRole ? String(evt.actorRole) : 'ANONYMOUS',
      sessionId: evt.sessionId || null,
      platform: evt.deviceType || 'web',
      source: 'client',
      properties: this.sanitizeProperties(evt.properties),
    }));

    const result = await this.prisma.analyticsEvent.createMany({
      data: events,
      skipDuplicates: false,
    });

    return {
      ingestedCount: result.count,
    };
  }

  /**
   * Query event telemetry with strict tenant scoping.
   */
  async queryEvents(organizationId: string, query: AnalyticsQueryDto) {
    const where: any = { organizationId };

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    if (query.targetRole) {
      where.actorRole = String(query.targetRole);
    }

    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.analyticsEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.analyticsEvent.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
