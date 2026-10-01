import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AnalyticsQueryDto } from '../dto/analytics-query.dto';
import { CANONICAL_FUNNEL_STEPS } from '../constants/event-taxonomy.constant';

export interface FunnelStepMetric {
  step: number;
  eventName: string;
  label: string;
  uniqueUsers: number;
  totalEvents: number;
  stepConversionRate: number;
  overallConversionRate: number;
  dropOffRate: number;
}

@Injectable()
export class FunnelAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a multi-step booking conversion funnel report.
   */
  async getBookingFunnel(organizationId: string, query?: AnalyticsQueryDto) {
    const dateFilter: any = {};
    if (query?.startDate) dateFilter.gte = new Date(query.startDate);
    if (query?.endDate) dateFilter.lte = new Date(query.endDate);
    const hasDate = Object.keys(dateFilter).length > 0;

    const eventNames = CANONICAL_FUNNEL_STEPS.map((s) => s.name);

    // Group counts by eventName
    const counts = await this.prisma.analyticsEvent.groupBy({
      by: ['eventName'],
      where: {
        organizationId,
        eventName: { in: eventNames },
        ...(hasDate ? { createdAt: dateFilter } : {}),
      },
      _count: {
        _all: true,
      },
    });

    const countMap = new Map<string, number>();
    for (const c of counts) {
      countMap.set(c.eventName, c._count._all || 0);
    }

    // Baseline count at Step 1
    const baselineCount = countMap.get(CANONICAL_FUNNEL_STEPS[0].name) || 0;

    const steps: FunnelStepMetric[] = [];
    let prevCount = baselineCount;

    for (const stepDef of CANONICAL_FUNNEL_STEPS) {
      const currentCount = countMap.get(stepDef.name) || 0;

      const stepConversionRate =
        prevCount > 0 ? Number(((currentCount / prevCount) * 100).toFixed(1)) : 0;
      const overallConversionRate =
        baselineCount > 0 ? Number(((currentCount / baselineCount) * 100).toFixed(1)) : 0;
      const dropOffRate =
        prevCount > 0 ? Number((Math.max(0, 100 - (currentCount / prevCount) * 100)).toFixed(1)) : 0;

      steps.push({
        step: stepDef.step,
        eventName: stepDef.name,
        label: stepDef.label,
        uniqueUsers: currentCount,
        totalEvents: currentCount,
        stepConversionRate,
        overallConversionRate,
        dropOffRate,
      });

      prevCount = currentCount;
    }

    // Breakdown by platform
    const platformBreakdown = await this.prisma.analyticsEvent.groupBy({
      by: ['platform'],
      where: {
        organizationId,
        eventName: { in: eventNames },
        ...(hasDate ? { createdAt: dateFilter } : {}),
      },
      _count: { _all: true },
    });

    return {
      summary: {
        totalFunnelStarts: baselineCount,
        totalFunnelCompletions: countMap.get(CANONICAL_FUNNEL_STEPS[CANONICAL_FUNNEL_STEPS.length - 1].name) || 0,
        overallFunnelConversionRate:
          baselineCount > 0
            ? Number(
                (
                  ((countMap.get(CANONICAL_FUNNEL_STEPS[CANONICAL_FUNNEL_STEPS.length - 1].name) || 0) /
                    baselineCount) *
                  100
                ).toFixed(2),
              )
            : 0,
      },
      steps,
      deviceBreakdown: platformBreakdown.map((d) => ({
        device: d.platform || 'web',
        count: d._count._all || 0,
      })),
    };
  }
}
