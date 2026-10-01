"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminDashboardSnapshot, DashboardPeriod } from "@/types/admin";
import { adminDashboardService } from "@/services/admin/adminDashboardService";
import { useAdminProfile } from "./useAdminProfile";

export function useAdminDashboard(initialPeriod: DashboardPeriod = "today") {
  const { profile, organization } = useAdminProfile();
  const [period, setPeriod] = useState<DashboardPeriod>(initialPeriod);
  const [snapshot, setSnapshot] = useState<AdminDashboardSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const activeOrgId = organization?.id || profile?.organizationId || "ORG-0001";

  const fetchDashboard = useCallback(
    async (isBackgroundRefresh = false) => {
      if (isBackgroundRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await adminDashboardService.getDashboardSnapshot(
          activeOrgId,
          period
        );
        setSnapshot(data);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to load operational dashboard.";
        setError(msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeOrgId, period]
  );

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handlePeriodChange = (newPeriod: DashboardPeriod) => {
    setPeriod(newPeriod);
  };

  const handleRefresh = () => {
    fetchDashboard(true);
  };

  return {
    period,
    setPeriod: handlePeriodChange,
    snapshot,
    isLoading,
    isRefreshing,
    error,
    refresh: handleRefresh,
    profile,
    organization,
  };
}
