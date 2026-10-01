import type { PlatformRole } from '@/lib/auth/roles';

export interface ApiAuthUser {
  id: string;
  email?: string;
  phone?: string;
  fullName?: string;
  role: PlatformRole;
  permissions: string[];
  organizationId?: string;
}

export interface ApiLoginResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  user: ApiAuthUser;
}

export interface ApiRefreshResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface ApiOrganizationMembership {
  id: string;
  organizationId: string;
  organizationName: string;
  role: string;
  status: string;
}
