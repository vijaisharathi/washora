import { ForbiddenException } from '@nestjs/common';
import { AuthorizationErrorCode } from '../../modules/authorization/types/authorization.types';

/**
 * Builds a tenant-scoped Prisma query filter.
 * Guarantees that organizationId is always present in queries.
 */
export function buildTenantFilter<T extends Record<string, any>>(
  organizationId: string,
  additionalWhere?: T,
): T & { organizationId: string } {
  if (!organizationId) {
    throw new ForbiddenException({
      code: AuthorizationErrorCode.ORGANIZATION_CONTEXT_REQUIRED,
      message: 'Cannot build query filter without valid organizationId.',
    });
  }

  return {
    ...(additionalWhere || ({} as T)),
    organizationId,
  };
}

/**
 * Asserts that an entity belongs to the current tenant organization.
 */
export function assertEntityTenant(
  entity: { organizationId?: string | null } | null,
  currentOrganizationId: string,
  entityName = 'Resource',
): void {
  if (!entity || entity.organizationId !== currentOrganizationId) {
    throw new ForbiddenException({
      code: AuthorizationErrorCode.TENANT_MISMATCH,
      message: `${entityName} does not belong to the active organization.`,
    });
  }
}

/**
 * Asserts that an entity belongs to the requesting user (self-scope validation).
 */
export function assertEntityOwnership(
  entity: { userId?: string | null } | null,
  currentUserId: string,
  entityName = 'Resource',
): void {
  if (!entity || entity.userId !== currentUserId) {
    throw new ForbiddenException({
      code: AuthorizationErrorCode.RESOURCE_NOT_OWNED,
      message: `You are not authorized to access this ${entityName.toLowerCase()}.`,
    });
  }
}
