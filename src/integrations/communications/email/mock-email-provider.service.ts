import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { EmailSendResult, IEmailProvider, SendEmailParams } from './email-provider.interface';

@Injectable()
export class MockEmailProviderService implements IEmailProvider {
  private readonly logger = new Logger(MockEmailProviderService.name);
  private readonly sentEmails = new Map<string, any>();

  async sendEmail(params: SendEmailParams): Promise<EmailSendResult> {
    const providerMessageId = `email_msg_${crypto.randomBytes(8).toString('hex')}`;
    const record = {
      providerMessageId,
      to: params.to,
      subject: params.subject,
      status: 'SENT',
      sentAt: new Date(),
    };

    this.sentEmails.set(providerMessageId, record);
    this.logger.log(`[MockEmail] Sent email "${params.subject}" to ${params.to} (${providerMessageId})`);

    return {
      providerMessageId,
      status: 'SENT',
      recipient: params.to,
      sentAt: record.sentAt,
    };
  }

  async getDeliveryStatus(providerMessageId: string): Promise<'DELIVERED' | 'BOUNCED' | 'PENDING' | 'FAILED'> {
    const email = this.sentEmails.get(providerMessageId);
    if (!email) return 'FAILED';
    return 'DELIVERED';
  }
}
