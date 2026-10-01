export interface SendEmailParams {
  to: string;
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  from?: string;
  replyTo?: string;
  metadata?: Record<string, any>;
}

export interface EmailSendResult {
  providerMessageId: string;
  status: 'QUEUED' | 'SENT' | 'FAILED';
  recipient: string;
  sentAt: Date;
}

export interface IEmailProvider {
  sendEmail(params: SendEmailParams): Promise<EmailSendResult>;
  getDeliveryStatus(providerMessageId: string): Promise<'DELIVERED' | 'BOUNCED' | 'PENDING' | 'FAILED'>;
}
