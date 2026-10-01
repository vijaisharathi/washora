/**
 * Strongly typed organization contracts and state helpers matching B3 authorization.
 */

export interface OrganizationSummary {
  organizationId: string;
  publicId: string;
  name: string;
  type: string;
}

export interface OrganizationMembership {
  id: string;
  organizationId: string;
  organizationName: string;
  role: string;
  status: string;
}

export interface CurrentOrganizationContext {
  organization: OrganizationSummary;
  membership: {
    membershipId: string;
    fullName?: string;
    role: string;
    status: string;
  };
  role: string;
  permissions: string[];
}
