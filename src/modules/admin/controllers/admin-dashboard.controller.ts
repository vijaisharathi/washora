import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { createSuccessResponse } from '../../../common/utils/response.util';
import { CurrentOrganization } from '../../authorization/decorators/current-organization.decorator';
import { Roles } from '../../authorization/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../authorization/guards/organization.guard';
import { RolesGuard } from '../../authorization/guards/roles.guard';
import type { OrganizationContext } from '../../authorization/types/authorization.types';
import { AdminDashboardService } from '../services/admin-dashboard.service';

@ApiTags('Admin — Operational Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get('metrics')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get unified operational KPIs and metric counters' })
  async getMetrics(@CurrentOrganization() org: OrganizationContext) {
    const data = await this.dashboardService.getMetrics(org.organizationId);
    return createSuccessResponse(data);
  }

  @Get()
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get dashboard summary' })
  async getDashboardSummary(@CurrentOrganization() org: OrganizationContext) {
    const data = await this.dashboardService.getMetrics(org.organizationId);
    return createSuccessResponse(data);
  }
}
