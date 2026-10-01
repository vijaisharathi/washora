export interface SendPushParams {
  deviceToken: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  badge?: number;
}

export interface PushSendResult {
  providerMessageId: string;
  status: 'SENT' | 'FAILED';
  recipientToken: string;
  sentAt: Date;
}

export interface IPushProvider {
  sendPushNotification(params: SendPushParams): Promise<PushSendResult>;
}
