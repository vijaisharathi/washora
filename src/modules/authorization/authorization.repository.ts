import { Injectable } from '@nestjs/common';
import { MemberStatus, Organization, OrganizationMember, Role, RoleType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuthorizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find a user's membership in a specific organization (by org UUID or public ID).
   */
  async findUserMembership(
    userId: string,
    organizationIdentifier: string,
  ): Promise<(OrganizationMember & { organization: Organization; role: Role }) | null> {
    // Try lookup by UUID or publicId
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
   * Resolve active permissions list for a role ID.
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
   * Find role by RoleType.
   */
  async findRoleByType(type: RoleType): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { type },
    });
  }

  /**
   * Record an authorization audit event.
   */
  async createAuditEvent(data: {
    action: string;
    entityType: string;
    entityId: string;
    actorUserId?: string | null;
    organizationId?: string | null;
    metadataJson?: any;
    ipHash?: string | null;
  }) {
    return this.prisma.auditEvent.create({
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
}
