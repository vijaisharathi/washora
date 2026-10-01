import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import {
  AuthErrorCode,
  JwtAccessPayload,
  JwtRefreshPayload,
} from '../types/auth.types';

@Injectable()
export class TokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor(private readonly configService: ConfigService) {
    this.accessSecret =
      this.configService?.get<string>('jwt.accessSecret') ||
      process.env.JWT_ACCESS_SECRET ||
      'washora_super_secret_jwt_access_key_2026_production_grade';

    this.refreshSecret =
      this.configService?.get<string>('jwt.refreshSecret') ||
      process.env.JWT_REFRESH_SECRET ||
      'washora_super_secret_jwt_refresh_key_2026_production_grade';

    const isProd = process.env.NODE_ENV === 'production';
    if (isProd) {
      if (
        this.accessSecret === 'washora_super_secret_jwt_access_key_2026_production_grade' ||
        this.refreshSecret === 'washora_super_secret_jwt_refresh_key_2026_production_grade'
      ) {
        throw new Error('PRODUCTION_SECURITY_VIOLATION: Insecure default JWT secrets forbidden in production.');
      }
      if (this.accessSecret === this.refreshSecret) {
        throw new Error('PRODUCTION_SECURITY_VIOLATION: JWT access secret and refresh secret must be distinct.');
      }
    }

    this.accessExpiresIn =
      this.configService?.get<string>('jwt.accessTokenExpiresIn') ||
      process.env.ACCESS_TOKEN_EXPIRES_IN ||
      '15m';

    this.refreshExpiresIn =
      this.configService?.get<string>('jwt.refreshTokenExpiresIn') ||
      process.env.REFRESH_TOKEN_EXPIRES_IN ||
      '30d';
  }

  /**
   * Generate short-lived Access JWT token using strictly HS256.
   */
  generateAccessToken(
    user: { id: string; email: string },
    sessionId: string,
  ): string {
    const payload: Omit<JwtAccessPayload, 'iat' | 'exp'> = {
      sub: user.id,
      sid: sessionId,
      type: 'access',
      email: user.email,
    };

    return jwt.sign(payload, this.accessSecret, {
      algorithm: 'HS256',
      expiresIn: this.accessExpiresIn as any,
    });
  }

  /**
   * Generate long-lived Refresh JWT token using strictly HS256.
   */
  generateRefreshToken(user: { id: string }, sessionId: string): string {
    const payload: Omit<JwtRefreshPayload, 'iat' | 'exp'> = {
      sub: user.id,
      sid: sessionId,
      jti: crypto.randomUUID(),
      type: 'refresh',
    };

    return jwt.sign(payload, this.refreshSecret, {
      algorithm: 'HS256',
      expiresIn: this.refreshExpiresIn as any,
    });
  }

  /**
   * Generate complete token pair.
   */
  generateTokenPair(user: { id: string; email: string }, sessionId: string) {
    const accessToken = this.generateAccessToken(user, sessionId);
    const refreshToken = this.generateRefreshToken(user, sessionId);

    // Calculate numeric expiration seconds (e.g. 15m = 900)
    const expiresIn = this.parseDurationToSeconds(this.accessExpiresIn);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn,
    };
  }

  /**
   * Verify and decode an Access JWT token.
   * Rejects refresh tokens, non-HS256 algorithms, expired tokens, or invalid signatures.
   */
  verifyAccessToken(token: string): JwtAccessPayload {
    try {
      const decoded = jwt.verify(token, this.accessSecret, {
        algorithms: ['HS256'],
      }) as JwtAccessPayload;

      if (
        !decoded ||
        decoded.type !== 'access' ||
        !decoded.sub ||
        !decoded.sid
      ) {
        throw new UnauthorizedException({
          code: AuthErrorCode.INVALID_ACCESS_TOKEN,
          message: 'Invalid access token claims.',
        });
      }

      return decoded;
    } catch (err: any) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException({
        code: AuthErrorCode.INVALID_ACCESS_TOKEN,
        message:
          err.name === 'TokenExpiredError'
            ? 'Access token has expired.'
            : 'Invalid access token.',
      });
    }
  }

  /**
   * Verify and decode a Refresh JWT token.
   * Rejects access tokens, non-HS256 algorithms, expired tokens, or invalid signatures.
   */
  verifyRefreshToken(token: string): JwtRefreshPayload {
    try {
      const decoded = jwt.verify(token, this.refreshSecret, {
        algorithms: ['HS256'],
      }) as JwtRefreshPayload;

      if (
        !decoded ||
        decoded.type !== 'refresh' ||
        !decoded.sub ||
        !decoded.sid
      ) {
        throw new UnauthorizedException({
          code: AuthErrorCode.INVALID_REFRESH_TOKEN,
          message: 'Invalid refresh token claims.',
        });
      }

      return decoded;
    } catch (err: any) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException({
        code: AuthErrorCode.INVALID_REFRESH_TOKEN,
        message:
          err.name === 'TokenExpiredError'
            ? 'Refresh token has expired.'
            : 'Invalid refresh token.',
      });
    }
  }

  /**
   * Helper to parse string durations (e.g. '15m', '30d', '1h', '60s') into seconds.
   */
  private parseDurationToSeconds(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 900;
    }
    const val = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return val;
      case 'm':
        return val * 60;
      case 'h':
        return val * 3600;
      case 'd':
        return val * 86400;
      default:
        return 900;
    }
  }

  /**
   * Compute future expiration Date from string duration.
   */
  getRefreshExpirationDate(): Date {
    const seconds = this.parseDurationToSeconds(this.refreshExpiresIn);
    return new Date(Date.now() + seconds * 1000);
  }
}
