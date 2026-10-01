import {
  Body,
  Controller,
  Get,
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
  NotificationListQueryDto,
  NotificationPreferenceResponseDto,
  NotificationResponseDto,
  UnreadCountResponseDto,
  UpdateNotificationPreferenceDto,
} from '../dto';
import { NotificationService } from '../services/notification.service';
import { NotificationPreferenceService } from '../services/notification-preference.service';

@ApiTags('Customer Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Roles(RoleType.CUSTOMER, RoleType.ADMIN)
@Controller('customer/notifications')
export class CustomerNotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly preferenceService: NotificationPreferenceService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List customer notifications' })
  @ApiResponse({ status: 200, description: 'Paginated customer notifications', type: [NotificationResponseDto] })
  async listNotifications(
    @Req() req: AuthorizedRequest,
    @Query() query: NotificationListQueryDto,
  ) {
    const result = await this.notificationService.getUserNotifications(
      req.organization.organizationId,
      req.user.id,
      query,
    );
    return createPaginatedResponse(
      result.items,
      result.page,
      result.limit,
      result.total,
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count for customer' })
  @ApiResponse({ status: 200, description: 'Unread notification count', type: UnreadCountResponseDto })
  async getUnreadCount(@Req() req: AuthorizedRequest) {
    const counts = await this.notificationService.getUnreadCount(
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(counts);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark customer notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read', type: NotificationResponseDto })
  async markAsRead(
    @Req() req: AuthorizedRequest,
    @Param('id') id: string,
  ) {
    const updated = await this.notificationService.markAsRead(
      req.organization.organizationId,
      id,
      req.user.id,
    );
    return createSuccessResponse(updated);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all unread notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Req() req: AuthorizedRequest) {
    const result = await this.notificationService.markAllAsRead(
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(result);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive a customer notification' })
  @ApiResponse({ status: 200, description: 'Notification archived', type: NotificationResponseDto })
  async archiveNotification(
    @Req() req: AuthorizedRequest,
    @Param('id') id: string,
  ) {
    const updated = await this.notificationService.archiveNotification(
      req.organization.organizationId,
      id,
      req.user.id,
    );
    return createSuccessResponse(updated);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get customer notification preferences' })
  @ApiResponse({ status: 200, description: 'Customer notification preferences', type: NotificationPreferenceResponseDto })
  async getPreferences(@Req() req: AuthorizedRequest) {
    const prefs = await this.preferenceService.getPreferences(
      req.organization.organizationId,
      req.user.id,
    );
    return createSuccessResponse(prefs);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update customer notification preferences' })
  @ApiResponse({ status: 200, description: 'Updated notification preferences', type: NotificationPreferenceResponseDto })
  async updatePreferences(
    @Req() req: AuthorizedRequest,
    @Body() dto: UpdateNotificationPreferenceDto,
  ) {
    const updated = await this.preferenceService.updatePreferences(
      req.organization.organizationId,
      req.user.id,
      dto,
    );
    return createSuccessResponse(updated);
  }
}
