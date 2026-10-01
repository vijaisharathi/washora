import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { CustomerNotificationController } from './controllers/customer-notification.controller';
import { ProviderNotificationController } from './controllers/provider-notification.controller';
import { DeliveryPartnerNotificationController } from './controllers/delivery-partner-notification.controller';
import { OperationsNotificationController } from './controllers/operations-notification.controller';
import { NotificationsRepository } from './repositories/notifications.repository';
import { TemplateResolverService } from './services/template-resolver.service';
import { PreferenceEvaluatorService } from './services/preference-evaluator.service';
import { MockCommunicationProvider } from './services/delivery-adapter.service';
import { NotificationService } from './services/notification.service';
import { NotificationPreferenceService } from './services/notification-preference.service';
import { NotificationTemplateService } from './services/notification-template.service';
import { CommunicationService } from './services/communication.service';
import { BroadcastService } from './services/broadcast.service';
import { NotificationEventService } from './services/notification-event.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    CustomerNotificationController,
    ProviderNotificationController,
    DeliveryPartnerNotificationController,
    OperationsNotificationController,
  ],
  providers: [
    NotificationsRepository,
    TemplateResolverService,
    PreferenceEvaluatorService,
    MockCommunicationProvider,
    NotificationService,
    NotificationPreferenceService,
    NotificationTemplateService,
    CommunicationService,
    BroadcastService,
    NotificationEventService,
  ],
  exports: [
    NotificationsRepository,
    TemplateResolverService,
    PreferenceEvaluatorService,
    MockCommunicationProvider,
    NotificationService,
    NotificationPreferenceService,
    NotificationTemplateService,
    CommunicationService,
    BroadcastService,
    NotificationEventService,
  ],
})
export class NotificationsModule {}
