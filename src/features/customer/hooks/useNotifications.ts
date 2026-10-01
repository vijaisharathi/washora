"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notificationService";
import { NotificationPreferencesData } from "@/types/customer/notifications";
import { queryKeys } from "@/lib/query/queryKeys";
import { showError } from "@/lib/ui/toast";

export function useNotifications() {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => notificationService.getNotifications(),
  });

  const unreadCountQuery = useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => notificationService.getUnreadCount(),
  });

  const preferencesQuery = useQuery({
    queryKey: queryKeys.notifications.preferences(),
    queryFn: () => notificationService.getPreferences(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.notifications.list(), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
    onError: (err) => {
      showError(err, "Failed to Mark Notification Read");
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.notifications.list(), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
    onError: (err) => {
      showError(err, "Failed to Mark All Read");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.notifications.list(), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
    onError: (err) => {
      showError(err, "Failed to Delete Notification");
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (prefs: NotificationPreferencesData) =>
      notificationService.updatePreferences(prefs),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.notifications.preferences(), data);
    },
    onError: (err) => {
      showError(err, "Failed to Update Notification Preferences");
    },
  });

  return {
    notifications: notificationsQuery.data || [],
    unreadCount: unreadCountQuery.data ?? 0,
    preferences: preferencesQuery.data,
    isLoading: notificationsQuery.isLoading || preferencesQuery.isLoading,
    markAsRead: markReadMutation.mutateAsync,
    markAllAsRead: markAllReadMutation.mutateAsync,
    isMarkingAll: markAllReadMutation.isPending,
    deleteNotification: deleteMutation.mutateAsync,
    updatePreferences: updatePreferencesMutation.mutateAsync,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
  };
}
