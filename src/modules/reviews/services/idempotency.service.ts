import { ConflictException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ReviewsErrorCode } from '../types/reviews.types';

interface IdempotencyEntry {
  hash: string;
  response: any;
  createdAt: number;
}

@Injectable()
export class IdempotencyService {
  private readonly cache = new Map<string, IdempotencyEntry>();
  private readonly TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  computeHash(payload: any): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(payload || {}))
      .digest('hex');
  }

  get<T>(scope: string, key: string, payload: any): T | null {
    const storeKey = `${scope}::${key}`;
    const entry = this.cache.get(storeKey);

    if (!entry) {
      return null;
    }

    // Check expiration
    if (Date.now() - entry.createdAt > this.TTL_MS) {
      this.cache.delete(storeKey);
      return null;
    }

    const payloadHash = this.computeHash(payload);
    if (entry.hash !== payloadHash) {
      throw new ConflictException({
        code: ReviewsErrorCode.IDEMPOTENCY_KEY_CONFLICT,
        message: 'Idempotency key has already been used with a different request payload.',
      });
    }

    return entry.response as T;
  }

  set(scope: string, key: string, payload: any, response: any): void {
    const storeKey = `${scope}::${key}`;
    this.cache.set(storeKey, {
      hash: this.computeHash(payload),
      response,
      createdAt: Date.now(),
    });
  }
}
