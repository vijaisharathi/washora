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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { createSuccessResponse } from '../../../common/utils/response.util';
import { CurrentOrganization } from '../../authorization/decorators/current-organization.decorator';
import { Roles } from '../../authorization/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrganizationGuard } from '../../authorization/guards/organization.guard';
import { RolesGuard } from '../../authorization/guards/roles.guard';
import type { OrganizationContext } from '../../authorization/types/authorization.types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/types/auth.types';
import { AdminBroadcastDto } from '../dto/operations-admin.dto';
import { AdminNotificationService } from '../services/admin-notification.service';

@ApiTags('Admin — Notifications & Communication')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationGuard, RolesGuard)
@Controller('admin/notifications')
export class AdminNotificationController {
  constructor(private readonly notificationService: AdminNotificationService) {}

  @Get()
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'List platform notifications and delivery status' })
  async listNotifications(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: any,
  ) {
    const data = await this.notificationService.listNotifications(org.organizationId, query);
    return createSuccessResponse(data);
  }

  @Get('templates/all')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'List notification templates across channels' })
  async listTemplates(
    @CurrentOrganization() org: OrganizationContext,
    @Query() query: any,
  ) {
    const data = await this.notificationService.listTemplates(org.organizationId, query);
    return createSuccessResponse(data);
  }

  @Get('templates/:id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get notification template details' })
  async getTemplate(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') templateId: string,
  ) {
    const data = await this.notificationService.getTemplate(org.organizationId, templateId);
    return createSuccessResponse(data);
  }

  @Patch('templates/:id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Update notification template subject or body (Admin only)' })
  async updateTemplate(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') templateId: string,
    @Body() dto: any,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.notificationService.updateTemplate(
      org.organizationId,
      templateId,
      dto,
      user.id,
      ip,
    );
    return createSuccessResponse(data);
  }

  @Post('broadcast')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Broadcast notification to audience segment (Admin only)' })
  async sendBroadcast(
    @CurrentOrganization() org: OrganizationContext,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AdminBroadcastDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    const data = await this.notificationService.sendBroadcast(
      org.organizationId,
      dto,
      user.id,
      ip,
    );
    return createSuccessResponse(data);
  }

  @Get(':id')
  @Roles(RoleType.ADMIN, RoleType.OPERATIONS)
  @ApiOperation({ summary: 'Get notification details and delivery logs' })
  async getNotification(
    @CurrentOrganization() org: OrganizationContext,
    @Param('id') notificationId: string,
  ) {
    const data = await this.notificationService.getNotification(org.organizationId, notificationId);
    return createSuccessResponse(data);
  }
}
