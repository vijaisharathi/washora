import { Controller, Get, Header, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../authorization/guards/organization.guard';
import { RolesGuard } from '../../authorization/guards/roles.guard';
import { Roles } from '../../authorization/decorators/roles.decorator';
import { CurrentOrganization } from '../../authorization/decorators/current-organization.decorator';
import type { OrganizationContext } from '../../authorization/types/authorization.types';
import { AnalyticsQueryDto } from '../dto/analytics-query.dto';
import { AnalyticsExportService } from '../services/analytics-export.service';
import { KpiEngineService } from '../services/kpi-engine.service';

@ApiTags('Analytics — Exports & Reporting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Roles(RoleType.ADMIN, RoleType.OPERATIONS)
@Controller('analytics/export')
export class AnalyticsExportController {
  constructor(
    private readonly exportService: AnalyticsExportService,
    private readonly kpiEngine: KpiEngineService,
  ) {}

  @Get('events')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="washora-events-export.csv"')
  @ApiOperation({ summary: 'Export telemetry events stream as sanitized CSV' })
  async exportEvents(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: AnalyticsQueryDto,
    @Res() res: Response,
  ) {
    const csv = await this.exportService.exportEventsCsv(org.organizationId, query);
    return res.send(csv);
  }

  @Get('kpis')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="washora-executive-kpis.csv"')
  @ApiOperation({ summary: 'Export executive operational and financial KPIs as CSV' })
  async exportKpis(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: AnalyticsQueryDto,
    @Res() res: Response,
  ) {
    const kpis = await this.kpiEngine.getExecutiveKpis(org.organizationId, query);
    const csv = await this.exportService.exportFinancialKpiCsv(org.organizationId, kpis);
    return res.send(csv);
  }
}
