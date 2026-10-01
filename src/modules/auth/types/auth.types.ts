import { Request } from 'express';
import { UserStatus } from '@prisma/client';

export type TokenType = 'access' | 'refresh';

export interface JwtAccessPayload {
  sub: string; // userId
  sid: string; // sessionId
  type: 'access';
  email: string;
  iat?: number;
  exp?: number;
}

export interface JwtRefreshPayload {
  sub: string; // userId
  sid: string; // sessionId
  jti?: string; // unique JWT ID
  type: 'refresh';
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  phone?: string | null;
  status: UserStatus;
  emailVerifiedAt?: Date | null;
  phoneVerifiedAt?: Date | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
  sessionId: string;
  requestId?: string;
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
  ACCOUNT_PENDING = 'ACCOUNT_PENDING',
  INVALID_ACCESS_TOKEN = 'INVALID_ACCESS_TOKEN',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
  REFRESH_TOKEN_REUSED = 'REFRESH_TOKEN_REUSED',
  SESSION_REVOKED = 'SESSION_REVOKED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  INVALID_VERIFICATION_TOKEN = 'INVALID_VERIFICATION_TOKEN',
  VERIFICATION_TOKEN_EXPIRED = 'VERIFICATION_TOKEN_EXPIRED',
  INVALID_RESET_TOKEN = 'INVALID_RESET_TOKEN',
  RESET_TOKEN_EXPIRED = 'RESET_TOKEN_EXPIRED',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
}

export enum AuthAuditEventType {
  USER_REGISTERED = 'USER_REGISTERED',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  LOGOUT_ALL = 'LOGOUT_ALL',
  TOKEN_REFRESHED = 'TOKEN_REFRESHED',
  REFRESH_TOKEN_REUSE_DETECTED = 'REFRESH_TOKEN_REUSE_DETECTED',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  EMAIL_VERIFICATION_RESENT = 'EMAIL_VERIFICATION_RESENT',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED = 'PASSWORD_RESET_COMPLETED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  SESSION_REVOKED = 'SESSION_REVOKED',
}
