import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import {
  createPaginatedResponse,
  createSuccessResponse,
} from '../../../common/utils/response.util';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Permissions } from '../../authorization/decorators/permissions.decorator';
import { Roles } from '../../authorization/decorators/roles.decorator';
import { OrganizationGuard } from '../../authorization/guards/organization.guard';
import { PermissionsGuard } from '../../authorization/guards/permissions.guard';
import { RolesGuard } from '../../authorization/guards/roles.guard';
import type { AuthorizedRequest } from '../../authorization/types/authorization.types';
import {
  CreateDisputeDto,
  CreateDisputeEvidenceDto,
  CreateDisputeMessageDto,
  CreateSupportMessageDto,
  CreateSupportTicketDto,
  DisputeEvidenceResponseDto,
  DisputeListQueryDto,
  DisputeMessageResponseDto,
  DisputeResponseDto,
  SupportMessageResponseDto,
  SupportTicketListQueryDto,
  SupportTicketResponseDto,
} from '../dto';
import { DisputeEvidenceService } from '../services/dispute-evidence.service';
import { DisputeService } from '../services/dispute.service';
import { SupportMessageService } from '../services/support-message.service';
import { SupportTicketService } from '../services/support-ticket.service';

@ApiTags('Customer Support & Disputes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard, PermissionsGuard)
@Roles(RoleType.CUSTOMER, RoleType.ADMIN)
@Controller('customer')
export class CustomerSupportController {
  constructor(
    private readonly ticketService: SupportTicketService,
    private readonly messageService: SupportMessageService,
    private readonly disputeService: DisputeService,
    private readonly evidenceService: DisputeEvidenceService,
  ) {}

  // ============================================================================
  // 1. SUPPORT TICKETS
  // ============================================================================

  @Post('support/tickets')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('support.create.self')
  @ApiOperation({ summary: 'Create support ticket as customer' })
  @ApiResponse({ status: 201, type: SupportTicketResponseDto })
  async createTicket(
    @Req() req: AuthorizedRequest,
    @Body() dto: CreateSupportTicketDto,
  ) {
    const ticket = await this.ticketService.createCustomerTicket(
      req.organization.organizationId,
      req.user.id,
      dto,
    );
    return createSuccessResponse(ticket);
  }

  @Get('support/tickets')
  @Permissions('support.read.self')
  @ApiOperation({ summary: 'List customer support tickets' })
  @ApiResponse({ status: 200, type: [SupportTicketResponseDto] })
  async listTickets(
    @Req() req: AuthorizedRequest,
    @Query() query: SupportTicketListQueryDto,
  ) {
    const result = await this.ticketService.listCustomerTickets(
      req.organization.organizationId,
      req.user.id,
      query,
    );
    return createPaginatedResponse(
      result.items,
      result.page,
      result.pageSize,
      result.total,
    );
  }

  @Get('support/tickets/:ticketId')
  @Permissions('support.read.self')
  @ApiOperation({ summary: 'Get customer support ticket details' })
  @ApiResponse({ status: 200, type: SupportTicketResponseDto })
  async getTicket(
    @Req() req: AuthorizedRequest,
    @Param('ticketId') ticketId: string,
  ) {
    const ticket = await this.ticketService.getTicket(
      req.organization.organizationId,
      ticketId,
      req.user.id,
      [req.organization.role],
    );
    return createSuccessResponse(ticket);
  }

  @Post('support/tickets/:ticketId/messages')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('support.message.self')
  @ApiOperation({ summary: 'Add message to support ticket' })
  @ApiResponse({ status: 201, type: SupportMessageResponseDto })
  async addTicketMessage(
    @Req() req: AuthorizedRequest,
    @Param('ticketId') ticketId: string,
    @Body() dto: CreateSupportMessageDto,
  ) {
    const message = await this.messageService.addMessage(
      req.organization.organizationId,
      ticketId,
      dto,
      req.user.id,
      [req.organization.role],
    );
    return createSuccessResponse(message);
  }

  @Get('support/tickets/:ticketId/messages')
  @Permissions('support.read.self')
  @ApiOperation({ summary: 'List messages for support ticket' })
  @ApiResponse({ status: 200, type: [SupportMessageResponseDto] })
  async listTicketMessages(
    @Req() req: AuthorizedRequest,
    @Param('ticketId') ticketId: string,
  ) {
    const messages = await this.messageService.listMessages(
      req.organization.organizationId,
      ticketId,
      req.user.id,
      [req.organization.role],
    );
    return createSuccessResponse(messages);
  }

  @Post('support/tickets/:ticketId/reopen')
  @HttpCode(HttpStatus.OK)
  @Permissions('support.reopen.self')
  @ApiOperation({ summary: 'Reopen resolved or closed ticket' })
  @ApiResponse({ status: 200, type: SupportTicketResponseDto })
  async reopenTicket(
    @Req() req: AuthorizedRequest,
    @Param('ticketId') ticketId: string,
  ) {
    const ticket = await this.ticketService.reopenTicket(
      req.organization.organizationId,
      ticketId,
      req.user.id,
      [req.organization.role],
    );
    return createSuccessResponse(ticket);
  }

  // ============================================================================
  // 2. DISPUTES
  // ============================================================================

  @Post('disputes')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('disputes.create.self')
  @ApiOperation({ summary: 'Create formal dispute as customer' })
  @ApiResponse({ status: 201, type: DisputeResponseDto })
  async createDispute(
    @Req() req: AuthorizedRequest,
    @Body() dto: CreateDisputeDto,
  ) {
    const dispute = await this.disputeService.createCustomerDispute(
      req.organization.organizationId,
      req.user.id,
      dto,
    );
    return createSuccessResponse(dispute);
  }

  @Get('disputes')
  @Permissions('disputes.read.self')
  @ApiOperation({ summary: 'List customer disputes' })
  @ApiResponse({ status: 200, type: [DisputeResponseDto] })
  async listDisputes(
    @Req() req: AuthorizedRequest,
    @Query() query: DisputeListQueryDto,
  ) {
    const result = await this.disputeService.listCustomerDisputes(
      req.organization.organizationId,
      req.user.id,
      query,
    );
    return createPaginatedResponse(
      result.items,
      result.page,
      result.pageSize,
      result.total,
    );
  }

  @Get('disputes/:disputeId')
  @Permissions('disputes.read.self')
  @ApiOperation({ summary: 'Get dispute details' })
  @ApiResponse({ status: 200, type: DisputeResponseDto })
  async getDispute(
    @Req() req: AuthorizedRequest,
    @Param('disputeId') disputeId: string,
  ) {
    const dispute = await this.disputeService.getDispute(
      req.organization.organizationId,
      disputeId,
      req.user.id,
      [req.organization.role],
    );
    return createSuccessResponse(dispute);
  }

  @Post('disputes/:disputeId/messages')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('disputes.message.self')
  @ApiOperation({ summary: 'Add message to dispute' })
  @ApiResponse({ status: 201, type: DisputeMessageResponseDto })
  async addDisputeMessage(
    @Req() req: AuthorizedRequest,
    @Param('disputeId') disputeId: string,
    @Body() dto: CreateDisputeMessageDto,
  ) {
    const message = await this.disputeService.addDisputeMessage(
      req.organization.organizationId,
      disputeId,
      dto,
      req.user.id,
      [req.organization.role],
    );
    return createSuccessResponse(message);
  }

  @Get('disputes/:disputeId/messages')
  @Permissions('disputes.read.self')
  @ApiOperation({ summary: 'List dispute messages' })
  @ApiResponse({ status: 200, type: [DisputeMessageResponseDto] })
  async listDisputeMessages(
    @Req() req: AuthorizedRequest,
    @Param('disputeId') disputeId: string,
  ) {
    const messages = await this.disputeService.listDisputeMessages(
      req.organization.organizationId,
      disputeId,
      req.user.id,
      [req.organization.role],
    );
    return createSuccessResponse(messages);
  }

  @Post('disputes/:disputeId/evidence')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('disputes.evidence.create.self')
  @ApiOperation({ summary: 'Submit evidence file for dispute' })
  @ApiResponse({ status: 201, type: DisputeEvidenceResponseDto })
  async submitEvidence(
    @Req() req: AuthorizedRequest,
    @Param('disputeId') disputeId: string,
    @Body() dto: CreateDisputeEvidenceDto,
  ) {
    const evidence = await this.evidenceService.submitEvidence(
      req.organization.organizationId,
      disputeId,
      dto,
      req.user.id,
      [req.organization.role],
    );
    return createSuccessResponse(evidence);
  }

  @Get('disputes/:disputeId/evidence')
  @Permissions('disputes.evidence.read.self')
  @ApiOperation({ summary: 'List evidence for dispute' })
  @ApiResponse({ status: 200, type: [DisputeEvidenceResponseDto] })
  async listEvidence(
    @Req() req: AuthorizedRequest,
    @Param('disputeId') disputeId: string,
  ) {
    const evidenceList = await this.evidenceService.listEvidence(
      req.organization.organizationId,
      disputeId,
      req.user.id,
      [req.organization.role],
    );
    return createSuccessResponse(evidenceList);
  }

  @Post('disputes/:disputeId/reopen')
  @HttpCode(HttpStatus.OK)
  @Permissions('disputes.reopen.self')
  @ApiOperation({ summary: 'Reopen resolved or closed dispute' })
  @ApiResponse({ status: 200, type: DisputeResponseDto })
  async reopenDispute(
    @Req() req: AuthorizedRequest,
    @Param('disputeId') disputeId: string,
  ) {
    const dispute = await this.disputeService.reopenDispute(
      req.organization.organizationId,
      disputeId,
      req.user.id,
      [req.organization.role],
    );
    return createSuccessResponse(dispute);
  }
}
