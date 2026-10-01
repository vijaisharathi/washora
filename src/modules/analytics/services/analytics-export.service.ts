import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AnalyticsQueryDto } from '../dto/analytics-query.dto';

@Injectable()
export class AnalyticsExportService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to escape CSV cell contents.
   */
  private escapeCsv(val: any): string {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  /**
   * Exports sanitized analytics event records as CSV.
   */
  async exportEventsCsv(organizationId: string, query?: AnalyticsQueryDto): Promise<string> {
    const where: any = { organizationId };
    if (query?.startDate || query?.endDate) {
      where.createdAt = {};
      if (query?.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query?.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const events = await this.prisma.analyticsEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    const headers = [
      'ID',
      'Event Name',
      'Category',
      'Actor Role',
      'Session ID',
      'Platform',
      'Source',
      'Created At',
    ];

    const rows = events.map((e) => [
      this.escapeCsv(e.id),
      this.escapeCsv(e.eventName),
      this.escapeCsv(e.eventCategory),
      this.escapeCsv(e.actorRole || 'ANONYMOUS'),
      this.escapeCsv(e.sessionId || ''),
      this.escapeCsv(e.platform || ''),
      this.escapeCsv(e.source || ''),
      this.escapeCsv(e.createdAt.toISOString()),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  /**
   * Exports executive financial summary data as CSV.
   */
  async exportFinancialKpiCsv(organizationId: string, kpiData: any): Promise<string> {
    const headers = ['Metric Name', 'Value', 'Unit'];
    const rows = [
      ['Gross Merchandise Value (GMV)', this.escapeCsv(kpiData.financial.gmv), 'CURRENCY'],
      ['Net Platform Revenue', this.escapeCsv(kpiData.financial.netRevenue), 'CURRENCY'],
      ['Total Refunds Processed', this.escapeCsv(kpiData.financial.totalRefunds), 'CURRENCY'],
      ['Completed Transactions', this.escapeCsv(kpiData.financial.paymentTransactions), 'COUNT'],
      ['Average Order Value (AOV)', this.escapeCsv(kpiData.financial.averageOrderValue), 'CURRENCY'],
      ['Total Active Orders', this.escapeCsv(kpiData.operations.totalOrders), 'COUNT'],
      ['Completed Orders', this.escapeCsv(kpiData.operations.completedOrders), 'COUNT'],
      ['Provider Acceptance Rate', this.escapeCsv(kpiData.operations.providerAcceptanceRate), 'PERCENTAGE'],
      ['Delivery Success Rate', this.escapeCsv(kpiData.operations.deliverySuccessRate), 'PERCENTAGE'],
      ['Customer Repeat Rate', this.escapeCsv(kpiData.customer.repeatRatePercentage), 'PERCENTAGE'],
    ];

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
