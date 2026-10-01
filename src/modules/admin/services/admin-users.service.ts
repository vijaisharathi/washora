import { Injectable, NotFoundException } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { AuthRepository } from '../../auth/auth.repository';
import { AdminRepository } from '../admin.repository';
import { UserQueryDto } from '../dto/entity-admin.dto';
import { AdminAuditEvent, AdminErrorCode } from '../types/admin.types';
import { AdminAuditService } from './admin-audit.service';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly authRepo: AuthRepository,
    private readonly auditService: AdminAuditService,
  ) {}

  async listUsers(query: UserQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const { total, items } = await this.adminRepo.findUsers({
      status: query.status,
      search: query.search,
      skip,
      take: limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUser(userId: string) {
    const user = await this.adminRepo.findUserById(userId);
    if (!user) {
      throw new NotFoundException({
        code: AdminErrorCode.USER_NOT_FOUND,
        message: `User ${userId} not found`,
      });
    }
    return user;
  }

  async updateUserStatus(
    userId: string,
    status: UserStatus,
    actorUserId: string,
    orgId?: string,
    ipAddress?: string,
  ) {
    const user = await this.adminRepo.findUserById(userId);
    if (!user) {
      throw new NotFoundException({
        code: AdminErrorCode.USER_NOT_FOUND,
        message: `User ${userId} not found`,
      });
    }

    const updated = await this.adminRepo.updateUserStatus(userId, status);

    // If user is SUSPENDED or INACTIVE, revoke all active sessions immediately!
    if (status === UserStatus.SUSPENDED || status === UserStatus.INACTIVE) {
      await this.authRepo.revokeAllUserSessions(userId);
    }

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.USER_STATUS_CHANGED,
      entityType: 'User',
      entityId: userId,
      metadata: { previousStatus: user.status, newStatus: status },
      ipHash: ipAddress,
    });

    return updated;
  }
}
