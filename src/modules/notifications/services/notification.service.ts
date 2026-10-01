import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationsRepository } from '../repositories/notifications.repository';
import {
  NotificationAuditAction,
  NotificationErrorCode,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from '../types/notifications.types';
import { NotificationListQueryDto } from '../dto';

@Injectable()
export class NotificationService {
  constructor(private readonly repository: NotificationsRepository) {}

  async getUserNotifications(
    organizationId: string,
    userId: string,
    query: NotificationListQueryDto,
  ) {
    return this.repository.findNotificationsByUser(organizationId, userId, query);
  }

  async getUnreadCount(organizationId: string, userId: string) {
    return this.repository.countUnreadNotifications(organizationId, userId);
  }

  async markAsRead(
    organizationId: string,
    notificationIdentifier: string,
    userId: string,
  ) {
    const notification = await this.repository.findNotificationById(
      organizationId,
      notificationIdentifier,
    );

    if (!notification) {
      throw new NotFoundException({
        code: NotificationErrorCode.NOTIFICATION_NOT_FOUND,
        message: `Notification ${notificationIdentifier} was not found`,
      });
    }

    if (notification.organizationId !== organizationId) {
      throw new ForbiddenException({
        code: NotificationErrorCode.TENANT_MISMATCH,
        message: 'Notification belongs to a different organization',
      });
    }

    if (notification.recipientUserId !== userId) {
      throw new ForbiddenException({
        code: NotificationErrorCode.NOTIFICATION_FORBIDDEN,
        message: 'You cannot mark another user\'s notification as read',
      });
    }

    if (notification.status === NotificationStatus.UNREAD) {
      await this.repository.markNotificationAsRead(organizationId, notification.id, userId);

      await this.repository.recordAuditEvent(
        organizationId,
        userId,
        NotificationAuditAction.NOTIFICATION_READ,
        'Notification',
        notification.id,
        {
          publicId: notification.publicId,
          readAt: new Date().toISOString(),
        },
      );
    }

    return {
      ...notification,
      status: NotificationStatus.READ,
      readAt: notification.readAt || new Date(),
    };
  }

  async markAllAsRead(organizationId: string, userId: string) {
    const result = await this.repository.markAllNotificationsAsRead(organizationId, userId);

    await this.repository.recordAuditEvent(
      organizationId,
      userId,
      NotificationAuditAction.NOTIFICATION_BULK_READ,
      'Notification',
      userId,
      {
        count: result.count,
        timestamp: new Date().toISOString(),
      },
    );

    return {
      success: true,
      updatedCount: result.count,
    };
  }

  async archiveNotification(
    organizationId: string,
    notificationIdentifier: string,
    userId: string,
  ) {
    const notification = await this.repository.findNotificationById(
      organizationId,
      notificationIdentifier,
    );

    if (!notification) {
      throw new NotFoundException({
        code: NotificationErrorCode.NOTIFICATION_NOT_FOUND,
        message: `Notification ${notificationIdentifier} was not found`,
      });
    }

    if (notification.organizationId !== organizationId) {
      throw new ForbiddenException({
        code: NotificationErrorCode.TENANT_MISMATCH,
        message: 'Notification belongs to a different organization',
      });
    }

    if (notification.recipientUserId !== userId) {
      throw new ForbiddenException({
        code: NotificationErrorCode.NOTIFICATION_FORBIDDEN,
        message: 'You cannot archive another user\'s notification',
      });
    }

    await this.repository.archiveNotification(organizationId, notification.id, userId);

    await this.repository.recordAuditEvent(
      organizationId,
      userId,
      NotificationAuditAction.NOTIFICATION_ARCHIVED,
      'Notification',
      notification.id,
      {
        publicId: notification.publicId,
        previousStatus: notification.status,
      },
    );

    return {
      ...notification,
      status: NotificationStatus.ARCHIVED,
    };
  }

  async createNotification(
    organizationId: string,
    data: {
      recipientUserId: string;
      type: NotificationType;
      title: string;
      message: string;
      priority?: NotificationPriority;
      linkUrl?: string | null;
      data?: any;
    },
    actorUserId?: string | null,
  ) {
    const notification = await this.repository.createNotification({
      organizationId,
      recipientUserId: data.recipientUserId,
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority ?? NotificationPriority.MEDIUM,
      linkUrl: data.linkUrl ?? null,
      data: data.data,
    });

    await this.repository.recordAuditEvent(
      organizationId,
      actorUserId ?? null,
      NotificationAuditAction.NOTIFICATION_CREATED,
      'Notification',
      notification.id,
      {
        publicId: notification.publicId,
        recipientUserId: notification.recipientUserId,
        type: notification.type,
        priority: notification.priority,
      },
    );

    return notification;
  }
}
