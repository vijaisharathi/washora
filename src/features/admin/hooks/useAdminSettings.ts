"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAdminSession } from "./useAdminSession";
import {
  adminSettingsService,
  MembersFilterParams,
  PaginatedMembersResult,
  SettingsOverviewSummary,
  SecurityOverview,
} from "@/services/admin/adminSettingsService";
import {
  AdminAccount,
  SystemPreferences,
  NotificationPreferences,
  OrganizationSettings,
  OrganizationMember,
  AccountSettingsFormData,
  PreferencesSettingsFormData,
  NotificationPreferencesFormData,
  ChangePasswordFormData,
  OrganizationSettingsFormData,
  AddMemberFormData,
  EditMemberFormData,
  AdminRole,
} from "@/types/admin";

/* -------------------------------------------------------------------------- */
/*                            SETTINGS OVERVIEW HOOK                          */
/* -------------------------------------------------------------------------- */

export function useAdminSettingsOverview() {
  const { session } = useAdminSession();
  const userId = session?.userId || session?.user?.id || "admin-001";
  const organizationId = session?.user?.organizationId || "ORG-0001";

  const [data, setData] = useState<SettingsOverviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await adminSettingsService.getSettingsOverview(
        userId,
        organizationId
      );
      setData(summary);
    } catch (err: any) {
      setError(err?.message || "Failed to load settings summary.");
    } finally {
      setLoading(false);
    }
  }, [userId, organizationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

/* -------------------------------------------------------------------------- */
/*                            ACCOUNT SETTINGS HOOK                           */
/* -------------------------------------------------------------------------- */

export function useAdminAccountSettings() {
  const { session } = useAdminSession();
  const userId = session?.userId || session?.user?.id || "admin-001";

  const [account, setAccount] = useState<AdminAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchAccount = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const acc = await adminSettingsService.getAccount(userId);
      setAccount(acc);
    } catch (err: any) {
      setError(err?.message || "Failed to load account settings.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  const updateAccount = async (
    formData: AccountSettingsFormData & { profileImage?: string }
  ) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updated = await adminSettingsService.updateAccount(userId, formData);
      setAccount(updated);
      setSuccessMessage("Account profile updated successfully.");
      return updated;
    } catch (err: any) {
      setError(err?.message || "Failed to update account.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    account,
    loading,
    saving,
    error,
    successMessage,
    refresh: fetchAccount,
    updateAccount,
    setSuccessMessage,
  };
}

/* -------------------------------------------------------------------------- */
/*                          PREFERENCES SETTINGS HOOK                         */
/* -------------------------------------------------------------------------- */

export function useAdminPreferences() {
  const { session } = useAdminSession();
  const userId = session?.userId || session?.user?.id || "admin-001";

  const [preferences, setPreferences] = useState<SystemPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await adminSettingsService.getPreferences(userId);
      setPreferences(p);
    } catch (err: any) {
      setError(err?.message || "Failed to load system preferences.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = async (data: PreferencesSettingsFormData) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updated = await adminSettingsService.updatePreferences(userId, data);
      setPreferences(updated);
      setSuccessMessage("Display and localization preferences saved.");
      return updated;
    } catch (err: any) {
      setError(err?.message || "Failed to save preferences.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    preferences,
    loading,
    saving,
    error,
    successMessage,
    refresh: fetchPreferences,
    updatePreferences,
    setSuccessMessage,
  };
}

/* -------------------------------------------------------------------------- */
/*                     NOTIFICATION PREFERENCES HOOK                          */
/* -------------------------------------------------------------------------- */

export function useAdminNotificationPreferences() {
  const { session } = useAdminSession();
  const userId = session?.userId || session?.user?.id || "admin-001";
  const organizationId = session?.user?.organizationId || "ORG-0001";

  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPrefs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await adminSettingsService.getNotificationPreferences(
        userId,
        organizationId
      );
      setPreferences(p);
    } catch (err: any) {
      setError(err?.message || "Failed to load notification settings.");
    } finally {
      setLoading(false);
    }
  }, [userId, organizationId]);

  useEffect(() => {
    fetchPrefs();
  }, [fetchPrefs]);

  const updatePreferences = async (data: NotificationPreferencesFormData) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updated = await adminSettingsService.updateNotificationPreferences(
        userId,
        organizationId,
        data
      );
      setPreferences(updated);
      setSuccessMessage("Operational notification preferences saved.");
      return updated;
    } catch (err: any) {
      setError(err?.message || "Failed to update notification preferences.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await adminSettingsService.resetNotificationPreferences(
        userId,
        organizationId
      );
      setPreferences(res);
      setSuccessMessage("All notification categories reset to enabled defaults.");
      return res;
    } catch (err: any) {
      setError(err?.message || "Failed to reset notification preferences.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    preferences,
    loading,
    saving,
    error,
    successMessage,
    refresh: fetchPrefs,
    updatePreferences,
    resetToDefaults,
    setSuccessMessage,
  };
}

