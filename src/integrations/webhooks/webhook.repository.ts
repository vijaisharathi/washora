import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { WebhookRecord, WebhookStatus } from './webhook.types';

@Injectable()
export class WebhookRepository {
  private readonly records = new Map<string, WebhookRecord>();

  private makeKey(provider: string, eventId: string): string {
    return `${provider}:${eventId}`;
  }

  async findByProviderAndEventId(provider: string, eventId: string): Promise<WebhookRecord | null> {
    const key = this.makeKey(provider, eventId);
    return this.records.get(key) || null;
  }

  async create(data: Omit<WebhookRecord, 'id' | 'receivedAt'>): Promise<WebhookRecord> {
    const key = this.makeKey(data.provider, data.eventId);
    const id = `wh_${crypto.randomBytes(8).toString('hex')}`;
    const record: WebhookRecord = {
      id,
      ...data,
      receivedAt: new Date(),
    };
    this.records.set(key, record);
    return record;
  }

  async updateStatus(provider: string, eventId: string, status: WebhookStatus, error?: string): Promise<WebhookRecord> {
    const key = this.makeKey(provider, eventId);
    const record = this.records.get(key);
    if (!record) {
      throw new Error(`Webhook record not found for ${key}`);
    }

    record.status = status;
    record.error = error;
    if (status === 'PROCESSED' || status === 'FAILED' || status === 'IGNORED') {
      record.processedAt = new Date();
    }
    this.records.set(key, record);
    return record;
  }

  async incrementAttempts(provider: string, eventId: string): Promise<void> {
    const key = this.makeKey(provider, eventId);
    const record = this.records.get(key);
    if (record) {
      record.attempts += 1;
      this.records.set(key, record);
    }
  }
}
