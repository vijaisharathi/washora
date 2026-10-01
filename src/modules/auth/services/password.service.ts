import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class PasswordService {
  private readonly saltRounds = 12;

  // Local common denylist of easily guessable passwords
  private readonly commonPasswordsDenylist = new Set([
    'password1234',
    'password12345',
    '123456789012',
    'admin12345678',
    'qwertyuiop12',
    'welcome123456',
    'letmein123456',
    'washora123456',
    'iloveyou12345',
    'changeme12345',
  ]);

  /**
   * Validates password against production security policy:
   * - Minimum 12 characters
   * - Not in common denylist
   * - Allows long passphrases
   */
  validatePasswordPolicy(password: string): void {
    if (!password || password.length < 12) {
      throw new BadRequestException({
        code: 'PASSWORD_TOO_SHORT',
        message: 'Password must be at least 12 characters long.',
      });
    }

    if (password.length > 256) {
      throw new BadRequestException({
        code: 'PASSWORD_TOO_LONG',
        message: 'Password cannot exceed 256 characters.',
      });
    }

    if (this.commonPasswordsDenylist.has(password.toLowerCase())) {
      throw new BadRequestException({
        code: 'PASSWORD_TOO_COMMON',
        message: 'The chosen password is too common and easily compromised. Please choose a stronger password or passphrase.',
      });
    }
  }

  /**
   * Securely hash a plaintext password with bcrypt (12 rounds).
   */
  async hashPassword(password: string): Promise<string> {
    this.validatePasswordPolicy(password);
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Verify a plaintext password against a stored bcrypt hash.
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) {
      return false;
    }
    return bcrypt.compare(password, hash);
  }

  /**
   * Constant-time comparison between two strings to prevent timing attacks.
   */
  timingSafeEqual(a: string, b: string): boolean {
    if (typeof a !== 'string' || typeof b !== 'string') {
      return false;
    }
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  }

  /**
   * Cryptographically hash a token (refresh token, reset token, verification token) using SHA-256.
   * Ensures tokens are never stored plaintext in the database.
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generate a cryptographically secure random hexadecimal token.
   */
  generateSecureToken(bytes: number = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }
}
