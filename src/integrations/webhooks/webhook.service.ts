import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPaymentProvider } from '../payments/payment-provider.interface';
import { MockPaymentProviderService } from '../payments/mock-payment-provider.service';
import { WebhookRepository } from './webhook.repository';
import { WebhookProcessResult } from './webhook.types';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly paymentProvider: MockPaymentProviderService,
    private readonly webhookRepository: WebhookRepository,
  ) {}

  async processPaymentWebhook(
    rawPayload: string | Buffer,
    signature: string,
    timestampHeader?: string,
  ): Promise<WebhookProcessResult> {
    const webhookSecret = this.configService.get<string>(
      'payment.webhookSecret',
      'mock_payment_webhook_secret_for_dev_only',
    );

    // 1. Signature Verification
    const isValidSignature = this.paymentProvider.verifyWebhookSignature(
      rawPayload,
      signature,
      webhookSecret,
    );

    if (!isValidSignature) {
      this.logger.warn('Invalid webhook signature received');
      throw new UnauthorizedException('Invalid webhook signature');
    }

    // 2. Parse Event
    const event = this.paymentProvider.parseWebhookEvent(rawPayload);

    // 3. Replay Prevention / Timestamp Tolerance (Tolerance: 300 seconds = 5 minutes)
    const nowSec = Math.floor(Date.now() / 1000);
    const eventTimestamp = timestampHeader ? parseInt(timestampHeader, 10) : event.created;
    if (eventTimestamp && Math.abs(nowSec - eventTimestamp) > 300) {
      this.logger.warn(`Webhook timestamp out of tolerance: event=${eventTimestamp}, now=${nowSec}`);
      throw new BadRequestException('Webhook timestamp expired or out of tolerance window');
    }

    const provider = 'mock_payment';
    const eventId = event.id;

    // 4. Idempotency Check
    const existing = await this.webhookRepository.findByProviderAndEventId(provider, eventId);
    if (existing) {
      if (existing.status === 'PROCESSED' || existing.status === 'PROCESSING') {
        this.logger.log(`Duplicate webhook event ${eventId} ignored (status: ${existing.status})`);
        return {
          status: 'IGNORED',
          eventId,
          message: 'Duplicate event already processed or in progress',
        };
      }
    }

    // 5. Record Webhook as RECEIVED
    await this.webhookRepository.create({
      provider,
      eventId,
      eventType: event.type,
      status: 'RECEIVED',
      payload: event.data,
      attempts: 1,
    });

    // 6. Transition to PROCESSING
    await this.webhookRepository.updateStatus(provider, eventId, 'PROCESSING');

    try {
      // 7. Business Logic / Handling
      // In accordance with B16 specifications:
      // Delegate to B10 domain services or emit domain events. Never mutate financial ledger directly.
      this.logger.log(`Processing webhook event ${event.type} for eventId ${eventId}`);

      // Successful handling
      await this.webhookRepository.updateStatus(provider, eventId, 'PROCESSED');
      return {
        status: 'PROCESSED',
        eventId,
        message: `Successfully processed ${event.type}`,
      };
    } catch (error: any) {
      this.logger.error(`Failed to process webhook event ${eventId}: ${error.message}`, error.stack);
      await this.webhookRepository.updateStatus(provider, eventId, 'FAILED', error.message);
      throw error;
    }
  }
}
