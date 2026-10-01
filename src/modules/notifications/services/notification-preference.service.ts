import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { NotificationAuditAction } from '../types/notifications.types';
import { UpdateNotificationPreferenceDto } from '../dto';

@Injectable()
export class NotificationPreferenceService {
  constructor(private readonly repository: NotificationsRepository) {}

  async getPreferences(organizationId: string, userId: string) {
    return this.repository.getPreferences(organizationId, userId);
  }

  async updatePreferences(
    organizationId: string,
    userId: string,
    dto: UpdateNotificationPreferenceDto,
  ) {
    const updated = await this.repository.upsertPreferences(
      organizationId,
      userId,
      {
        inAppEnabled: dto.inAppEnabled,
        emailEnabled: dto.emailEnabled,
        smsEnabled: dto.smsEnabled,
        whatsappEnabled: dto.whatsappEnabled,
        pushEnabled: dto.pushEnabled,
        orderUpdates: dto.orderUpdates,
        marketingOffers: dto.marketingOffers,
        systemAlerts: dto.systemAlerts,
        categories: dto.categories,
      },
    );

    await this.repository.recordAuditEvent(
      organizationId,
      userId,
      NotificationAuditAction.NOTIFICATION_PREFERENCE_UPDATED,
      'NotificationPreference',
      updated.id,
      {
        userId,
        inAppEnabled: updated.inAppEnabled,
        emailEnabled: updated.emailEnabled,
        smsEnabled: updated.smsEnabled,
        whatsappEnabled: updated.whatsappEnabled,
        pushEnabled: updated.pushEnabled,
      },
    );

    return updated;
  }
}
