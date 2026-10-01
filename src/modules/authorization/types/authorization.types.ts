import { MemberStatus, OrganizationType, RoleType } from '@prisma/client';
import { AuthenticatedRequest } from '../../auth/types/auth.types';

export interface OrganizationContext {
  organizationId: string;
  publicId: string;
  name: string;
  type: OrganizationType;
  membershipId: string;
  role: RoleType;
  permissions: string[];
}

export interface MemberSummary {
  id: string;
  userId: string;
  organizationId: string;
  roleId: string;
  role: RoleType;
  fullName: string;
  phone: string;
  status: MemberStatus;
  joinedAt: Date;
}

export interface AuthorizedRequest extends AuthenticatedRequest {
  organization: OrganizationContext;
  membership: MemberSummary;
}

export enum AuthorizationErrorCode {
  ORGANIZATION_CONTEXT_REQUIRED = 'ORGANIZATION_CONTEXT_REQUIRED',
  ORGANIZATION_ACCESS_DENIED = 'ORGANIZATION_ACCESS_DENIED',
  MEMBERSHIP_INACTIVE = 'MEMBERSHIP_INACTIVE',
  ROLE_ACCESS_DENIED = 'ROLE_ACCESS_DENIED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  TENANT_MISMATCH = 'TENANT_MISMATCH',
  RESOURCE_NOT_OWNED = 'RESOURCE_NOT_OWNED',
}

export enum AuthzAuditEventType {
  ORGANIZATION_SELECTED = 'ORGANIZATION_SELECTED',
  AUTHORIZATION_DENIED = 'AUTHORIZATION_DENIED',
  ROLE_ACCESS_DENIED = 'ROLE_ACCESS_DENIED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  MEMBERSHIP_ACCESS_DENIED = 'MEMBERSHIP_ACCESS_DENIED',
}
