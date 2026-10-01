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
  AssignSupportTicketDto,
  CreateDisputeFromTicketDto,
  CreateSupportNoteDto,
  EscalateSupportTicketDto,
  ResolveSupportTicketDto,
  SupportTicketListQueryDto,
  UpdateSupportPriorityDto,
} from '../../support/dto';
import { AdminSupportService } from '../services/admin-support.service';

@ApiTags('Admin — Support Tickets Control')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Controller('admin/support/tickets')
export class AdminSupportController {
  constructor(private readonly supportService: AdminSupportService) {}

  @Get()
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'List support queue tickets with status, category and priority' })
  async listTickets(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: SupportTicketListQueryDto,
  ) {
    const result = await this.supportService.listTickets(org.organizationId, query);
    return createPaginatedResponse(
      result.items,
      query.page || 1,
      (query.pageSize || 20) || 20,
      result.total,
    );
  }

  @Get(':id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get support ticket full thread, notes and activity' })
  async getTicket(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') ticketId: string,
  ) {
    const data = await this.supportService.getTicket(org.organizationId, ticketId);
    return createSuccessResponse(data);
  }

  @Post(':id/assign')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Assign support ticket to agent' })
  async assignTicket(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') ticketId: string,
    @Body() dto: AssignSupportTicketDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.supportService.assignTicket(
      org.organizationId,
      ticketId,
      dto,
      user.id,
      ip,
    );
    return createSuccessResponse(data);
  }

  @Post(':id/escalate')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Escalate ticket to supervisory queue' })
  async escalateTicket(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') ticketId: string,
    @Body() dto: EscalateSupportTicketDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.supportService.escalateTicket(
      org.organizationId,
      ticketId,
      dto,
      user.id,
      ip,
    );
    return createSuccessResponse(data);
  }

  @Post(':id/resolve')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Resolve support ticket with resolution note' })
  async resolveTicket(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') ticketId: string,
    @Body() dto: ResolveSupportTicketDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.supportService.resolveTicket(
      org.organizationId,
      ticketId,
      dto,
      user.id,
      ip,
    );
    return createSuccessResponse(data);
  }

  @Post(':id/close')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Close support ticket' })
  async closeTicket(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') ticketId: string,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.supportService.closeTicket(
      org.organizationId,
      ticketId,
      user.id,
      ip,
    );
    return createSuccessResponse(data);
  }

  @Post(':id/priority')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Update support ticket priority' })
  async updatePriority(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') ticketId: string,
    @Body() dto: UpdateSupportPriorityDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.supportService.updatePriority(
      org.organizationId,
      ticketId,
      dto,
      user.id,
      ip,
    );
    return createSuccessResponse(data);
  }

  @Post(':id/notes')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Add internal staff note to support ticket' })
  async addNote(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') ticketId: string,
    @Body() dto: CreateSupportNoteDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.supportService.addNote(
      org.organizationId,
      ticketId,
      dto,
      user.id,
      ip,
    );
    return createSuccessResponse(data);
  }

  @Post(':id/disputes')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Escalate and create dispute from ticket' })
  async createDisputeFromTicket(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') ticketId: string,
    @Body() dto: CreateDisputeFromTicketDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.supportService.createDisputeFromTicket(
      org.organizationId,
      ticketId,
      dto,
      user.id,
      ip,
    );
    return createSuccessResponse(data);
  }
}
