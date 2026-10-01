import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MemberStatus, RoleType } from '@prisma/client';
import { AdminRepository } from '../admin.repository';
import {
  CreateMemberDto,
  MemberQueryDto,
  UpdateMemberDto,
  UpdateMemberRolesDto,
} from '../dto/member-management.dto';
import { AdminAuditEvent, AdminErrorCode } from '../types/admin.types';
import { AdminAuditService } from './admin-audit.service';

@Injectable()
export class AdminMembersService {
  constructor(
    private readonly adminRepo: AdminRepository,
    private readonly auditService: AdminAuditService,
  ) {}

  async listMembers(orgId: string, query: MemberQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const { total, items } = await this.adminRepo.findMembers(orgId, {
      status: query.status,
      role: query.role,
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

  async getMember(orgId: string, memberId: string) {
    const member = await this.adminRepo.findMemberById(memberId, orgId);
    if (!member) {
      throw new NotFoundException({
        code: AdminErrorCode.MEMBER_NOT_FOUND,
        message: `Organization member ${memberId} not found`,
      });
    }
    return member;
  }

  async createMember(
    orgId: string,
    dto: CreateMemberDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    // 1. Resolve role
    const role = await this.adminRepo.findRoleByType(dto.role);
    if (!role) {
      throw new BadRequestException({
        code: AdminErrorCode.INVALID_ROLE,
        message: `Role ${dto.role} is not valid or configured`,
      });
    }

    // 2. Find or create user
    let user = await this.adminRepo.findUserByEmail(dto.email);
    if (!user) {
      user = await this.adminRepo.createUser({
        email: dto.email,
        phone: dto.phone,
        status: 'ACTIVE',
      });
    }

    // 3. Check existing membership in this organization
    const existingMembership = await this.adminRepo.findMembershipByUserAndOrg(
      user.id,
      orgId,
    );
    if (existingMembership) {
      throw new ConflictException({
        code: AdminErrorCode.MEMBER_ALREADY_EXISTS,
        message: `User with email ${dto.email} is already a member of this organization`,
      });
    }

    // 4. Create membership
    const member = await this.adminRepo.createMember({
      organizationId: orgId,
      userId: user.id,
      roleId: role.id,
      fullName: dto.fullName,
      phone: dto.phone,
      primaryWorkArea: dto.primaryWorkArea,
      preferredLanguage: dto.preferredLanguage,
    });

    // 5. Audit
    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.MEMBER_INVITED,
      entityType: 'OrganizationMember',
      entityId: member.id,
      metadata: { email: dto.email, role: dto.role, fullName: dto.fullName },
      ipHash: ipAddress,
    });

    return member;
  }

  async updateMember(
    orgId: string,
    memberId: string,
    dto: UpdateMemberDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const member = await this.adminRepo.findMemberById(memberId, orgId);
    if (!member) {
      throw new NotFoundException({
        code: AdminErrorCode.MEMBER_NOT_FOUND,
        message: `Organization member ${memberId} not found`,
      });
    }

    // Guard against removing/deactivating the last active admin
    if (
      dto.status &&
      dto.status !== MemberStatus.ACTIVE &&
      member.role.type === RoleType.ADMIN
    ) {
      const activeAdmins = await this.adminRepo.countActiveAdmins(orgId);
      if (activeAdmins <= 1) {
        throw new BadRequestException({
          code: AdminErrorCode.CANNOT_REMOVE_LAST_ADMIN,
          message:
            'Cannot deactivate or suspend the only active admin in the organization',
        });
      }
    }

    const updated = await this.adminRepo.updateMember(memberId, orgId, {
      fullName: dto.fullName,
      phone: dto.phone,
      status: dto.status,
      primaryWorkArea: dto.primaryWorkArea as any,
      preferredLanguage: dto.preferredLanguage as any,
    });

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.MEMBER_STATUS_CHANGED,
      entityType: 'OrganizationMember',
      entityId: memberId,
      metadata: { changes: dto },
      ipHash: ipAddress,
    });

    return updated;
  }

  async updateMemberRoles(
    orgId: string,
    memberId: string,
    dto: UpdateMemberRolesDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const member = await this.adminRepo.findMemberById(memberId, orgId);
    if (!member) {
      throw new NotFoundException({
        code: AdminErrorCode.MEMBER_NOT_FOUND,
        message: `Organization member ${memberId} not found`,
      });
    }

    const newRole = await this.adminRepo.findRoleByType(dto.role);
    if (!newRole) {
      throw new BadRequestException({
        code: AdminErrorCode.INVALID_ROLE,
        message: `Role ${dto.role} is invalid`,
      });
    }

    // If demoting from ADMIN, check last active admin guard
    if (member.role.type === RoleType.ADMIN && dto.role !== RoleType.ADMIN) {
      const activeAdmins = await this.adminRepo.countActiveAdmins(orgId);
      if (activeAdmins <= 1) {
        throw new BadRequestException({
          code: AdminErrorCode.CANNOT_REMOVE_LAST_ADMIN,
          message:
            'Cannot change role of the only active admin in the organization',
        });
      }
    }

    const updated = await this.adminRepo.updateMember(memberId, orgId, {
      role: { connect: { id: newRole.id } },
    });

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.MEMBER_ROLE_UPDATED,
      entityType: 'OrganizationMember',
      entityId: memberId,
      metadata: { oldRole: member.role.type, newRole: dto.role },
      ipHash: ipAddress,
    });

    return updated;
  }

  async removeMember(
    orgId: string,
    memberId: string,
    actorUserId: string,
    ipAddress?: string,
  ) {
    const member = await this.adminRepo.findMemberById(memberId, orgId);
    if (!member) {
      throw new NotFoundException({
        code: AdminErrorCode.MEMBER_NOT_FOUND,
        message: `Organization member ${memberId} not found`,
      });
    }

    if (member.role.type === RoleType.ADMIN) {
      const activeAdmins = await this.adminRepo.countActiveAdmins(orgId);
      if (activeAdmins <= 1) {
        throw new BadRequestException({
          code: AdminErrorCode.CANNOT_REMOVE_LAST_ADMIN,
          message:
            'Cannot remove the only active admin in the organization',
        });
      }
    }

    await this.adminRepo.deleteMember(memberId);

    await this.auditService.record({
      organizationId: orgId,
      actorUserId,
      action: AdminAuditEvent.MEMBER_REMOVED,
      entityType: 'OrganizationMember',
      entityId: memberId,
      metadata: { removedMemberEmail: member.user.email },
      ipHash: ipAddress,
    });

    return { success: true, message: 'Member removed successfully' };
  }
}
