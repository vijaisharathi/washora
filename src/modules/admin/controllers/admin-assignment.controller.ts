import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
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
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/types/auth.types';
import {
  AdminCancelAssignmentDto,
  AdminReassignDto,
  AssignmentAdminQueryDto,
} from '../dto/assignment-admin.dto';
import { AdminAssignmentService } from '../services/admin-assignment.service';

@ApiTags('Admin — Operational Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Controller('admin/assignments')
export class AdminAssignmentController {
  constructor(private readonly assignmentService: AdminAssignmentService) {}

  @Get()
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'List assignments with filters, pagination and sorting' })
  async listAssignments(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: AssignmentAdminQueryDto,
  ) {
    const result = await this.assignmentService.listAssignments(org.organizationId, query);
    return createPaginatedResponse(
      result.items,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  }

  @Get(':id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get assignment details with history and dispatch route' })
  async getAssignment(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') assignmentId: string,
  ) {
    const data = await this.assignmentService.getAssignment(org.organizationId, assignmentId);
    return createSuccessResponse(data);
  }

  @Post(':id/reassign')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Reassign assignment to another provider or delivery partner' })
  async reassign(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') assignmentId: string,
    @Body() dto: AdminReassignDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.assignmentService.reassign(
      org.organizationId,
      assignmentId,
      dto,
      user.id,
      ip,
    );
    return createSuccessResponse(data);
  }

  @Post(':id/cancel')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Cancel an operational assignment' })
  async cancelAssignment(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') assignmentId: string,
    @Body() dto: AdminCancelAssignmentDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.assignmentService.cancelAssignment(
      org.organizationId,
      assignmentId,
      dto,
      user.id,
      ip,
    );
    return createSuccessResponse(data);
  }
}
