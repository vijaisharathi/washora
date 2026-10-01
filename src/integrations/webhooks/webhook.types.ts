export type WebhookStatus =
  | 'RECEIVED'
  | 'PROCESSING'
  | 'PROCESSED'
  | 'FAILED'
  | 'IGNORED';

export interface WebhookRecord {
  id: string;
  provider: string;
  eventId: string;
  eventType: string;
  status: WebhookStatus;
  payload: any;
  attempts: number;
  error?: string;
  receivedAt: Date;
  processedAt?: Date;
}

export interface WebhookProcessResult {
  status: 'PROCESSED' | 'IGNORED' | 'FAILED';
  eventId: string;
  message?: string;
}
