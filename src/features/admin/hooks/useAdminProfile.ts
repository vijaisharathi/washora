"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminProfile, Organization } from "@/types/admin";
import { adminAuthService } from "@/services/admin/adminAuthService";
import { useAdminSession } from "./useAdminSession";

export function useAdminProfile() {
  const { session, userId } = useAdminSession();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [isSavingOrganization, setIsSavingOrganization] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const activeUserId = userId || session?.userId || "admin-001";
      const p = await adminAuthService.getProfile(activeUserId);
      setProfile(p);

      const o = await adminAuthService.getOrganization(p.organizationId);
      setOrganization(o);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load administrative identity.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [userId, session?.userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateProfile = async (updates: Partial<AdminProfile>) => {
    if (!profile) throw new Error("Profile not loaded.");
    setIsSavingProfile(true);
    setError(null);
    try {
      const updated = await adminAuthService.updateProfile(profile.userId, updates);
      setProfile(updated);
      return updated;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update administrative profile.";
      setError(msg);
      throw err;
    } finally {
      setIsSavingProfile(false);
    }
  };

  const updateOrganization = async (updates: Partial<Organization>) => {
    if (!organization) throw new Error("Organization not loaded.");
    setIsSavingOrganization(true);
    setError(null);
    try {
      const updated = await adminAuthService.updateOrganization(organization.id, updates);
      setOrganization(updated);
      return updated;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update organization details.";
      setError(msg);
      throw err;
    } finally {
      setIsSavingOrganization(false);
    }
  };

  return {
    profile,
    organization,
    isLoading,
    isSavingProfile,
    isSavingOrganization,
    error,
    updateProfile,
    updateOrganization,
    refresh: loadData,
  };
}
