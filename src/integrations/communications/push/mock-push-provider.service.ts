import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { IPushProvider, PushSendResult, SendPushParams } from './push-provider.interface';

@Injectable()
export class MockPushProviderService implements IPushProvider {
  private readonly logger = new Logger(MockPushProviderService.name);
  private readonly sentPushes = new Map<string, any>();

  async sendPushNotification(params: SendPushParams): Promise<PushSendResult> {
    const providerMessageId = `push_msg_${crypto.randomBytes(8).toString('hex')}`;
    const record = {
      providerMessageId,
      deviceToken: params.deviceToken,
      title: params.title,
      body: params.body,
      status: 'SENT',
      sentAt: new Date(),
    };

    this.sentPushes.set(providerMessageId, record);
    this.logger.log(`[MockPush] Sent push notification "${params.title}" to token ${params.deviceToken.substring(0, 10)}...`);

    return {
      providerMessageId,
      status: 'SENT',
      recipientToken: params.deviceToken,
      sentAt: record.sentAt,
    };
  }
}
