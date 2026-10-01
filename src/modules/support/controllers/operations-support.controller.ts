import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
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
  AssignDisputeDto,
  AssignSupportTicketDto,
  CreateDisputeFromTicketDto,
  CreateDisputeMessageDto,
  CreateSupportMessageDto,
  CreateSupportNoteDto,
  DisputeActivityResponseDto,
  DisputeEvidenceResponseDto,
  DisputeListQueryDto,
  DisputeMessageResponseDto,
  DisputeResponseDto,
  EscalateDisputeDto,
  EscalateSupportTicketDto,
  RejectDisputeDto,
  RejectEvidenceDto,
  ResolveDisputeDto,
  ResolveSupportTicketDto,
  SupportActivityResponseDto,
  SupportMessageResponseDto,
  SupportNoteResponseDto,
  SupportTicketListQueryDto,
  SupportTicketResponseDto,
  UpdateSupportPriorityDto,
} from '../dto';
import { DisputeEvidenceService } from '../services/dispute-evidence.service';
import { DisputeService } from '../services/dispute.service';
import { SupportMessageService } from '../services/support-message.service';
import { SupportTicketService } from '../services/support-ticket.service';

@ApiTags('Operations Support & Disputes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard, PermissionsGuard)
@Roles(
  RoleType.ADMIN,
  RoleType.OPERATIONS,
  RoleType.SUPPORT_LEAD,
  RoleType.SUPPORT_AGENT,
)
@Controller('operations')
export class OperationsSupportController {
  constructor(
    private readonly ticketService: SupportTicketService,
    private readonly messageService: SupportMessageService,
    private readonly disputeService: DisputeService,
    private readonly evidenceService: DisputeEvidenceService,
  ) {}

  // ============================================================================
  // 1. SUPPORT TICKET QUEUE & TRIAGE
  // ============================================================================

  @Get('support/tickets')
  @Permissions('support.read.organization')
  @ApiOperation({ summary: 'List and filter organization support tickets queue' })
  @ApiResponse({ status: 200, type: [SupportTicketResponseDto] })
  async listSupportQueue(
    @Req() req: AuthorizedRequest,
    @Query() query: SupportTicketListQueryDto,
  ) {
    const result = await this.ticketService.listOperationsQueue(
      req.organization.organizationId,
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
  @Permissions('support.read.organization')
  @ApiOperation({ summary: 'Get support ticket details for operations triage' })
  @ApiResponse({ status: 200, type: SupportTicketResponseDto })
  async getSupportTicket(
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
  @Permissions('support.message.organization')
  @ApiOperation({ summary: 'Operations post message to ticket' })
  @ApiResponse({ status: 201, type: SupportMessageResponseDto })
  async addSupportMessage(
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
  @Permissions('support.read.organization')
  @ApiOperation({ summary: 'List all messages for ticket including internal' })
  @ApiResponse({ status: 200, type: [SupportMessageResponseDto] })
  async listSupportMessages(
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

  @Post('support/tickets/:ticketId/notes')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('support.notes.create')
  @ApiOperation({ summary: 'Create internal operations note on support ticket' })
  @ApiResponse({ status: 201, type: SupportNoteResponseDto })
  async addSupportNote(
    @Req() req: AuthorizedRequest,
    @Param('ticketId') ticketId: string,
    @Body() dto: CreateSupportNoteDto,
  ) {
    const note = await this.messageService.addNote(
      req.organization.organizationId,
      ticketId,
      dto,
      req.user.id,
    );
    return createSuccessResponse(note);
  }

  @Get('support/tickets/:ticketId/notes')
  @Permissions('support.notes.read')
  @ApiOperation({ summary: 'List internal notes for support ticket' })
  @ApiResponse({ status: 200, type: [SupportNoteResponseDto] })
  async listSupportNotes(
    @Req() req: AuthorizedRequest,
    @Param('ticketId') ticketId: string,
  ) {
    const notes = await this.messageService.listNotes(
      req.organization.organizationId,
      ticketId,
    );
    return createSuccessResponse(notes);
  }

  @Post('support/tickets/:ticketId/assign')
  @HttpCode(HttpStatus.OK)
  @Permissions('support.assign')
  @ApiOperation({ summary: 'Assign support ticket to operations/admin staff member' })
  @ApiResponse({ status: 200, type: SupportTicketResponseDto })
  async assignTicket(
    @Req() req: AuthorizedRequest,
    @Param('ticketId') ticketId: string,
    @Body() dto: AssignSupportTicketDto,
  ) {
    const ticket = await this.ticketService.assignTicket(
      req.organization.organizationId,
      ticketId,
      dto,
      req.user.id,
    );
    return createSuccessResponse(ticket);
  }

  @Post('support/tickets/:ticketId/unassign')
  @HttpCode(HttpStatus.OK)
  @Permissions('support.unassign')
  @ApiOperation({ summary: 'Unassign support ticket' })
  @ApiResponse({ status: 200, type: SupportTicketResponseDto })
  async unassignTicket(
    @Req() req: AuthorizedRequest,
    @Param('ticketId') ticketId: string,
  ) {
    const ticket = await this.ticketService.unassignTicket(
      req.organization.organizationId,
      ticketId,
      req.user.id,
    );
    return createSuccessResponse(ticket);
  }

  @Patch('support/tickets/:ticketId/priority')
  @Permissions('support.priority.update')
  @ApiOperation({ summary: 'Update priority level for support ticket' })
  @ApiResponse({ status: 200, type: SupportTicketResponseDto })
  async updateTicketPriority(
    @Req() req: AuthorizedRequest,
    @Param('ticketId') ticketId: string,
    @Body() dto: UpdateSupportPriorityDto,
  ) {
    const ticket = await this.ticketService.updatePriority(
      req.organization.organizationId,
      ticketId,
      dto,
      req.user.id,
    );
    return createSuccessResponse(ticket);
  }

  @Post('support/tickets/:ticketId/escalate')
  @HttpCode(HttpStatus.OK)
  @Permissions('support.escalate')
  @ApiOperation({ summary: 'Escalate support ticket to senior operations' })
  @ApiResponse({ status: 200, type: SupportTicketResponseDto })
  async escalateTicket(
    @Req() req: AuthorizedRequest,
    @Param('ticketId') ticketId: string,
    @Body() dto: EscalateSupportTicketDto,
  ) {
    const ticket = await this.ticketService.escalateTicket(
      req.organization.organizationId,
      ticketId,
      dto,
      req.user.id,
    );
    return createSuccessResponse(ticket);
  }

  @Post('support/tickets/:ticketId/resolve')
  @HttpCode(HttpStatus.OK)
  @Permissions('support.resolve')
  @ApiOperation({ summary: 'Resolve support ticket' })
  @ApiResponse({ status: 200, type: SupportTicketResponseDto })
  async resolveTicket(
    @Req() req: AuthorizedRequest,
    @Param('ticketId') ticketId: string,
    @Body() dto: ResolveSupportTicketDto,
  ) {
    const ticket = await this.ticketService.resolveTicket(
      req.organization.organizationId,
      ticketId,
      dto,
      req.user.id,
    );
    return createSuccessResponse(ticket);
  }

  @Post('support/tickets/:ticketId/close')
  @HttpCode(HttpStatus.OK)
  @Permissions('support.close')
  @ApiOperation({ summary: 'Close support ticket permanently' })
  @ApiResponse({ status: 200, type: SupportTicketResponseDto })
  async closeTicket(
    @Req() req: AuthorizedRequest,
    @Param('ticketId') ticketId: string,
  ) {
    const ticket = await this.ticketService.closeTicket(
      req.organization.organizationId,
      ticketId,
      req.user.id,
    );
    return createSuccessResponse(ticket);
  }

  @Post('support/tickets/:ticketId/reopen')
  @HttpCode(HttpStatus.OK)
  @Permissions('support.resolve')
  @ApiOperation({ summary: 'Operations reopen support ticket' })
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

  @Get('support/tickets/:ticketId/activities')
  @Permissions('support.read.organization')
  @ApiOperation({ summary: 'Get audit activity history for support ticket' })
  @ApiResponse({ status: 200, type: [SupportActivityResponseDto] })
  async getSupportActivities(
    @Req() req: AuthorizedRequest,
    @Param('ticketId') ticketId: string,
  ) {
    const activities = await this.ticketService.getTicketActivities(
      req.organization.organizationId,
      ticketId,
    );
    return createSuccessResponse(activities);
  }

  @Post('support/tickets/:ticketId/create-dispute')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('support.create-dispute')
  @ApiOperation({ summary: 'Create formal dispute linked to support ticket' })
  @ApiResponse({ status: 201, type: DisputeResponseDto })
  async createDisputeFromTicket(
    @Req() req: AuthorizedRequest,
    @Param('ticketId') ticketId: string,
    @Body() dto: CreateDisputeFromTicketDto,
  ) {
    const dispute = await this.ticketService.createDisputeFromTicket(
      req.organization.organizationId,
      ticketId,
      dto,
      req.user.id,
    );
    return createSuccessResponse(dispute);
  }

  // ============================================================================
  // 2. DISPUTE QUEUE & INVESTIGATION
  // ============================================================================

  @Get('disputes')
  @Permissions('disputes.read.organization')
  @ApiOperation({ summary: 'List and filter organization dispute queue' })
  @ApiResponse({ status: 200, type: [DisputeResponseDto] })
  async listDisputeQueue(
    @Req() req: AuthorizedRequest,
    @Query() query: DisputeListQueryDto,
  ) {
    const result = await this.disputeService.listOperationsQueue(
      req.organization.organizationId,
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
  @Permissions('disputes.read.organization')
  @ApiOperation({ summary: 'Get dispute details for operations investigation' })
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
  @Permissions('disputes.read.organization')
  @ApiOperation({ summary: 'Operations post message or investigation note to dispute' })
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
  @Permissions('disputes.read.organization')
  @ApiOperation({ summary: 'List all dispute messages including internal notes' })
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

  @Get('disputes/:disputeId/evidence')
  @Permissions('disputes.evidence.read.organization')
  @ApiOperation({ summary: 'List submitted evidence files for dispute' })
  @ApiResponse({ status: 200, type: [DisputeEvidenceResponseDto] })
  async listDisputeEvidence(
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

  @Post('disputes/:disputeId/evidence/:evidenceId/accept')
  @HttpCode(HttpStatus.OK)
  @Permissions('disputes.evidence.review')
  @ApiOperation({ summary: 'Accept submitted evidence file' })
  @ApiResponse({ status: 200, type: DisputeEvidenceResponseDto })
  async acceptEvidence(
    @Req() req: AuthorizedRequest,
    @Param('disputeId') disputeId: string,
    @Param('evidenceId') evidenceId: string,
  ) {
    const evidence = await this.evidenceService.acceptEvidence(
      req.organization.organizationId,
      disputeId,
      evidenceId,
      req.user.id,
    );
    return createSuccessResponse(evidence);
  }

  @Post('disputes/:disputeId/evidence/:evidenceId/reject')
  @HttpCode(HttpStatus.OK)
  @Permissions('disputes.evidence.review')
  @ApiOperation({ summary: 'Reject submitted evidence file' })
  @ApiResponse({ status: 200, type: DisputeEvidenceResponseDto })
  async rejectEvidence(
    @Req() req: AuthorizedRequest,
    @Param('disputeId') disputeId: string,
    @Param('evidenceId') evidenceId: string,
    @Body() dto: RejectEvidenceDto,
  ) {
    const evidence = await this.evidenceService.rejectEvidence(
      req.organization.organizationId,
      disputeId,
      evidenceId,
      dto,
      req.user.id,
    );
    return createSuccessResponse(evidence);
  }

  @Post('disputes/:disputeId/assign')
  @HttpCode(HttpStatus.OK)
  @Permissions('disputes.assign')
  @ApiOperation({ summary: 'Assign dispute to investigator' })
  @ApiResponse({ status: 200, type: DisputeResponseDto })
  async assignDispute(
    @Req() req: AuthorizedRequest,
    @Param('disputeId') disputeId: string,
    @Body() dto: AssignDisputeDto,
  ) {
    const dispute = await this.disputeService.assignDispute(
      req.organization.organizationId,
      disputeId,
      dto,
      req.user.id,
    );
    return createSuccessResponse(dispute);
  }

  @Post('disputes/:disputeId/unassign')
  @HttpCode(HttpStatus.OK)
  @Permissions('disputes.unassign')
  @ApiOperation({ summary: 'Unassign dispute' })
  @ApiResponse({ status: 200, type: DisputeResponseDto })
  async unassignDispute(
    @Req() req: AuthorizedRequest,
    @Param('disputeId') disputeId: string,
  ) {
    const dispute = await this.disputeService.unassignDispute(
      req.organization.organizationId,
      disputeId,
      req.user.id,
    );
    return createSuccessResponse(dispute);
  }

  @Patch('disputes/:disputeId/priority')
  @Permissions('disputes.priority.update')
  @ApiOperation({ summary: 'Update priority level for dispute' })
  @ApiResponse({ status: 200, type: DisputeResponseDto })
  async updateDisputePriority(
    @Req() req: AuthorizedRequest,
    @Param('disputeId') disputeId: string,
    @Body() dto: UpdateSupportPriorityDto,
  ) {
    const dispute = await this.disputeService.updatePriority(
      req.organization.organizationId,
      disputeId,
      dto,
      req.user.id,
    );
    return createSuccessResponse(dispute);
  }

  @Post('disputes/:disputeId/start-review')
  @HttpCode(HttpStatus.OK)
  @Permissions('disputes.investigate')
  @ApiOperation({ summary: 'Transition dispute to UNDER_REVIEW' })
  @ApiResponse({ status: 200, type: DisputeResponseDto })
  async startReview(
    @Req() req: AuthorizedRequest,
    @Param('disputeId') disputeId: string,
  ) {
    const dispute = await this.disputeService.startReview(
      req.organization.organizationId,
      disputeId,
      req.user.id,
    );
    return createSuccessResponse(dispute);
  }

  @Post('disputes/:disputeId/request-customer-response')
  @HttpCode(HttpStatus.OK)
  @Permissions('disputes.investigate')
  @ApiOperation({ summary: 'Transition dispute to WAITING_FOR_CUSTOMER' })
  @ApiResponse({ status: 200, type: DisputeResponseDto })
  async requestCustomerResponse(
    @Req() req: AuthorizedRequest,
    @Param('disputeId') disputeId: string,
  ) {
    const dispute = await this.disputeService.requestCustomerResponse(
      req.organization.organizationId,
      disputeId,
      req.user.id,
    );
    return createSuccessResponse(dispute);
  }

  @Post('disputes/:disputeId/request-provider-response')
  @HttpCode(HttpStatus.OK)
  @Permissions('disputes.investigate')
  @ApiOperation({ summary: 'Transition dispute to WAITING_FOR_PROVIDER' })
  @ApiResponse({ status: 200, type: DisputeResponseDto })
  async requestProviderResponse(
    @Req() req: AuthorizedRequest,
    @Param('disputeId') disputeId: string,
  ) {
    const dispute = await this.disputeService.requestProviderResponse(
      req.organization.organizationId,
      disputeId,
      req.user.id,
    );
    return createSuccessResponse(dispute);
  }

  @Post('disputes/:disputeId/request-delivery-response')
  @HttpCode(HttpStatus.OK)
  @Permissions('disputes.investigate')
  @ApiOperation({ summary: 'Transition dispute to WAITING_FOR_DELIVERY_PARTNER' })
  @ApiResponse({ status: 200, type: DisputeResponseDto })
  async requestDeliveryResponse(
    @Req() req: AuthorizedRequest,
    @Param('disputeId') disputeId: string,
  ) {
    const dispute = await this.disputeService.requestDeliveryResponse(
      req.organization.organizationId,
      disputeId,
      req.user.id,
    );
    return createSuccessResponse(dispute);
  }

  @Post('disputes/:disputeId/escalate')
  @HttpCode(HttpStatus.OK)
  @Permissions('disputes.escalate')
  @ApiOperation({ summary: 'Escalate dispute to senior leadership' })
  @ApiResponse({ status: 200, type: DisputeResponseDto })
  async escalateDispute(
    @Req() req: AuthorizedRequest,
    @Param('disputeId') disputeId: string,
    @Body() dto: EscalateDisputeDto,
  ) {
    const dispute = await this.disputeService.escalateDispute(
      req.organization.organizationId,
      disputeId,
      dto,
      req.user.id,
    );
    return createSuccessResponse(dispute);
  }

  @Post('disputes/:disputeId/resolve')
  @HttpCode(HttpStatus.OK)
  @Permissions('disputes.resolve')
  @ApiOperation({ summary: 'Resolve dispute (delegates to B10 financial service if refund)' })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description: 'Idempotency key for financial resolution safety',
  })
  @ApiResponse({ status: 200, type: DisputeResponseDto })
  async resolveDispute(
    @Req() req: AuthorizedRequest,
    @Param('disputeId') disputeId: string,
    @Body() dto: ResolveDisputeDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const dispute = await this.disputeService.resolveDispute(
      req.organization.organizationId,
      disputeId,
      dto,
      req.user.id,
      idempotencyKey,
    );
    return createSuccessResponse(dispute);
  }

  @Post('disputes/:disputeId/reject')
  @HttpCode(HttpStatus.OK)
  @Permissions('disputes.reject')
  @ApiOperation({ summary: 'Reject dispute claim' })
  @ApiResponse({ status: 200, type: DisputeResponseDto })
  async rejectDispute(
    @Req() req: AuthorizedRequest,
    @Param('disputeId') disputeId: string,
    @Body() dto: RejectDisputeDto,
  ) {
    const dispute = await this.disputeService.rejectDispute(
      req.organization.organizationId,
      disputeId,
      dto,
      req.user.id,
    );
    return createSuccessResponse(dispute);
  }

  @Post('disputes/:disputeId/close')
  @HttpCode(HttpStatus.OK)
  @Permissions('disputes.resolve')
  @ApiOperation({ summary: 'Close dispute permanently' })
  @ApiResponse({ status: 200, type: DisputeResponseDto })
  async closeDispute(
    @Req() req: AuthorizedRequest,
    @Param('disputeId') disputeId: string,
  ) {
    const dispute = await this.disputeService.closeDispute(
      req.organization.organizationId,
      disputeId,
      req.user.id,
    );
    return createSuccessResponse(dispute);
  }

  @Post('disputes/:disputeId/reopen')
  @HttpCode(HttpStatus.OK)
  @Permissions('disputes.resolve')
  @ApiOperation({ summary: 'Operations reopen dispute' })
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

  @Get('disputes/:disputeId/activities')
  @Permissions('disputes.read.organization')
  @ApiOperation({ summary: 'Get dispute audit activity timeline' })
  @ApiResponse({ status: 200, type: [DisputeActivityResponseDto] })
  async getDisputeActivities(
    @Req() req: AuthorizedRequest,
    @Param('disputeId') disputeId: string,
  ) {
    const activities = await this.disputeService.getDisputeActivities(
      req.organization.organizationId,
      disputeId,
    );
    return createSuccessResponse(activities);
  }
}
