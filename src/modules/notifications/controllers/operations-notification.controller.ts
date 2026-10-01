import {
  Body,
  Controller,
  Get,
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
import { Roles } from '../../authorization/decorators/roles.decorator';
import { OrganizationGuard } from '../../authorization/guards/organization.guard';
import { RolesGuard } from '../../authorization/guards/roles.guard';
import type { AuthorizedRequest } from '../../authorization/types/authorization.types';
import {
  CancelCommunicationDto,
  CommunicationListQueryDto,
  CommunicationResponseDto,
  CreateBroadcastNotificationDto,
  CreateNotificationTemplateDto,
  NotificationTemplateListQueryDto,
  NotificationTemplateResponseDto,
  RetryCommunicationDto,
  UpdateNotificationTemplateDto,
} from '../dto';
import { BroadcastService } from '../services/broadcast.service';
import { NotificationTemplateService } from '../services/notification-template.service';
import { CommunicationService } from '../services/communication.service';

@ApiTags('Operations Notifications & Communications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Roles(RoleType.OPERATIONS, RoleType.ADMIN)
@Controller('operations')
export class OperationsNotificationController {
  constructor(
    private readonly broadcastService: BroadcastService,
    private readonly templateService: NotificationTemplateService,
    private readonly communicationService: CommunicationService,
  ) {}

  // ==========================================================================
  // 1. BROADCAST
  // ==========================================================================

  @Post('broadcast')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create and dispatch organization-wide notification broadcast' })
  @ApiResponse({ status: 201, description: 'Broadcast created and queued successfully' })
  async createBroadcast(
    @Req() req: AuthorizedRequest,
    @Body() dto: CreateBroadcastNotificationDto,
  ) {
    const result = await this.broadcastService.createBroadcast(
      req.organization.organizationId,
      dto,
      req.user.id,
    );
    return createSuccessResponse(result);
  }

  // ==========================================================================
  // 2. TEMPLATES MANAGEMENT
  // ==========================================================================

  @Get('templates')
  @ApiOperation({ summary: 'List notification templates for organization' })
  @ApiResponse({ status: 200, description: 'Paginated templates list', type: [NotificationTemplateResponseDto] })
  async listTemplates(
    @Req() req: AuthorizedRequest,
    @Query() query: NotificationTemplateListQueryDto,
  ) {
    const result = await this.templateService.getTemplates(
      req.organization.organizationId,
      query,
    );
    return createPaginatedResponse(
      result.items,
      result.page,
      result.limit,
      result.total,
    );
  }

  @Post('templates')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new versioned notification template' })
  @ApiResponse({ status: 201, description: 'Template created successfully', type: NotificationTemplateResponseDto })
  async createTemplate(
    @Req() req: AuthorizedRequest,
    @Body() dto: CreateNotificationTemplateDto,
  ) {
    const template = await this.templateService.createTemplate(
      req.organization.organizationId,
      dto,
      req.user.id,
    );
    return createSuccessResponse(template);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get notification template details' })
  @ApiResponse({ status: 200, description: 'Notification template details', type: NotificationTemplateResponseDto })
  async getTemplate(
    @Req() req: AuthorizedRequest,
    @Param('id') id: string,
  ) {
    const template = await this.templateService.getTemplateById(
      req.organization.organizationId,
      id,
    );
    return createSuccessResponse(template);
  }

  @Patch('templates/:id')
  @ApiOperation({ summary: 'Update notification template' })
  @ApiResponse({ status: 200, description: 'Notification template updated', type: NotificationTemplateResponseDto })
  async updateTemplate(
    @Req() req: AuthorizedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateNotificationTemplateDto,
  ) {
    const updated = await this.templateService.updateTemplate(
      req.organization.organizationId,
      id,
      dto,
      req.user.id,
    );
    return createSuccessResponse(updated);
  }

  // ==========================================================================
  // 3. COMMUNICATIONS MONITORING & LIFECYCLE
  // ==========================================================================

  @Get('communications')
  @ApiOperation({ summary: 'List communications and delivery records' })
  @ApiResponse({ status: 200, description: 'Paginated communications list', type: [CommunicationResponseDto] })
  async listCommunications(
    @Req() req: AuthorizedRequest,
    @Query() query: CommunicationListQueryDto,
  ) {
    const result = await this.communicationService.getCommunications(
      req.organization.organizationId,
      query,
    );
    return createPaginatedResponse(
      result.items,
      result.page,
      result.limit,
      result.total,
    );
  }

  @Get('communications/:id')
  @ApiOperation({ summary: 'Get communication details and recipients' })
  @ApiResponse({ status: 200, description: 'Communication details', type: CommunicationResponseDto })
  async getCommunication(
    @Req() req: AuthorizedRequest,
    @Param('id') id: string,
  ) {
    const comm = await this.communicationService.getCommunicationById(
      req.organization.organizationId,
      id,
    );
    return createSuccessResponse(comm);
  }

  @Post('communications/:id/retry')
  @ApiOperation({ summary: 'Retry failed communication (Max 3 attempts)' })
  @ApiResponse({ status: 200, description: 'Communication retry initiated', type: CommunicationResponseDto })
  async retryCommunication(
    @Req() req: AuthorizedRequest,
    @Param('id') id: string,
    @Body() dto: RetryCommunicationDto,
  ) {
    const retried = await this.communicationService.retryCommunication(
      req.organization.organizationId,
      id,
      dto,
      req.user.id,
    );
    return createSuccessResponse(retried);
  }

  @Post('communications/:id/cancel')
  @ApiOperation({ summary: 'Cancel queued or processing communication' })
  @ApiResponse({ status: 200, description: 'Communication cancelled successfully' })
  async cancelCommunication(
    @Req() req: AuthorizedRequest,
    @Param('id') id: string,
    @Body() dto: CancelCommunicationDto,
  ) {
    const cancelled = await this.communicationService.cancelCommunication(
      req.organization.organizationId,
      id,
      dto,
      req.user.id,
    );
    return createSuccessResponse(cancelled);
  }
}
