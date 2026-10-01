/**
 * Canonical platform roles matching the WASHORA backend schema exactly.
 */

export const PlatformRole = {
  ADMIN: 'ADMIN',
  OPERATIONS: 'OPERATIONS',
  CUSTOMER: 'CUSTOMER',
  PROVIDER: 'PROVIDER',
  DELIVERY_PARTNER: 'DELIVERY_PARTNER',
} as const;

export type PlatformRole = (typeof PlatformRole)[keyof typeof PlatformRole];

export const ALL_ROLES: readonly PlatformRole[] = Object.freeze([
  PlatformRole.ADMIN,
  PlatformRole.OPERATIONS,
  PlatformRole.CUSTOMER,
  PlatformRole.PROVIDER,
  PlatformRole.DELIVERY_PARTNER,
]);

export function isPlatformRole(value: unknown): value is PlatformRole {
  return typeof value === 'string' && ALL_ROLES.includes(value as PlatformRole);
}

export function hasRole(
  currentRole: PlatformRole | null | undefined,
  allowedRoles: PlatformRole | PlatformRole[]
): boolean {
  if (!currentRole) return false;
  if (Array.isArray(allowedRoles)) {
    return allowedRoles.includes(currentRole);
  }
  return currentRole === allowedRoles;
}
