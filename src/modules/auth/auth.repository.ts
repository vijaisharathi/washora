import { Injectable } from '@nestjs/common';
import { Prisma, Session, User, UserStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find a user by unique lowercase email.
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Find a user by UUID.
   */
  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new user record.
   */
  async createUser(
    data: {
      email: string;
      passwordHash: string;
      phone?: string | null;
      status?: UserStatus;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<User> {
    const client = tx || this.prisma;
    return client.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        phone: data.phone || null,
        status: data.status || UserStatus.ACTIVE,
      },
    });
  }

  /**
   * Update user's password hash.
   */
  async updateUserPassword(
    id: string,
    passwordHash: string,
    tx?: Prisma.TransactionClient,
  ): Promise<User> {
    const client = tx || this.prisma;
    return client.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  /**
   * Mark user's email as verified.
   */
  async updateUserEmailVerified(
    id: string,
    verifiedAt: Date = new Date(),
    tx?: Prisma.TransactionClient,
  ): Promise<User> {
    const client = tx || this.prisma;
    return client.user.update({
      where: { id },
      data: { emailVerifiedAt: verifiedAt },
    });
  }

  /**
   * Update last login timestamp.
   */
  async updateUserLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * Create a new session.
   */
  async createSession(
    data: {
      userId: string;
      refreshTokenHash: string;
      expiresAt: Date;
      ipAddress?: string | null;
      userAgent?: string | null;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<Session> {
    const client = tx || this.prisma;
    return client.session.create({
      data: {
        userId: data.userId,
        refreshTokenHash: data.refreshTokenHash,
        expiresAt: data.expiresAt,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        lastUsedAt: new Date(),
      },
    });
  }

  /**
   * Find a session by ID including user relation.
   */
  async findSessionById(id: string): Promise<(Session & { user: User }) | null> {
    return this.prisma.session.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  /**
   * Update session refresh token hash and expiration on rotation.
   */
  async updateSessionToken(
    sessionId: string,
    newRefreshTokenHash: string,
    newExpiresAt: Date,
    tx?: Prisma.TransactionClient,
  ): Promise<Session> {
    const client = tx || this.prisma;
    return client.session.update({
      where: { id: sessionId },
      data: {
        refreshTokenHash: newRefreshTokenHash,
        expiresAt: newExpiresAt,
        lastUsedAt: new Date(),
      },
    });
  }

  /**
   * Update session lastUsedAt timestamp.
   */
  async updateSessionLastUsed(sessionId: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { lastUsedAt: new Date() },
    });
  }

  /**
   * Revoke a single session.
   */
  async revokeSession(sessionId: string, tx?: Prisma.TransactionClient): Promise<Session> {
    const client = tx || this.prisma;
    return client.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Revoke all active sessions belonging to a user.
   */
  async revokeAllUserSessions(userId: string, tx?: Prisma.TransactionClient): Promise<number> {
    const client = tx || this.prisma;
    const result = await client.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
    return result.count;
  }

  /**
   * Revoke all sessions for a user EXCEPT the current session.
   */
  async revokeUserSessionsExcept(
    userId: string,
    exceptSessionId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const client = tx || this.prisma;
    const result = await client.session.updateMany({
      where: {
        userId,
        id: { not: exceptSessionId },
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
    return result.count;
  }

  /**
   * Get all active sessions for a user.
   */
  async getUserActiveSessions(userId: string): Promise<Session[]> {
    return this.prisma.session.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Cleanup / remove expired or revoked sessions older than a threshold date.
   */
  async cleanupOldSessions(olderThan: Date): Promise<number> {
    const result = await this.prisma.session.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: olderThan } },
          { revokedAt: { not: null, lt: olderThan } },
        ],
      },
    });
    return result.count;
  }

  /**
   * Create an email verification token.
   */
  async createEmailVerificationToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || this.prisma;
    return client.emailVerificationToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  /**
   * Find an unused email verification token by hash.
   */
  async findValidEmailVerificationToken(tokenHash: string) {
    return this.prisma.emailVerificationToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  }

  /**
   * Mark email verification token as used.
   */
  async markEmailVerificationTokenUsed(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;
    return client.emailVerificationToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  /**
   * Create a password reset token.
   */
  async createPasswordResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || this.prisma;
    return client.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  /**
   * Find an unused password reset token by hash.
   */
  async findValidPasswordResetToken(tokenHash: string) {
    return this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  }

  /**
   * Mark password reset token as used.
   */
  async markPasswordResetTokenUsed(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;
    return client.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  /**
   * Record an audit event.
   */
  async createAuditEvent(
    data: {
      action: string;
      entityType: string;
      entityId: string;
      actorUserId?: string | null;
      organizationId?: string | null;
      metadataJson?: any;
      ipHash?: string | null;
    },
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || this.prisma;
    return client.auditEvent.create({
      data: {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        actorUserId: data.actorUserId || null,
        organizationId: data.organizationId || null,
        metadataJson: data.metadataJson || undefined,
        ipHash: data.ipHash || null,
      },
    });
  }

  /**
   * Find a user's membership in an organization.
   */
  async findUserMembership(userId: string, organizationIdentifier: string) {
    return this.prisma.organizationMember.findFirst({
      where: {
        userId,
        OR: [
          { organizationId: organizationIdentifier },
          { organization: { publicId: organizationIdentifier } },
        ],
      },
      include: {
        organization: true,
        role: true,
      },
    });
  }

  /**
   * Find all organization memberships for a user.
   */
  async findUserMemberships(userId: string) {
    return this.prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: true,
        role: true,
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  /**
   * Find permissions codes associated with a role ID.
   */
  async findRolePermissions(roleId: string): Promise<string[]> {
    const rolePerms = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true,
      },
    });

    return rolePerms.map((rp) => rp.permission.code);
  }

  /**
   * Execute Prisma transaction helper.
   */
  async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }
}
