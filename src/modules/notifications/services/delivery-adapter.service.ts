import { Injectable } from '@nestjs/common';
import { CommunicationChannel } from '../types/notifications.types';

export interface CommunicationDispatchPayload {
  channel: CommunicationChannel;
  recipientAddress: string;
  subject?: string;
  body: string;
  content?: string | null;
  metadata?: Record<string, any>;
}

export interface CommunicationDispatchResult {
  success: boolean;
  provider: string;
  providerMessageId: string;
  error?: string;
}

export interface CommunicationProvider {
  send(payload: CommunicationDispatchPayload): Promise<CommunicationDispatchResult>;
}

@Injectable()
export class MockCommunicationProvider implements CommunicationProvider {
  /**
   * Deterministic mock dispatch satisfying strict B13 scope boundaries:
   * Do NOT call live external APIs (SendGrid, Twilio, AWS SES, Firebase).
   */
  async send(payload: CommunicationDispatchPayload): Promise<CommunicationDispatchResult> {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000000);
    const providerName = `MOCK_${payload.channel}_PROVIDER`;
    const providerMessageId = `msg_${payload.channel.toLowerCase()}_${timestamp}_${randomSuffix}`;

    // Simulate potential failure if address contains 'fail-delivery'
    if (payload.recipientAddress && payload.recipientAddress.includes('fail-delivery')) {
      return {
        success: false,
        provider: providerName,
        providerMessageId,
        error: 'Simulated network delivery failure to endpoint',
      };
    }

    return {
      success: true,
      provider: providerName,
      providerMessageId,
    };
  }
}
