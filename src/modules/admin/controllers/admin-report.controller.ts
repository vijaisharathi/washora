import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { createSuccessResponse } from '../../../common/utils/response.util';
import { CurrentOrganization } from '../../authorization/decorators/current-organization.decorator';
import { Roles } from '../../authorization/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../authorization/guards/organization.guard';
import { RolesGuard } from '../../authorization/guards/roles.guard';
import type { OrganizationContext } from '../../authorization/types/authorization.types';
import { ReportQueryDto } from '../dto/operations-admin.dto';
import { AdminReportService } from '../services/admin-report.service';

@ApiTags('Admin — Analytics & Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Controller('admin/reports')
export class AdminReportController {
  constructor(private readonly reportService: AdminReportService) {}

  @Get('bookings')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Time-series booking analytics report (Admin only)' })
  async getBookingReport(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: ReportQueryDto,
  ) {
    const data = await this.reportService.getBookingReport(org.organizationId, query);
    return createSuccessResponse(data);
  }

  @Get('revenue')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Time-series revenue and financial volume report (Admin only)' })
  async getRevenueReport(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: ReportQueryDto,
  ) {
    const data = await this.reportService.getRevenueReport(org.organizationId, query);
    return createSuccessResponse(data);
  }

  @Get('providers')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Provider performance and ratings leaderboard report (Admin only)' })
  async getProviderReport(@CurrentOrganization() org: OrganizationContext) {
    const data = await this.reportService.getProviderPerformanceReport(org.organizationId);
    return createSuccessResponse(data);
  }

  @Get('customers')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Customer acquisition and growth report (Admin only)' })
  async getCustomerReport(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: ReportQueryDto,
  ) {
    const data = await this.reportService.getCustomerAcquisitionReport(org.organizationId, query);
    return createSuccessResponse(data);
  }
}
