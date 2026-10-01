import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class SecretManagerService {
  private readonly logger = new Logger(SecretManagerService.name);
  private readonly sensitivePatterns = [
    /secret/i,
    /key/i,
    /token/i,
    /password/i,
    /authorization/i,
    /database_url/i,
    /direct_database_url/i,
    /cvv/i,
    /salt/i,
    /hash/i,
  ];

  constructor(private readonly configService: ConfigService) {}

  /**
   * Retrieves a secret configuration value safely.
   */
  getSecret(key: string, defaultValue?: string): string {
    return this.configService.get<string>(key, defaultValue as any) || '';
  }

  /**
   * Masks a sensitive string for diagnostics and logging.
   * e.g., "postgresql://user:pass@host/db" -> "postg********host/db" or "********"
   */
  mask(val: string | null | undefined, visibleChars = 4): string {
    if (!val) return '********';
    if (val.length <= visibleChars * 2) {
      return '********';
    }
    const prefix = val.slice(0, visibleChars);
    const suffix = val.slice(-visibleChars);
    return `${prefix}********${suffix}`;
  }

  /**
   * Sanitizes a dictionary of configuration or environment variables.
   * Replaces any key containing secret/password/token/key/database with masked asterisks.
   */
  sanitizeConfig(config: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [k, v] of Object.entries(config)) {
      const isSensitive = this.sensitivePatterns.some((pattern) =>
        pattern.test(k),
      );
      if (isSensitive && typeof v === 'string') {
        sanitized[k] = '********';
      } else if (v && typeof v === 'object' && !Array.isArray(v)) {
        sanitized[k] = this.sanitizeConfig(v);
      } else {
        sanitized[k] = v;
      }
    }

    return sanitized;
  }

  /**
   * Symmetric AES-256-GCM encryption for sensitive fields in database.
   */
  encrypt(plaintext: string, secretKey?: string): string {
    const keyStr =
      secretKey ||
      this.configService.get<string>('security.encryptionKey') ||
      'washora_default_encryption_key_32_bytes_len!';
    const key = crypto.createHash('sha256').update(keyStr).digest(); // 32 bytes
    const iv = crypto.randomBytes(12); // 12 bytes for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Symmetric AES-256-GCM decryption for sensitive fields.
   */
  decrypt(cipherPayload: string, secretKey?: string): string {
    const parts = cipherPayload.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted payload format.');
    }
    const [ivHex, authTagHex, encryptedHex] = parts;
    const keyStr =
      secretKey ||
      this.configService.get<string>('security.encryptionKey') ||
      'washora_default_encryption_key_32_bytes_len!';
    const key = crypto.createHash('sha256').update(keyStr).digest();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
