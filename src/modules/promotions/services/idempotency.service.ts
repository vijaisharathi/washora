import { ConflictException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PromotionErrorCode } from '../types/promotions.types';

export interface IdempotencyEntry {
  key: string;
  scope: string;
  payloadHash: string;
  response: any;
  createdAt: number;
}

@Injectable()
export class IdempotencyService {
  private readonly store = new Map<string, IdempotencyEntry>();
  private readonly TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  private getStoreKey(scope: string, key: string): string {
    return `${scope}::${key}`;
  }

  computeHash(payload: any): string {
    const serialized =
      typeof payload === 'string' ? payload : JSON.stringify(payload || {});
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  check<T = any>(scope: string, key: string, payload: any): T | null {
    if (!key || !key.trim()) return null;

    const storeKey = this.getStoreKey(scope, key.trim());
    const entry = this.store.get(storeKey);

    if (!entry) return null;

    if (Date.now() - entry.createdAt > this.TTL_MS) {
      this.store.delete(storeKey);
      return null;
    }

    const currentHash = this.computeHash(payload);
    if (entry.payloadHash !== currentHash) {
      throw new ConflictException({
        code: PromotionErrorCode.IDEMPOTENCY_KEY_CONFLICT,
        message: `Idempotency key '${key}' has already been used with a different request payload.`,
      });
    }

    return entry.response as T;
  }

  save(scope: string, key: string, payload: any, response: any): void {
    if (!key || !key.trim()) return;

    const storeKey = this.getStoreKey(scope, key.trim());
    this.store.set(storeKey, {
      key: key.trim(),
      scope,
      payloadHash: this.computeHash(payload),
      response,
      createdAt: Date.now(),
    });
  }
}
