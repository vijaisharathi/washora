/**
 * Centralized role-to-route configuration and route protection policies.
 * Strictly isolates the four application areas:
 * CUSTOMER, PROVIDER, DELIVERY_PARTNER, and ADMIN / OPERATIONS.
 */

import { PlatformRole } from './roles';

export const ROLE_HOME_ROUTES: Record<PlatformRole, string> = {
  [PlatformRole.CUSTOMER]: '/customer',
  [PlatformRole.PROVIDER]: '/provider',
  [PlatformRole.DELIVERY_PARTNER]: '/delivery-partner',
  [PlatformRole.ADMIN]: '/admin',
  [PlatformRole.OPERATIONS]: '/admin/operations',
};

export const ROLE_LOGIN_ROUTES: Record<PlatformRole, string> = {
  [PlatformRole.CUSTOMER]: '/customer/auth/login',
  [PlatformRole.PROVIDER]: '/provider/auth/login',
  [PlatformRole.DELIVERY_PARTNER]: '/delivery-partner/auth/login',
  [PlatformRole.ADMIN]: '/admin/login',
  [PlatformRole.OPERATIONS]: '/admin/login',
};

export const ROLE_UNAUTHORIZED_ROUTES: Record<PlatformRole, string> = {
  [PlatformRole.CUSTOMER]: '/customer',
  [PlatformRole.PROVIDER]: '/provider',
  [PlatformRole.DELIVERY_PARTNER]: '/delivery-partner',
  [PlatformRole.ADMIN]: '/admin/unauthorized',
  [PlatformRole.OPERATIONS]: '/admin/unauthorized',
};

/**
 * Identifies which application role namespace a given pathname belongs to.
 */
export function getRoleForPath(pathname: string): PlatformRole | null {
  if (pathname.startsWith('/customer')) return PlatformRole.CUSTOMER;
  if (pathname.startsWith('/provider')) return PlatformRole.PROVIDER;
  if (pathname.startsWith('/delivery-partner')) return PlatformRole.DELIVERY_PARTNER;
  if (pathname.startsWith('/admin')) return PlatformRole.ADMIN;
  return null;
}

/**
 * Checks if a pathname is an authentication route (e.g. login, register, forgot-password).
 */
export function isAuthRoute(pathname: string): boolean {
  return (
    pathname.includes('/auth/') ||
    pathname === '/admin/login' ||
    pathname === '/admin/unauthorized'
  );
}

/**
 * Evaluates whether an authenticated role is permitted to view a given pathname.
 * Returns true if permitted, false if prohibited by strict role boundaries.
 */
export function isPathAllowedForRole(
  pathname: string,
  userRole: PlatformRole | null | undefined
): boolean {
  const targetRole = getRoleForPath(pathname);
  if (!targetRole) {
    // Root or shared route
    return true;
  }

  // Unauthenticated users can only access auth routes
  if (!userRole) {
    return isAuthRoute(pathname);
  }

  // Admin and Operations role sharing inside /admin
  if (targetRole === PlatformRole.ADMIN) {
    return userRole === PlatformRole.ADMIN || userRole === PlatformRole.OPERATIONS;
  }

  // Strict role match required for all other namespaces
  return userRole === targetRole;
}

/**
 * Resolves the appropriate login route based on target pathname.
 */
export function getLoginRouteForPath(pathname: string): string {
  const role = getRoleForPath(pathname);
  if (role && ROLE_LOGIN_ROUTES[role]) {
    return ROLE_LOGIN_ROUTES[role];
  }
  return ROLE_LOGIN_ROUTES[PlatformRole.CUSTOMER];
}

/**
 * Resolves the default home dashboard route for a role.
 */
export function getHomeRouteForRole(role: PlatformRole): string {
  return ROLE_HOME_ROUTES[role] || '/customer';
}
