import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { TemplateResolverService } from './template-resolver.service';
import { PreferenceEvaluatorService } from './preference-evaluator.service';
import { NotificationService } from './notification.service';
import { CommunicationService } from './communication.service';
import {
  CommunicationChannel,
  NotificationEvent,
  NotificationPriority,
  NotificationType,
  RecipientType,
} from '../types/notifications.types';

@Injectable()
export class NotificationEventService {
  constructor(
    private readonly repository: NotificationsRepository,
    private readonly templateResolver: TemplateResolverService,
    private readonly preferenceEvaluator: PreferenceEvaluatorService,
    private readonly notificationService: NotificationService,
    private readonly communicationService: CommunicationService,
  ) {}

  /**
   * Dispatches domain events to notifications & communications with SHA-256 idempotency.
   * Does NOT mutate source business records.
   */
  async handleDomainEvent(event: NotificationEvent): Promise<{
    processed: boolean;
    alreadyProcessed?: boolean;
    inAppCount: number;
    communicationCount: number;
  }> {
    // 1. Idempotency Check: check if eventId already processed
    const existingLog = await this.repository.findEventLog(event.eventId);
    if (existingLog) {
      return {
        processed: true,
        alreadyProcessed: true,
        inAppCount: 0,
        communicationCount: 0,
      };
    }

    // 2. Persist event log to guarantee idempotency
    await this.repository.createEventLog({
      eventId: event.eventId,
      organizationId: event.organizationId,
      eventType: event.eventType,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      payload: event.data,
    });

    let inAppCount = 0;
    let communicationCount = 0;

    // 3. For each recipient, evaluate preferences and dispatch
    for (const recipientUserId of event.recipientUserIds) {
      const preferences = await this.repository.getPreferences(
        event.organizationId,
        recipientUserId,
      );

      // (A) Check IN_APP delivery
      const shouldDeliverInApp = this.preferenceEvaluator.shouldDeliver(
        event.eventType,
        CommunicationChannel.IN_APP,
        preferences,
      );

      if (shouldDeliverInApp) {
        // Find active template or format default
        const template = await this.repository.findActiveTemplate(
          event.organizationId,
          event.eventType,
          CommunicationChannel.IN_APP,
        );

        let title = event.data.title || `Update: ${event.eventType.replace(/_/g, ' ')}`;
        let message = event.data.message || `An update occurred regarding your ${event.resourceType.toLowerCase()}.`;

        if (template) {
          title = this.templateResolver.interpolate(template.titleTemplate, event.data);
          message = this.templateResolver.interpolate(template.bodyTemplate, event.data);
        }

        await this.notificationService.createNotification(
          event.organizationId,
          {
            recipientUserId,
            type: NotificationType.ORDER_STATUS,
            title,
            message,
            priority: (event.priority as NotificationPriority) || NotificationPriority.MEDIUM,
            linkUrl: event.data.linkUrl || `/${event.resourceType.toLowerCase()}s/${event.resourceId}`,
            data: event.data,
          },
        );
        inAppCount++;
      }

      // (B) Check EMAIL delivery
      const shouldDeliverEmail = this.preferenceEvaluator.shouldDeliver(
        event.eventType,
        CommunicationChannel.EMAIL,
        preferences,
      );

      if (shouldDeliverEmail) {
        const emailTemplate = await this.repository.findActiveTemplate(
          event.organizationId,
          event.eventType,
          CommunicationChannel.EMAIL,
        );

        if (emailTemplate) {
          const subject = emailTemplate.subject
            ? this.templateResolver.interpolate(emailTemplate.subject, event.data)
            : `Update: ${event.eventType.replace(/_/g, ' ')}`;
          const body = this.templateResolver.interpolate(emailTemplate.bodyTemplate, event.data);

          await this.communicationService.dispatchCommunication({
            organizationId: event.organizationId,
            senderUserId: recipientUserId, // system/actor
            channel: CommunicationChannel.EMAIL,
            type: 'TRANSACTIONAL',
            subject,
            body,
            recipients: [
              {
                recipientType: RecipientType.CUSTOMER,
                userId: recipientUserId,
                channelAddress: event.data.customerEmail || `user_${recipientUserId}@washora.internal`,
              },
            ],
          });
          communicationCount++;
        }
      }
    }

    return {
      processed: true,
      alreadyProcessed: false,
      inAppCount,
      communicationCount,
    };
  }
}