/* -------------------------------------------------------------------------- */
/*                            SECURITY SETTINGS HOOK                          */
/* -------------------------------------------------------------------------- */

export function useAdminSecuritySettings() {
  const { session } = useAdminSession();
  const userId = session?.userId || session?.user?.id || "admin-001";
  const organizationId = session?.user?.organizationId || "ORG-0001";

  const [security, setSecurity] = useState<SecurityOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSecurity = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await adminSettingsService.getSecurityOverview(
        userId,
        organizationId
      );
      setSecurity(s);
    } catch (err: any) {
      setError(err?.message || "Failed to load security overview.");
    } finally {
      setLoading(false);
    }
  }, [userId, organizationId]);

  useEffect(() => {
    fetchSecurity();
  }, [fetchSecurity]);

  const changePassword = async (data: ChangePasswordFormData) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await adminSettingsService.changePassword(userId, data);
      await fetchSecurity();
      setSuccessMessage(res.message);
      return res;
    } catch (err: any) {
      setError(err?.message || "Failed to change password.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const signOutOtherSessions = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await adminSettingsService.signOutOtherSessions(userId, organizationId);
      await fetchSecurity();
      setSuccessMessage("All other remote device sessions signed out.");
    } catch (err: any) {
      setError(err?.message || "Failed to terminate remote sessions.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    security,
    loading,
    saving,
    error,
    successMessage,
    refresh: fetchSecurity,
    changePassword,
    signOutOtherSessions,
    setSuccessMessage,
  };
}

/* -------------------------------------------------------------------------- */
/*                         ORGANIZATION SETTINGS HOOK                         */
/* -------------------------------------------------------------------------- */

export function useAdminOrganizationSettings() {
  const { session } = useAdminSession();
  const organizationId = session?.user?.organizationId || "ORG-0001";

  const [organization, setOrganization] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchOrg = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const org = await adminSettingsService.getOrganizationSettings(organizationId);
      setOrganization(org);
    } catch (err: any) {
      setError(err?.message || "Failed to load organization settings.");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchOrg();
  }, [fetchOrg]);

  const updateOrganization = async (data: OrganizationSettingsFormData) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updated = await adminSettingsService.updateOrganizationSettings(
        organizationId,
        data
      );
      setOrganization(updated);
      setSuccessMessage("Organization profile and contact information updated.");
      return updated;
    } catch (err: any) {
      setError(err?.message || "Failed to update organization.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    organization,
    loading,
    saving,
    error,
    successMessage,
    refresh: fetchOrg,
    updateOrganization,
    setSuccessMessage,
  };
}

/* -------------------------------------------------------------------------- */
/*                            MEMBERS SETTINGS HOOK                           */
/* -------------------------------------------------------------------------- */

