"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminSession } from "./useAdminSession";
import {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  NotificationPreferences,
  NotificationSummaryMetrics,
  ListNotificationsParams,
  ListNotificationsResult,
  NotificationDetailResult,
} from "@/types/admin/notification";
import {
  listNotifications,
  getNotificationById,
  getNotificationSummary,
  getUnreadNotificationCount,
  markNotificationAsRead as apiMarkRead,
  markNotificationAsUnread as apiMarkUnread,
  markAllNotificationsAsRead as apiMarkAllRead,
  dismissNotification as apiDismiss,
  getNotificationPreferences as apiGetPrefs,
  updateNotificationPreferences as apiUpdatePrefs,
} from "@/services/admin/adminNotificationService";

export function useAdminNotifications(initialParams?: Partial<ListNotificationsParams>) {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";
  const userId = user?.id || "ADM-0001";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<NotificationSummaryMetrics | null>(null);
  const [result, setResult] = useState<ListNotificationsResult>({
    notifications: [],
    total: 0,
    unreadCount: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });

  // Search and filter states
  const [search, setSearch] = useState(initialParams?.search || "");
  const [status, setStatus] = useState<NotificationStatus | "all">(
    initialParams?.status || "all"
  );
  const [type, setType] = useState<NotificationType | "all">(
    initialParams?.type || "all"
  );
  const [priority, setPriority] = useState<NotificationPriority | "all">(
    initialParams?.priority || "all"
  );
  const [datePreset, setDatePreset] = useState<
    "all" | "today" | "yesterday" | "last_7_days" | "last_30_days"
  >(initialParams?.datePreset || "all");
  const [sort, setSort] = useState<
    "newest" | "oldest" | "highest_priority" | "lowest_priority"
  >(initialParams?.sort || "newest");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialParams?.sortDirection || "desc"
  );
  const [page, setPage] = useState(initialParams?.page || 1);
  const [pageSize, setPageSize] = useState(initialParams?.pageSize || 10);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, listRes] = await Promise.all([
        getNotificationSummary(organizationId, userId),
        listNotifications({
          organizationId,
          userId,
          search,
          status,
          type,
          priority,
          datePreset,
          sort,
          sortDirection,
          page,
          pageSize,
        }),
      ]);

      setSummary(summaryRes);
      setResult(listRes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load notifications";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [
    organizationId,
    userId,
    search,
    status,
    type,
    priority,
    datePreset,
    sort,
    sortDirection,
    page,
    pageSize,
  ]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setStatus("all");
    setType("all");
    setPriority("all");
    setDatePreset("all");
    setSort("newest");
    setSortDirection("desc");
    setPage(1);
  }, []);

  const markAsRead = async (notifId: string): Promise<Notification> => {
    const updated = await apiMarkRead(organizationId, notifId, userId);
    await fetchNotifications();
    return updated;
  };

  const markAsUnread = async (notifId: string): Promise<Notification> => {
    const updated = await apiMarkUnread(organizationId, notifId, userId);
    await fetchNotifications();
    return updated;
  };

  const markAllAsRead = async (): Promise<void> => {
    await apiMarkAllRead(organizationId, userId);
    await fetchNotifications();
  };

  const dismissNotification = async (notifId: string): Promise<void> => {
    await apiDismiss(organizationId, notifId, userId);
    await fetchNotifications();
  };

  return {
    organizationId,
    userId,
    loading,
    error,
    summary,
    result,
    unreadCount: result.unreadCount,
    search,
    setSearch: (val: string) => {
      setSearch(val);
      setPage(1);
    },
    status,
    setStatus: (val: NotificationStatus | "all") => {
      setStatus(val);
      setPage(1);
    },
    type,
    setType: (val: NotificationType | "all") => {
      setType(val);
      setPage(1);
    },
    priority,
    setPriority: (val: NotificationPriority | "all") => {
      setPriority(val);
      setPage(1);
    },
    datePreset,
    setDatePreset: (
      val: "all" | "today" | "yesterday" | "last_7_days" | "last_30_days"
    ) => {
      setDatePreset(val);
      setPage(1);
    },
    sort,
    setSort,
    sortDirection,
    setSortDirection,
    page,
    setPage,
    pageSize,
    setPageSize: (val: number) => {
      setPageSize(val);
      setPage(1);
    },
    resetFilters,
    refetch: fetchNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    dismissNotification,
  };
}

export function useAdminNotificationDetails(notificationId: string) {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";
  const userId = user?.id || "ADM-0001";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<NotificationDetailResult | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!notificationId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getNotificationById(organizationId, notificationId, userId);
      if (!res) {
        setError(`Notification ${notificationId} not found in this organization.`);
      } else {
        setData(res);
        // Auto mark as read on detail view if currently unread
        if (res.notification.status === "Unread") {
          await apiMarkRead(organizationId, notificationId, userId);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load notification details";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [organizationId, notificationId, userId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const markAsRead = async () => {
    await apiMarkRead(organizationId, notificationId, userId);
    await fetchDetails();
  };

  const markAsUnread = async () => {
    await apiMarkUnread(organizationId, notificationId, userId);
    await fetchDetails();
  };

  const dismiss = async () => {
    await apiDismiss(organizationId, notificationId, userId);
  };

  return {
    loading,
    error,
    data,
    refetch: fetchDetails,
    markAsRead,
    markAsUnread,
    dismiss,
  };
}

export function useAdminNotificationPreferences() {
  const { user } = useAdminSession();
  const organizationId = user?.organizationId || "ORG-0001";
  const userId = user?.id || "ADM-0001";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiGetPrefs(organizationId, userId);
      setPreferences(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load preferences";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [organizationId, userId]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = async (
    newPrefs: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> => {
    const updated = await apiUpdatePrefs(organizationId, userId, newPrefs);
    setPreferences(updated);
    return updated;
  };

  return {
    loading,
    error,
    preferences,
    updatePreferences,
    refetch: fetchPreferences,
  };
}
