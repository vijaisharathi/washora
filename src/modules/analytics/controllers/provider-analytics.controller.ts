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

@ApiTags('Analytics — Provider Performance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Controller('analytics/provider')
export class ProviderAnalyticsController {
  constructor(private readonly kpiEngine: KpiEngineService) {}

  @Get()
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS, RoleType.PROVIDER)
  @ApiOperation({ summary: 'Provider fulfillment volume, earnings, and acceptance rates' })
  async getProviderAnalytics(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: AnalyticsQueryDto,
  ) {
    const data = await this.kpiEngine.getProviderAnalytics(org.organizationId, query);
    return createSuccessResponse(data);
  }
}
