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
import { DataQualityService } from '../services/data-quality.service';

@ApiTags('Analytics — Admin Executive Intelligence')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Roles(RoleType.ADMIN)
@Controller('analytics/admin')
export class AdminAnalyticsController {
  constructor(
    private readonly kpiEngine: KpiEngineService,
    private readonly dataQualityService: DataQualityService,
  ) {}

  @Get('kpis')
  @ApiOperation({ summary: 'Platform-wide executive overview and financial totals (Admin only)' })
  async getExecutiveKpis(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: AnalyticsQueryDto,
  ) {
    const data = await this.kpiEngine.getExecutiveKpis(org.organizationId, query);
    return createSuccessResponse(data);
  }

  @Get('data-quality')
  @ApiOperation({ summary: 'Automated data-quality and financial reconciliation audit (Admin only)' })
  async getDataQualityAudit(@CurrentOrganization() org: OrganizationContext) {
    const data = await this.dataQualityService.runDataQualityAudit(org.organizationId);
    return createSuccessResponse(data);
  }
}
