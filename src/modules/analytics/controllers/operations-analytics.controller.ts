import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { createSuccessResponse } from '../../../common/utils/response.util';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../authorization/guards/organization.guard';
import { RolesGuard } from '../../authorization/guards/roles.guard';
import { Roles } from '../../authorization/decorators/roles.decorator';
import { CurrentOrganization } from '../../authorization/decorators/current-organization.decorator';
import type { OrganizationContext } from '../../authorization/types/authorization.types';
import { AnalyticsQueryDto } from '../dto/analytics-query.dto';
import { KpiEngineService } from '../services/kpi-engine.service';
import { FunnelAnalyticsService } from '../services/funnel-analytics.service';

@ApiTags('Analytics — Operations & Executive Funnel')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Controller('analytics/operations')
export class OperationsAnalyticsController {
  constructor(
    private readonly kpiEngine: KpiEngineService,
    private readonly funnelService: FunnelAnalyticsService,
  ) {}

  @Get('kpis')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Operational throughput and executive marketplace KPIs' })
  async getOperationalKpis(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: AnalyticsQueryDto,
  ) {
    const data = await this.kpiEngine.getExecutiveKpis(org.organizationId, query);
    return createSuccessResponse(data);
  }

  @Get('funnel')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Multi-stage customer journey conversion and drop-off funnel' })
  async getBookingFunnel(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: AnalyticsQueryDto,
  ) {
    const data = await this.funnelService.getBookingFunnel(org.organizationId, query);
    return createSuccessResponse(data);
  }
}
