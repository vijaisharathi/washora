import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User, UserStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { AuthRepository } from './auth.repository';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  LoginResponseDto,
  OrganizationContextResponseDto,
  OrganizationMembershipResponseDto,
  RefreshResponseDto,
  RefreshTokenDto,
  RegisterDto,
  ResendVerificationDto,
  ResetPasswordDto,
  SelectOrganizationDto,
  SessionResponseDto,
  VerifyEmailDto,
} from './dto';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import {
  AuthAuditEventType,
  AuthenticatedUser,
  AuthErrorCode,
} from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Register a new user account.
   */
  async register(
    dto: RegisterDto,
    meta?: { ip?: string; userAgent?: string },
  ) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    // 1. Check for duplicate account
    const existing = await this.authRepository.findUserByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictException({
        code: AuthErrorCode.EMAIL_ALREADY_EXISTS,
        message: 'An account with this email already exists.',
      });
    }

    // 2. Hash password
    const passwordHash = await this.passwordService.hashPassword(dto.password);

    // 3. Create user, verification token & audit in transaction
    const rawVerificationToken = this.passwordService.generateSecureToken(32);
    const tokenHash = this.passwordService.hashToken(rawVerificationToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const result = await this.authRepository.transaction(async (tx) => {
      const user = await this.authRepository.createUser(
        {
          email: normalizedEmail,
          passwordHash,
          phone: dto.phone,
          status: UserStatus.ACTIVE,
        },
        tx,
      );

      await this.authRepository.createEmailVerificationToken(
        user.id,
        tokenHash,
        expiresAt,
        tx,
      );

      await this.authRepository.createAuditEvent(
        {
          action: AuthAuditEventType.USER_REGISTERED,
          entityType: 'User',
          entityId: user.id,
          actorUserId: user.id,
          metadataJson: {
            email: user.email,
            phone: user.phone,
          },
          ipHash: meta?.ip ? this.passwordService.hashToken(meta.ip) : null,
        },
        tx,
      );

      return user;
    });

    return {
      user: this.mapToSafeUser(result),
      message: 'Registration successful.',
      ...(process.env.NODE_ENV !== 'production' && {
        _devVerificationToken: rawVerificationToken,
      }),
    };
  }

  /**
   * Authenticate user credentials and issue session + token pair.
   */
  async login(
    dto: LoginDto,
    meta?: { ip?: string; userAgent?: string },
  ): Promise<LoginResponseDto> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    // 1. Lookup user
    const user = await this.authRepository.findUserByEmail(normalizedEmail);
    if (!user) {
      throw new UnauthorizedException({
        code: AuthErrorCode.INVALID_CREDENTIALS,
        message: 'Invalid email or password.',
      });
    }

    // 2. Verify password securely
    const isValid = await this.passwordService.verifyPassword(
      dto.password,
      user.passwordHash,
    );

    if (!isValid) {
      await this.authRepository.createAuditEvent({
        action: AuthAuditEventType.LOGIN_FAILED,
        entityType: 'User',
        entityId: user.id,
        actorUserId: user.id,
        metadataJson: { reason: 'Incorrect password' },
        ipHash: meta?.ip ? this.passwordService.hashToken(meta.ip) : null,
      });

      throw new UnauthorizedException({
        code: AuthErrorCode.INVALID_CREDENTIALS,
        message: 'Invalid email or password.',
      });
    }

    // 3. Enforce account status
    this.enforceAccountStatus(user.status);

    // 4. Create Session and issue Token Pair
    const sessionExpiresAt = this.tokenService.getRefreshExpirationDate();
    const tempSessionId = crypto.randomUUID();

    // Generate tokens linked to the session
    const tokens = this.tokenService.generateTokenPair(user, tempSessionId);
    const refreshTokenHash = this.passwordService.hashToken(tokens.refreshToken);

    const session = await this.authRepository.transaction(async (tx) => {
      const sess = await tx.session.create({
        data: {
          id: tempSessionId,
          userId: user.id,
          refreshTokenHash,
          expiresAt: sessionExpiresAt,
          ipAddress: meta?.ip || null,
          userAgent: meta?.userAgent || null,
          lastUsedAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      await this.authRepository.createAuditEvent(
        {
          action: AuthAuditEventType.LOGIN_SUCCESS,
          entityType: 'Session',
          entityId: sess.id,
          actorUserId: user.id,
          ipHash: meta?.ip ? this.passwordService.hashToken(meta.ip) : null,
        },
        tx,
      );

      return sess;
    });

    return {
      user: this.mapToSafeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: tokens.tokenType,
      expiresIn: tokens.expiresIn,
    };
  }

  /**
   * Rotate refresh token and issue new token pair.
   * Includes strict Refresh Token Reuse Detection.
   */
  async refresh(
    dto: RefreshTokenDto,
    meta?: { ip?: string },
  ): Promise<RefreshResponseDto> {
    // 1. Verify Refresh Token signature and type
    const payload = this.tokenService.verifyRefreshToken(dto.refreshToken);

    // 2. Lookup Session
    const session = await this.authRepository.findSessionById(payload.sid);
    if (!session) {
      throw new UnauthorizedException({
        code: AuthErrorCode.INVALID_REFRESH_TOKEN,
        message: 'Session not found.',
      });
    }

    // 3. Check for Revocation / Reuse
    const incomingTokenHash = this.passwordService.hashToken(dto.refreshToken);

    if (session.revokedAt) {
      // Replay attack on revoked session
      await this.authRepository.createAuditEvent({
        action: AuthAuditEventType.REFRESH_TOKEN_REUSE_DETECTED,
        entityType: 'Session',
        entityId: session.id,
        actorUserId: session.userId,
        metadataJson: { reason: 'Attempted use of already revoked session' },
        ipHash: meta?.ip ? this.passwordService.hashToken(meta.ip) : null,
      });

      throw new UnauthorizedException({
        code: AuthErrorCode.REFRESH_TOKEN_REUSED,
        message: 'Invalid or revoked refresh token.',
      });
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException({
        code: AuthErrorCode.SESSION_EXPIRED,
        message: 'Session has expired. Please log in again.',
      });
    }

    if (!this.passwordService.timingSafeEqual(session.refreshTokenHash, incomingTokenHash)) {
      // Token mismatch indicates old/replayed token from previous rotation
      await this.authRepository.revokeSession(session.id);

      await this.authRepository.createAuditEvent({
        action: AuthAuditEventType.REFRESH_TOKEN_REUSE_DETECTED,
        entityType: 'Session',
        entityId: session.id,
        actorUserId: session.userId,
        metadataJson: { reason: 'Token hash mismatch - possible token theft' },
        ipHash: meta?.ip ? this.passwordService.hashToken(meta.ip) : null,
      });

      throw new UnauthorizedException({
        code: AuthErrorCode.REFRESH_TOKEN_REUSED,
        message: 'Refresh token reuse detected. Session has been revoked for security.',
      });
    }

    // 4. Check user status
    this.enforceAccountStatus(session.user.status);

    // 5. Rotate tokens inside transaction
    const newTokens = this.tokenService.generateTokenPair(session.user, session.id);
    const newRefreshTokenHash = this.passwordService.hashToken(newTokens.refreshToken);
    const newExpiresAt = this.tokenService.getRefreshExpirationDate();

    await this.authRepository.transaction(async (tx) => {
      await this.authRepository.updateSessionToken(
        session.id,
        newRefreshTokenHash,
        newExpiresAt,
        tx,
      );

      await this.authRepository.createAuditEvent(
        {
          action: AuthAuditEventType.TOKEN_REFRESHED,
          entityType: 'Session',
          entityId: session.id,
          actorUserId: session.userId,
          ipHash: meta?.ip ? this.passwordService.hashToken(meta.ip) : null,
        },
        tx,
      );
    });

    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      tokenType: newTokens.tokenType,
      expiresIn: newTokens.expiresIn,
    };
  }

  /**
   * Logout current session.
   */
  async logout(userId: string, sessionId: string) {
    await this.authRepository.transaction(async (tx) => {
      await this.authRepository.revokeSession(sessionId, tx);
      await this.authRepository.createAuditEvent(
        {
          action: AuthAuditEventType.LOGOUT,
          entityType: 'Session',
          entityId: sessionId,
          actorUserId: userId,
        },
        tx,
      );
    });

    return { message: 'Logged out successfully.' };
  }

  /**
   * Logout all active sessions for the user.
   */
  async logoutAll(userId: string) {
    await this.authRepository.transaction(async (tx) => {
      await this.authRepository.revokeAllUserSessions(userId, tx);
      await this.authRepository.createAuditEvent(
        {
          action: AuthAuditEventType.LOGOUT_ALL,
          entityType: 'User',
          entityId: userId,
          actorUserId: userId,
        },
        tx,
      );
    });

    return { message: 'All sessions logged out successfully.' };
  }

  /**
   * Get current authenticated user profile.
   */
  async getMe(userId: string): Promise<AuthenticatedUser> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException({
        code: AuthErrorCode.INVALID_CREDENTIALS,
        message: 'User profile not found.',
      });
    }

    return this.mapToSafeUser(user);
  }

  /**
   * List all active sessions for current user.
   */
  async listSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<SessionResponseDto[]> {
    const sessions = await this.authRepository.getUserActiveSessions(userId);

    return sessions.map((s) => ({
      id: s.id,
      createdAt: s.createdAt,
      lastUsedAt: s.lastUsedAt,
      expiresAt: s.expiresAt,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      current: s.id === currentSessionId,
    }));
  }

  /**
   * Revoke an individual session belonging to current user.
   */
  async revokeSession(userId: string, targetSessionId: string) {
    const session = await this.authRepository.findSessionById(targetSessionId);
    if (!session || session.userId !== userId) {
      throw new NotFoundException({
        code: AuthErrorCode.SESSION_REVOKED,
        message: 'Session not found or does not belong to the user.',
      });
    }

    await this.authRepository.transaction(async (tx) => {
      await this.authRepository.revokeSession(targetSessionId, tx);
      await this.authRepository.createAuditEvent(
        {
          action: AuthAuditEventType.SESSION_REVOKED,
          entityType: 'Session',
          entityId: targetSessionId,
          actorUserId: userId,
        },
        tx,
      );
    });

    return { message: 'Session revoked successfully.' };
  }

  /**
   * Change user password. Keeps current session active and revokes other sessions.
   */
  async changePassword(
    userId: string,
    currentSessionId: string,
    dto: ChangePasswordDto,
  ) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException({
        code: AuthErrorCode.INVALID_CREDENTIALS,
        message: 'User not found.',
      });
    }

    const isValid = await this.passwordService.verifyPassword(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isValid) {
      throw new UnauthorizedException({
        code: AuthErrorCode.INVALID_CREDENTIALS,
        message: 'Current password is incorrect.',
      });
    }

    const newPasswordHash = await this.passwordService.hashPassword(dto.newPassword);

    await this.authRepository.transaction(async (tx) => {
      await this.authRepository.updateUserPassword(userId, newPasswordHash, tx);
      // Revoke other sessions for security while preserving the current active session
      await this.authRepository.revokeUserSessionsExcept(userId, currentSessionId, tx);
      await this.authRepository.createAuditEvent(
        {
          action: AuthAuditEventType.PASSWORD_CHANGED,
          entityType: 'User',
          entityId: userId,
          actorUserId: userId,
        },
        tx,
      );
    });

    return { message: 'Password changed successfully.' };
  }

  /**
   * Request password reset instructions (Non-enumerating).
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const user = await this.authRepository.findUserByEmail(normalizedEmail);

    let rawToken: string | undefined = undefined;

    if (user && user.status === UserStatus.ACTIVE) {
      rawToken = this.passwordService.generateSecureToken(32);
      const tokenHash = this.passwordService.hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await this.authRepository.transaction(async (tx) => {
        await this.authRepository.createPasswordResetToken(
          user.id,
          tokenHash,
          expiresAt,
          tx,
        );

        await this.authRepository.createAuditEvent(
          {
            action: AuthAuditEventType.PASSWORD_RESET_REQUESTED,
            entityType: 'User',
            entityId: user.id,
            actorUserId: user.id,
          },
          tx,
        );
      });
    }

    return {
      message: 'If an account exists, password reset instructions have been generated.',
      ...(process.env.NODE_ENV !== 'production' && rawToken && {
        _devResetToken: rawToken,
      }),
    };
  }

  /**
   * Complete password reset using valid reset token.
   */
  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = this.passwordService.hashToken(dto.token);
    const tokenRecord = await this.authRepository.findValidPasswordResetToken(tokenHash);

    if (!tokenRecord) {
      throw new BadRequestException({
        code: AuthErrorCode.INVALID_RESET_TOKEN,
        message: 'Invalid or expired password reset token.',
      });
    }

    const newPasswordHash = await this.passwordService.hashPassword(dto.newPassword);

    await this.authRepository.transaction(async (tx) => {
      // 1. Update password
      await this.authRepository.updateUserPassword(
        tokenRecord.userId,
        newPasswordHash,
        tx,
      );

      // 2. Mark token as consumed
      await this.authRepository.markPasswordResetTokenUsed(tokenRecord.id, tx);

      // 3. Revoke all active sessions for the user
      await this.authRepository.revokeAllUserSessions(tokenRecord.userId, tx);

      // 4. Audit event
      await this.authRepository.createAuditEvent(
        {
          action: AuthAuditEventType.PASSWORD_RESET_COMPLETED,
          entityType: 'User',
          entityId: tokenRecord.userId,
          actorUserId: tokenRecord.userId,
        },
        tx,
      );
    });

    return {
      message: 'Password reset successfully. Please log in with your new password.',
    };
  }

  /**
   * Verify email address with verification token.
   */
  async verifyEmail(dto: VerifyEmailDto) {
    const tokenHash = this.passwordService.hashToken(dto.token);
    const tokenRecord = await this.authRepository.findValidEmailVerificationToken(tokenHash);

    if (!tokenRecord) {
      throw new BadRequestException({
        code: AuthErrorCode.INVALID_VERIFICATION_TOKEN,
        message: 'Invalid or expired email verification token.',
      });
    }

    await this.authRepository.transaction(async (tx) => {
      await this.authRepository.updateUserEmailVerified(
        tokenRecord.userId,
        new Date(),
        tx,
      );

      await this.authRepository.markEmailVerificationTokenUsed(tokenRecord.id, tx);

      await this.authRepository.createAuditEvent(
        {
          action: AuthAuditEventType.EMAIL_VERIFIED,
          entityType: 'User',
          entityId: tokenRecord.userId,
          actorUserId: tokenRecord.userId,
        },
        tx,
      );
    });

    return { message: 'Email verified successfully.' };
  }

  /**
   * Resend email verification instructions (Non-enumerating).
   */
  async resendVerification(dto: ResendVerificationDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const user = await this.authRepository.findUserByEmail(normalizedEmail);

    let rawToken: string | undefined = undefined;

    if (user && !user.emailVerifiedAt && user.status === UserStatus.ACTIVE) {
      rawToken = this.passwordService.generateSecureToken(32);
      const tokenHash = this.passwordService.hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await this.authRepository.transaction(async (tx) => {
        await this.authRepository.createEmailVerificationToken(
          user.id,
          tokenHash,
          expiresAt,
          tx,
        );

        await this.authRepository.createAuditEvent(
          {
            action: AuthAuditEventType.EMAIL_VERIFICATION_RESENT,
            entityType: 'User',
            entityId: user.id,
            actorUserId: user.id,
          },
          tx,
        );
      });
    }

    return {
      message: 'If the account exists and is unverified, verification instructions have been sent.',
      ...(process.env.NODE_ENV !== 'production' && rawToken && {
        _devVerificationToken: rawToken,
      }),
    };
  }

  /**
   * Enforce user account status rules.
   */
  private enforceAccountStatus(status: UserStatus): void {
    if (status === UserStatus.SUSPENDED) {
      throw new ForbiddenException({
        code: AuthErrorCode.ACCOUNT_SUSPENDED,
        message: 'Your account has been suspended. Please contact customer support.',
      });
    }

    if (status === UserStatus.INACTIVE) {
      throw new ForbiddenException({
        code: AuthErrorCode.ACCOUNT_INACTIVE,
        message: 'Your account is inactive.',
      });
    }

    if (status === UserStatus.PENDING) {
      throw new ForbiddenException({
        code: AuthErrorCode.ACCOUNT_PENDING,
        message: 'Your account is pending verification.',
      });
    }
  }

  /**
   * List organizations user belongs to with role and membership status.
   */
  async getUserOrganizations(userId: string): Promise<OrganizationMembershipResponseDto[]> {
    const memberships = await this.authRepository.findUserMemberships(userId);

    return memberships.map((m) => ({
      id: m.organization.id,
      publicId: m.organization.publicId,
      name: m.organization.name,
      type: m.organization.type,
      membershipId: m.id,
      role: m.role.type,
      membershipStatus: m.status,
    }));
  }

  /**
   * Select and validate active organization context.
   */
  async selectOrganization(
    userId: string,
    dto: SelectOrganizationDto,
  ) {
    const membership = await this.authRepository.findUserMembership(
      userId,
      dto.organizationId,
    );

    if (!membership) {
      await this.authRepository.createAuditEvent({
        action: AuthAuditEventType.LOGIN_FAILED,
        entityType: 'Organization',
        entityId: dto.organizationId,
        actorUserId: userId,
        metadataJson: { reason: 'User does not belong to requested organization' },
      });

      throw new ForbiddenException({
        code: AuthErrorCode.INVALID_CREDENTIALS,
        message: 'You do not have access to the selected organization.',
      });
    }

    if (membership.status !== 'ACTIVE') {
      throw new ForbiddenException({
        code: AuthErrorCode.ACCOUNT_INACTIVE,
        message: `Your membership in this organization is ${membership.status.toLowerCase()}. Access denied.`,
      });
    }

    const permissions = await this.authRepository.findRolePermissions(membership.roleId);

    await this.authRepository.createAuditEvent({
      action: 'ORGANIZATION_SELECTED',
      entityType: 'Organization',
      entityId: membership.organizationId,
      actorUserId: userId,
      organizationId: membership.organizationId,
      metadataJson: {
        membershipId: membership.id,
        role: membership.role.type,
      },
    });

    const context: OrganizationContextResponseDto = {
      organization: {
        organizationId: membership.organization.id,
        publicId: membership.organization.publicId,
        name: membership.organization.name,
        type: membership.organization.type,
      },
      membership: {
        membershipId: membership.id,
        fullName: membership.fullName,
        role: membership.role.type,
        status: membership.status,
      },
      role: membership.role.type,
      permissions,
    };

    return {
      message: 'Organization selected successfully.',
      context,
    };
  }

  /**
   * Strip sensitive fields from User entity.
   */
  private mapToSafeUser(user: User): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt,
      phoneVerifiedAt: user.phoneVerifiedAt,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }
}
