import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { ISmsProvider, SendSmsParams, SmsSendResult } from './sms-provider.interface';

@Injectable()
export class MockSmsProviderService implements ISmsProvider {
  private readonly logger = new Logger(MockSmsProviderService.name);
  private readonly sentSms = new Map<string, any>();

  async sendSms(params: SendSmsParams): Promise<SmsSendResult> {
    const providerMessageId = `sms_msg_${crypto.randomBytes(8).toString('hex')}`;
    const record = {
      providerMessageId,
      to: params.to,
      body: params.body,
      status: 'SENT',
      sentAt: new Date(),
    };

    this.sentSms.set(providerMessageId, record);
    this.logger.log(`[MockSms] Sent SMS to ${params.to} (${providerMessageId}): "${params.body.substring(0, 30)}..."`);

    return {
      providerMessageId,
      status: 'SENT',
      recipient: params.to,
      sentAt: record.sentAt,
    };
  }

  async getDeliveryStatus(providerMessageId: string): Promise<'DELIVERED' | 'UNDELIVERED' | 'PENDING' | 'FAILED'> {
    const sms = this.sentSms.get(providerMessageId);
    if (!sms) return 'FAILED';
    return 'DELIVERED';
  }
}
