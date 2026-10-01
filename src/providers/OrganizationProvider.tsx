"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { clearOrganizationQueryCache } from '@/lib/query/cache-isolation';
import { useAuthContext } from './AuthProvider';
import type {
  OrganizationSummary,
  OrganizationMembership,
  CurrentOrganizationContext,
} from '@/lib/organization/context';

export interface OrganizationContextValue {
  currentOrganization: OrganizationSummary | null;
  organizations: OrganizationMembership[];
  isLoading: boolean;
  selectOrganization: (organizationId: string) => Promise<void>;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  const queryClient = useQueryClient();

  const [currentOrganization, setCurrentOrganization] = useState<OrganizationSummary | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationMembership[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCurrentOrg = useCallback(async () => {
    if (!isAuthenticated) {
      setCurrentOrganization(null);
      setOrganizations([]);
      return;
    }

    try {
      setIsLoading(true);
      const res = await apiClient.get<{
        success: boolean;
        data?: CurrentOrganizationContext;
        organization?: OrganizationSummary;
      }>('/auth/organizations/current');

      const orgData = res?.data?.organization || res?.organization;
      if (orgData) {
        setCurrentOrganization(orgData);
      }
    } catch {
      // Fallback in demo mode
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchOrgList = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const res = await apiClient.get<{
        success: boolean;
        data?: OrganizationMembership[];
      }>('/auth/organizations');

      const list = res?.data || (Array.isArray(res) ? res : []);
      setOrganizations(list);
    } catch {
      // Fallback in demo mode
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentOrg();
      fetchOrgList();
    } else {
      setCurrentOrganization(null);
      setOrganizations([]);
    }
  }, [isAuthenticated, fetchCurrentOrg, fetchOrgList]);

  const selectOrganization = useCallback(
    async (organizationId: string) => {
      try {
        setIsLoading(true);
        await apiClient.post(
          '/auth/organizations/select',
          { organizationId },
          { retry: false }
        );

        // Clear previous organization-scoped cache
        clearOrganizationQueryCache(queryClient, organizationId);

        // Refresh current context
        await fetchCurrentOrg();
      } finally {
        setIsLoading(false);
      }
    },
    [queryClient, fetchCurrentOrg]
  );

  const value: OrganizationContextValue = {
    currentOrganization,
    organizations,
    isLoading,
    selectOrganization,
    refreshOrganizations: fetchOrgList,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization(): OrganizationContextValue {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
