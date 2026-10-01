import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class TenantScopeUtil {
  /**
   * Asserts that the target entity belongs strictly to the authenticated organization.
   * Throws 404 (IDOR defense - resource not found in tenant) or 403.
   */
  static assertTenantScope(
    entityOrgId: string | undefined | null,
    authenticatedOrgId: string,
    entityName = 'Resource',
  ): void {
    if (!entityOrgId || entityOrgId !== authenticatedOrgId) {
      throw new NotFoundException({
        code: 'TENANT_MISMATCH',
        message: `${entityName} not found in this organization.`,
      });
    }
  }

  /**
   * Asserts that the target entity belongs to the authenticated user or owner.
   */
  static assertOwnership(
    resourceOwnerUserId: string | undefined | null,
    authenticatedUserId: string,
    entityName = 'Resource',
  ): void {
    if (!resourceOwnerUserId || resourceOwnerUserId !== authenticatedUserId) {
      throw new ForbiddenException({
        code: 'FORBIDDEN_IDOR',
        message: `You do not have permission to access this ${entityName}.`,
      });
    }
  }
}
