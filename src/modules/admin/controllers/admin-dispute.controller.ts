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
  AssignDisputeDto,
  DisputeListQueryDto,
  EscalateDisputeDto,
  RejectDisputeDto,
  ResolveDisputeDto,
  UpdateSupportPriorityDto,
} from '../../support/dto';
import { AdminDisputeService } from '../services/admin-dispute.service';

@ApiTags('Admin — Disputes Resolution')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Controller('admin/support/disputes')
export class AdminDisputeController {
  constructor(private readonly disputeService: AdminDisputeService) {}

  @Get()
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'List customer/provider disputes with status and claim amounts' })
  async listDisputes(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: DisputeListQueryDto,
  ) {
    const result = await this.disputeService.listDisputes(org.organizationId, query);
    return createPaginatedResponse(
      result.items,
      query.page || 1,
      (query.pageSize || 20) || 20,
      result.total,
    );
  }

  @Get(':id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get dispute details, evidence records and timeline' })
  async getDispute(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') disputeId: string,
  ) {
    const data = await this.disputeService.getDispute(org.organizationId, disputeId);
    return createSuccessResponse(data);
  }

  @Post(':id/assign')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Assign dispute to specialized investigator' })
  async assignDispute(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') disputeId: string,
    @Body() dto: AssignDisputeDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.disputeService.assignDispute(
      org.organizationId,
      disputeId,
      dto,
      user.id,
      ip,
    );
    return createSuccessResponse(data);
  }

  @Post(':id/escalate')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Escalate dispute to supervisory lead' })
  async escalateDispute(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') disputeId: string,
    @Body() dto: EscalateDisputeDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.disputeService.escalateDispute(
      org.organizationId,
      disputeId,
      dto,
      user.id,
      ip,
    );
    return createSuccessResponse(data);
  }

  @Post(':id/resolve')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Resolve dispute with outcome and settlement' })
  async resolveDispute(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') disputeId: string,
    @Body() dto: ResolveDisputeDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.disputeService.resolveDispute(
      org.organizationId,
      disputeId,
      dto,
      user.id,
      ip,
    );
    return createSuccessResponse(data);
  }

  @Post(':id/reject')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Reject dispute claim with reason' })
  async rejectDispute(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') disputeId: string,
    @Body() dto: RejectDisputeDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.disputeService.rejectDispute(
      org.organizationId,
      disputeId,
      dto,
      user.id,
      ip,
    );
    return createSuccessResponse(data);
  }

  @Post(':id/priority')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Update dispute priority' })
  async updatePriority(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') disputeId: string,
    @Body() dto: UpdateSupportPriorityDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.disputeService.updatePriority(
      org.organizationId,
      disputeId,
      dto,
      user.id,
      ip,
    );
    return createSuccessResponse(data);
  }
}
