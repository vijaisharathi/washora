import { Injectable, NotFoundException } from '@nestjs/common';
import { BroadcastService } from '../../notifications/services/broadcast.service';
import { NotificationTemplateService } from '../../notifications/services/notification-template.service';
import { AdminRepository } from '../admin.repository';
import { AdminBroadcastDto } from '../dto/operations-admin.dto';
import { AdminAuditEvent, AdminErrorCode } from '../types/admin.types';
import { AdminAuditService } from './admin-audit.service';

@Injectable()
export class AdminNotificationService {
  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly broadcastService: BroadcastService,
    private readonly templateService: NotificationTemplateService,
    private readonly auditService: AdminAuditService,
  ) {}

  async listNotifications(orgId: string, query: any) {
    return this.adminRepo.findNotifications(orgId, query);
  }

  async getNotification(orgId: string, notificationId: string) {
    const notification = await this.adminRepo.findNotificationById(notificationId, orgId);
    if (!notification) {
      throw new NotFoundException({
        code: AdminErrorCode.NOTIFICATION_NOT_FOUND,
        message: `Notification ${notificationId} not found`,
      });
    }
    return notification;
  }

  async listTemplates(orgId: string, query?: any) {
    return this.templateService.getTemplates(orgId, query);
  }

  async getTemplate(orgId: string, templateId: string) {
    return this.templateService.getTemplateById(orgId, templateId);
  }

  async updateTemplate(
    orgId: string,
    templateId: string,
    dto: any,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const updated = await this.templateService.updateTemplate(
      orgId,
      templateId,
      dto,
      actorUserId,
    );

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.NOTIFICATION_TEMPLATE_UPDATED,
      entityType: 'NotificationTemplate',
      entityId: templateId,
      metadata: { changes: dto },
      ipHash: ipAddress,
    });

    return updated;
  }

  async sendBroadcast(
    orgId: string,
    dto: AdminBroadcastDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const recipientType = (dto as any).recipientType || dto.audience || 'ALL';
    const result = await this.broadcastService.createBroadcast(
      orgId,
      {
        recipientType: recipientType as any,
        title: dto.title,
        message: dto.message,
        channels: dto.channels as any,
      } as any,
      actorUserId,
    );

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.BROADCAST_SENT,
      entityType: 'Broadcast',
      entityId: orgId,
      metadata: {
        recipientType,
        title: dto.title,
        channels: dto.channels,
      },
      ipHash: ipAddress,
    });

    return result;
  }
}