export function useAdminMembers(initialParams: MembersFilterParams = {}) {
  const { session } = useAdminSession();
  const organizationId = session?.user?.organizationId || "ORG-0001";

  const [params, setParams] = useState<MembersFilterParams>({
    page: 1,
    limit: 10,
    sortBy: "joinedAt",
    sortOrder: "desc",
    ...initialParams,
  });

  const [data, setData] = useState<PaginatedMembersResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminSettingsService.getMembers(organizationId, params);
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch organization members.");
    } finally {
      setLoading(false);
    }
  }, [organizationId, params]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const setSearch = (search: string) => {
    setParams((prev) => ({ ...prev, search, page: 1 }));
  };

  const setRoleFilter = (role: string) => {
    setParams((prev) => ({ ...prev, role, page: 1 }));
  };

  const setWorkAreaFilter = (workArea: string) => {
    setParams((prev) => ({ ...prev, workArea, page: 1 }));
  };

  const setStatusFilter = (status: string) => {
    setParams((prev) => ({ ...prev, status, page: 1 }));
  };

  const setSorting = (sortBy: MembersFilterParams["sortBy"]) => {
    setParams((prev) => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  const setPage = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const setLimit = (limit: number) => {
    setParams((prev) => ({ ...prev, limit, page: 1 }));
  };

  const addMember = async (formData: AddMemberFormData) => {
    try {
      const created = await adminSettingsService.createMember(
        organizationId,
        formData
      );
      await fetchMembers();
      setSuccessMessage(`Member ${created.fullName} (${created.id}) added.`);
      return created;
    } catch (err: any) {
      setError(err?.message || "Failed to add member.");
      throw err;
    }
  };

  const editMember = async (memberId: string, formData: EditMemberFormData) => {
    try {
      const updated = await adminSettingsService.updateMember(
        organizationId,
        memberId,
        formData
      );
      await fetchMembers();
      setSuccessMessage(`Member ${updated.fullName} updated.`);
      return updated;
    } catch (err: any) {
      setError(err?.message || "Failed to update member.");
      throw err;
    }
  };

  const changeMemberStatus = async (
    memberId: string,
    newStatus: "Active" | "Inactive" | "Pending" | "Suspended"
  ) => {
    try {
      const updated = await adminSettingsService.updateMemberStatus(
        organizationId,
        memberId,
        newStatus
      );
      await fetchMembers();
      setSuccessMessage(`Member ${updated.fullName} status updated to ${newStatus}.`);
      return updated;
    } catch (err: any) {
      setError(err?.message || "Failed to change member status.");
      throw err;
    }
  };

  return {
    members: data?.members || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    totalPages: data?.totalPages || 1,
    loading,
    error,
    successMessage,
    params,
    setSearch,
    setRoleFilter,
    setWorkAreaFilter,
    setStatusFilter,
    setSorting,
    setPage,
    setLimit,
    refresh: fetchMembers,
    addMember,
    editMember,
    changeMemberStatus,
    setSuccessMessage,
  };
}

/* -------------------------------------------------------------------------- */
/*                         ROLES & PERMISSIONS HOOK                           */
/* -------------------------------------------------------------------------- */

export function useAdminRolePermissions() {
  const roleSets = useMemo(
    () => adminSettingsService.getRolePermissionSets(),
    []
  );
  const permissionDefinitions = useMemo(
    () => adminSettingsService.getAllPermissionDefinitions(),
    []
  );

  return {
    roleSets,
    permissionDefinitions,
  };
}

/* -------------------------------------------------------------------------- */
/*                        CENTRAL PERMISSIONS HOOK                            */
/* -------------------------------------------------------------------------- */

export function useAdminPermissions() {
  const { session } = useAdminSession();
  const rawRole = session?.role || session?.user?.role;
  const canonicalRole: AdminRole = useMemo(
    () => adminSettingsService.normalizeRole(rawRole),
    [rawRole]
  );

  const permissions = useMemo(
    () => adminSettingsService.getPermissionsForRole(canonicalRole),
    [canonicalRole]
  );

  const hasPermission = useCallback(
    (permission: string): boolean => {
      return permissions.includes(permission);
    },
    [permissions]
  );

  const canAccessRoute = useCallback(
    (pathname: string): boolean => {
      if (pathname === "/admin" || pathname === "/admin/") {
        return hasPermission("View Dashboard");
      }
      if (pathname.startsWith("/admin/customers")) {
        return hasPermission("View Customers");
      }
      if (pathname.startsWith("/admin/providers")) {
        return hasPermission("View Providers");
      }
      if (pathname.startsWith("/admin/delivery-partners")) {
        return hasPermission("View Delivery Partners");
      }
      if (pathname.startsWith("/admin/bookings")) {
        return hasPermission("View Bookings");
      }
      if (pathname.startsWith("/admin/services")) {
        return hasPermission("View Services");
      }
      if (pathname.startsWith("/admin/operations")) {
        return hasPermission("View Operations");
      }
      if (pathname.startsWith("/admin/payments")) {
        return hasPermission("View Payments");
      }
      if (pathname.startsWith("/admin/reviews")) {
        return hasPermission("View Reviews");
      }
      if (
        pathname.startsWith("/admin/notifications") ||
        pathname.startsWith("/admin/communications")
      ) {
        return hasPermission("View Notifications");
      }
      if (pathname.startsWith("/admin/support")) {
        return hasPermission("View Support");
      }
      if (pathname.startsWith("/admin/disputes")) {
        return hasPermission("View Disputes");
      }
      if (pathname.startsWith("/admin/reports")) {
        return hasPermission("View Reports");
      }
      if (
        pathname === "/admin/settings" ||
        pathname === "/admin/settings/account" ||
        pathname === "/admin/settings/preferences" ||
        pathname === "/admin/settings/notifications" ||
        pathname === "/admin/settings/security"
      ) {
        return hasPermission("Manage Account Settings");
      }
      if (pathname.startsWith("/admin/settings/organization")) {
        return hasPermission("Manage Organization");
      }
      if (pathname.startsWith("/admin/settings/members")) {
        return hasPermission("Manage Members");
      }
      if (pathname.startsWith("/admin/settings/roles")) {
        return hasPermission("Manage Roles");
      }
      return true;
    },
    [hasPermission]
  );

  return {
    role: canonicalRole,
    permissions,
    hasPermission,
    canAccessRoute,
  };
}
