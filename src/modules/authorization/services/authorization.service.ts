import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { MemberStatus, RoleType } from '@prisma/client';
import { AuthorizationRepository } from '../authorization.repository';
import {
  AuthorizationErrorCode,
  AuthzAuditEventType,
  MemberSummary,
  OrganizationContext,
} from '../types/authorization.types';

@Injectable()
export class AuthorizationService {
  constructor(private readonly authzRepository: AuthorizationRepository) {}

  /**
   * Resolve and validate a user's organization context.
   * Throws 400 if organization identifier is missing.
   * Throws 403 if user is not a member or membership is inactive.
   */
  async resolveOrganizationContext(
    userId: string,
    organizationIdentifier?: string,
  ): Promise<{ organization: OrganizationContext; membership: MemberSummary }> {
    if (!organizationIdentifier || !organizationIdentifier.trim()) {
      throw new BadRequestException({
        code: AuthorizationErrorCode.ORGANIZATION_CONTEXT_REQUIRED,
        message: 'Organization context is required. Please provide X-Organization-ID header.',
      });
    }

    const membershipRecord = await this.authzRepository.findUserMembership(
      userId,
      organizationIdentifier.trim(),
    );

    if (!membershipRecord) {
      await this.authzRepository.createAuditEvent({
        action: AuthzAuditEventType.AUTHORIZATION_DENIED,
        entityType: 'Organization',
        entityId: organizationIdentifier,
        actorUserId: userId,
        metadataJson: { reason: 'User does not belong to organization' },
      });

      throw new ForbiddenException({
        code: AuthorizationErrorCode.ORGANIZATION_ACCESS_DENIED,
        message: 'You do not have access to this organization.',
      });
    }

    if (membershipRecord.status !== MemberStatus.ACTIVE) {
      await this.authzRepository.createAuditEvent({
        action: AuthzAuditEventType.MEMBERSHIP_ACCESS_DENIED,
        entityType: 'OrganizationMember',
        entityId: membershipRecord.id,
        actorUserId: userId,
        organizationId: membershipRecord.organizationId,
        metadataJson: { membershipStatus: membershipRecord.status },
      });

      throw new ForbiddenException({
        code: AuthorizationErrorCode.MEMBERSHIP_INACTIVE,
        message: `Your organization membership is ${membershipRecord.status.toLowerCase()}. Access denied.`,
      });
    }

    // Resolve permissions associated with role
    const permissions = await this.authzRepository.findRolePermissions(
      membershipRecord.roleId,
    );

    const organization: OrganizationContext = {
      organizationId: membershipRecord.organization.id,
      publicId: membershipRecord.organization.publicId,
      name: membershipRecord.organization.name,
      type: membershipRecord.organization.type,
      membershipId: membershipRecord.id,
      role: membershipRecord.role.type,
      permissions,
    };

    const membership: MemberSummary = {
      id: membershipRecord.id,
      userId: membershipRecord.userId,
      organizationId: membershipRecord.organizationId,
      roleId: membershipRecord.roleId,
      role: membershipRecord.role.type,
      fullName: membershipRecord.fullName,
      phone: membershipRecord.phone,
      status: membershipRecord.status,
      joinedAt: membershipRecord.joinedAt,
    };

    return { organization, membership };
  }

  /**
   * Check if context role matches any of the allowed roles.
   */
  hasRole(context: OrganizationContext, ...roles: RoleType[]): boolean {
    if (!context || !context.role || !roles || roles.length === 0) {
      return false;
    }
    return roles.includes(context.role);
  }

  /**
   * Check if context contains a specific permission.
   */
  hasPermission(context: OrganizationContext, permission: string): boolean {
    if (!context || !context.permissions) {
      return false;
    }
    // Check exact permission match or wildcard match (e.g., "customer.*" covers "customer.read")
    return context.permissions.some((p) => {
      if (p === permission) return true;
      if (p.endsWith('.*')) {
        const prefix = p.slice(0, -2);
        return permission.startsWith(prefix + '.');
      }
      return false;
    });
  }

  /**
   * Check if context satisfies ALL requested permissions (AND semantics).
   */
  hasAllPermissions(context: OrganizationContext, permissions: string[]): boolean {
    if (!permissions || permissions.length === 0) {
      return true;
    }
    return permissions.every((perm) => this.hasPermission(context, perm));
  }

  /**
   * Check if context satisfies ANY of the requested permissions (OR semantics).
   */
  hasAnyPermission(context: OrganizationContext, permissions: string[]): boolean {
    if (!permissions || permissions.length === 0) {
      return true;
    }
    return permissions.some((perm) => this.hasPermission(context, perm));
  }

  /**
   * Assert tenant ownership match.
   */
  assertTenantOwnership(entityOrgId: string, currentOrgId: string): void {
    if (entityOrgId !== currentOrgId) {
      throw new ForbiddenException({
        code: AuthorizationErrorCode.TENANT_MISMATCH,
        message: 'Access to cross-organization resource is strictly forbidden.',
      });
    }
  }

  /**
   * Assert entity user ownership (self-scope validation).
   */
  assertSelfOwnership(entityUserId: string, authenticatedUserId: string): void {
    if (entityUserId !== authenticatedUserId) {
      throw new ForbiddenException({
        code: AuthorizationErrorCode.RESOURCE_NOT_OWNED,
        message: 'You are not authorized to access or modify this resource.',
      });
    }
  }
}
