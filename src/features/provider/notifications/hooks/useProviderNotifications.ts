"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { providerNotificationsService } from "@/services/provider/providerNotificationsService";
import {
  ProviderNotificationFilters,
  ProviderNotificationPreferences,
} from "@/types/provider/notifications";

export function useProviderNotifications(
  filters?: ProviderNotificationFilters,
  providerId: string = "prov-1"
) {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ["provider", "notifications", "list", filters, providerId],
    queryFn: () => providerNotificationsService.getNotifications(filters, providerId),
    staleTime: 1000 * 60 * 2,
  });

  const unreadCountQuery = useQuery({
    queryKey: ["provider", "notifications", "unread-count", providerId],
    queryFn: () => providerNotificationsService.getUnreadCount(providerId),
    staleTime: 1000 * 60 * 2,
  });

  const preferencesQuery = useQuery({
    queryKey: ["provider", "notifications", "preferences", providerId],
    queryFn: () => providerNotificationsService.getPreferences(providerId),
    staleTime: 1000 * 60 * 5,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      providerNotificationsService.markAsRead(notificationId, providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider", "notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => providerNotificationsService.markAllAsRead(providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider", "notifications"] });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (payload: Partial<ProviderNotificationPreferences>) =>
      providerNotificationsService.updatePreferences(payload, providerId),
    onSuccess: (data) => {
      queryClient.setQueryData(["provider", "notifications", "preferences", providerId], data);
    },
  });

  return {
    notifications: listQuery.data || [],
    isLoadingNotifications: listQuery.isLoading,
    unreadCount: unreadCountQuery.data ?? 0,
    isLoadingUnreadCount: unreadCountQuery.isLoading,
    preferences: preferencesQuery.data,
    isLoadingPreferences: preferencesQuery.isLoading,

    markAsRead: markAsReadMutation.mutateAsync,
    isMarkingRead: markAsReadMutation.isPending,

    markAllAsRead: markAllAsReadMutation.mutateAsync,
    isMarkingAllRead: markAllAsReadMutation.isPending,

    updatePreferences: updatePreferencesMutation.mutateAsync,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
  };
}
