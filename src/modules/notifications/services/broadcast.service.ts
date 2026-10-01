import { BadRequestException, Injectable } from '@nestjs/common';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { CommunicationService } from './communication.service';
import {
  CommunicationChannel,
  NotificationAuditAction,
  NotificationErrorCode,
  NotificationPriority,
  NotificationType,
} from '../types/notifications.types';
import { CreateBroadcastNotificationDto } from '../dto';

@Injectable()
export class BroadcastService {
  constructor(
    private readonly repository: NotificationsRepository,
    private readonly communicationService: CommunicationService,
  ) {}

  async createBroadcast(
    organizationId: string,
    dto: CreateBroadcastNotificationDto,
    actorUserId: string,
  ) {
    // 1. Resolve recipients
    const recipientUserIds = await this.repository.findUserIdsByRecipientType(
      organizationId,
      dto.recipientType,
    );

    if (recipientUserIds.length === 0) {
      throw new BadRequestException({
        code: NotificationErrorCode.RECIPIENT_RESOLUTION_EMPTY,
        message: `No active users found for audience type: ${dto.recipientType}`,
      });
    }

    const priority = dto.priority || NotificationPriority.MEDIUM;
    const channels = dto.channels || [CommunicationChannel.IN_APP];

    let inAppCount = 0;
    // 2. If IN_APP in channels, batch create notifications
    if (channels.includes(CommunicationChannel.IN_APP)) {
      inAppCount = await this.repository.createNotificationsBatch(
        organizationId,
        recipientUserIds,
        {
          type: NotificationType.SYSTEM,
          title: dto.title,
          message: dto.message,
          priority,
          linkUrl: dto.linkUrl,
        },
      );
    }

    // 3. If external channels requested, create communication dispatch records
    const externalChannels = channels.filter((c) => c !== CommunicationChannel.IN_APP);
    let communicationsDispatched = 0;

    for (const channel of externalChannels) {
      // Dispatch communication record
      await this.communicationService.dispatchCommunication({
        organizationId,
        senderUserId: actorUserId,
        channel,
        type: 'BROADCAST',
        subject: dto.title,
        body: dto.message,
        recipients: recipientUserIds.map((uid) => ({
          recipientType: dto.recipientType,
          userId: uid,
          channelAddress: `user_${uid}@washora.internal`,
        })),
      });
      communicationsDispatched++;
    }

    // 4. Record Audit Event
    await this.repository.recordAuditEvent(
      organizationId,
      actorUserId,
      NotificationAuditAction.OPERATIONS_BROADCAST_CREATED,
      'Broadcast',
      organizationId,
      {
        recipientType: dto.recipientType,
        recipientCount: recipientUserIds.length,
        inAppCreated: inAppCount,
        externalChannelsDispatched: communicationsDispatched,
        title: dto.title,
      },
    );

    return {
      success: true,
      recipientType: dto.recipientType,
      totalRecipients: recipientUserIds.length,
      inAppNotificationsCreated: inAppCount,
      externalChannelsDispatched: communicationsDispatched,
      channels,
    };
  }
}
