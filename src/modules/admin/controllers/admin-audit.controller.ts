import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import {
  createPaginatedResponse,
  createSuccessResponse,
} from '../../../common/utils/response.util';
import { CurrentOrganization } from '../../authorization/decorators/current-organization.decorator';
import { Roles } from '../../authorization/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../authorization/guards/organization.guard';
import { RolesGuard } from '../../authorization/guards/roles.guard';
import type { OrganizationContext } from '../../authorization/types/authorization.types';
import { AuditEventQueryDto } from '../dto/operations-admin.dto';
import { AdminAuditService } from '../services/admin-audit.service';

@ApiTags('Admin — Audit Logs & Compliance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Controller('admin/audit-logs')
export class AdminAuditController {
  constructor(private readonly auditService: AdminAuditService) {}

  @Get()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'List privileged audit events and mutation history (Admin only)' })
  async listAuditEvents(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: AuditEventQueryDto,
  ) {
    const result = await this.auditService.listAuditEvents(org.organizationId, query);
    return createPaginatedResponse(
      result.items,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  }

  @Get(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Get audit event details by ID (Admin only)' })
  async getAuditEvent(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') auditEventId: string,
  ) {
    const data = await this.auditService.getAuditEventById(org.organizationId, auditEventId);
    return createSuccessResponse(data);
  }
}
