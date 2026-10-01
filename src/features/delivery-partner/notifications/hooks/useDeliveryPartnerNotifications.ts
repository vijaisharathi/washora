"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryPartnerNotificationService } from "@/services/delivery-partner/deliveryPartnerNotificationService";
import { NotificationFilterParams } from "@/types/delivery-partner";

export const DP_NOTIFICATIONS_QUERY_KEY = ["deliveryPartner", "notifications"];
export const DP_UNREAD_COUNT_QUERY_KEY = ["deliveryPartner", "unreadCount"];

export function useDeliveryPartnerNotifications(filter?: NotificationFilterParams) {
  const query = useQuery({
    queryKey: [...DP_NOTIFICATIONS_QUERY_KEY, filter?.category, filter?.readStatus, filter?.searchQuery],
    queryFn: () => deliveryPartnerNotificationService.getNotifications(filter),
    staleTime: 1000 * 30,
  });

  return {
    notifications: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useDeliveryPartnerUnreadCount() {
  const query = useQuery({
    queryKey: DP_UNREAD_COUNT_QUERY_KEY,
    queryFn: () => deliveryPartnerNotificationService.getUnreadCount(),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });

  return {
    unreadCount: query.data ?? 0,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useDeliveryPartnerNotificationDetail(id: string) {
  const query = useQuery({
    queryKey: ["deliveryPartner", "notificationDetail", id],
    queryFn: () => deliveryPartnerNotificationService.getNotificationById(id),
    staleTime: 1000 * 30,
    enabled: !!id,
  });

  return {
    notification: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useDeliveryPartnerNotificationActions() {
  const queryClient = useQueryClient();

  const markReadMutation = useMutation({
    mutationFn: (id: string) => deliveryPartnerNotificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DP_NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_UNREAD_COUNT_QUERY_KEY });
    },
  });

  const markUnreadMutation = useMutation({
    mutationFn: (id: string) => deliveryPartnerNotificationService.markAsUnread(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DP_NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_UNREAD_COUNT_QUERY_KEY });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => deliveryPartnerNotificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DP_NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_UNREAD_COUNT_QUERY_KEY });
    },
  });

  return {
    markAsRead: markReadMutation.mutateAsync,
    markAsUnread: markUnreadMutation.mutateAsync,
    markAllAsRead: markAllReadMutation.mutateAsync,
    isMarkingAllRead: markAllReadMutation.isPending,
  };
}
