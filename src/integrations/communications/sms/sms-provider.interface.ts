export interface SendSmsParams {
  to: string;
  body: string;
  senderId?: string;
  metadata?: Record<string, any>;
}

export interface SmsSendResult {
  providerMessageId: string;
  status: 'QUEUED' | 'SENT' | 'FAILED';
  recipient: string;
  sentAt: Date;
}

export interface ISmsProvider {
  sendSms(params: SendSmsParams): Promise<SmsSendResult>;
  getDeliveryStatus(providerMessageId: string): Promise<'DELIVERED' | 'UNDELIVERED' | 'PENDING' | 'FAILED'>;
}
