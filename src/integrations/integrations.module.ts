import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MockPaymentProviderService } from './payments/mock-payment-provider.service';
import { MockEmailProviderService } from './communications/email/mock-email-provider.service';
import { MockSmsProviderService } from './communications/sms/mock-sms-provider.service';
import { MockPushProviderService } from './communications/push/mock-push-provider.service';
import { MockStorageProviderService } from './storage/mock-storage-provider.service';
import { MockMapsProviderService } from './maps/mock-maps-provider.service';
import { WebhookRepository } from './webhooks/webhook.repository';
import { WebhookService } from './webhooks/webhook.service';
import { WebhookController } from './webhooks/webhook.controller';
import { IntegrationVerifierService } from './integration-verifier.service';

@Module({
  imports: [ConfigModule],
  controllers: [WebhookController],
  providers: [
    IntegrationVerifierService,
    MockPaymentProviderService,
    MockEmailProviderService,
    MockSmsProviderService,
    MockPushProviderService,
    MockStorageProviderService,
    MockMapsProviderService,
    WebhookRepository,
    WebhookService,
    // Alias interfaces to mock services
    {
      provide: 'IPaymentProvider',
      useExisting: MockPaymentProviderService,
    },
    {
      provide: 'IEmailProvider',
      useExisting: MockEmailProviderService,
    },
    {
      provide: 'ISmsProvider',
      useExisting: MockSmsProviderService,
    },
    {
      provide: 'IPushProvider',
      useExisting: MockPushProviderService,
    },
    {
      provide: 'IStorageProvider',
      useExisting: MockStorageProviderService,
    },
    {
      provide: 'IMapsProvider',
      useExisting: MockMapsProviderService,
    },
  ],
  exports: [
    IntegrationVerifierService,
    MockPaymentProviderService,
    MockEmailProviderService,
    MockSmsProviderService,
    MockPushProviderService,
    MockStorageProviderService,
    MockMapsProviderService,
    WebhookRepository,
    WebhookService,
    'IPaymentProvider',
    'IEmailProvider',
    'ISmsProvider',
    'IPushProvider',
    'IStorageProvider',
    'IMapsProvider',
  ],
})
export class IntegrationsModule {}
