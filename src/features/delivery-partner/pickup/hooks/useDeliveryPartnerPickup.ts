"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryPartnerPickupService } from "@/services/delivery-partner/deliveryPartnerPickupService";
import {
  PickupVerificationState,
  PickupIssueReportPayload,
} from "@/types/delivery-partner";
import { DP_TASKS_QUERY_KEY } from "../../tasks/hooks/useDeliveryPartnerTasks";
import { DP_DASHBOARD_QUERY_KEY } from "../../dashboard/hooks/useDeliveryPartnerDashboard";

export const DP_PICKUP_TASKS_QUERY_KEY = ["deliveryPartner", "pickupTasks"];

export function useDeliveryPartnerPickupQueue() {
  const query = useQuery({
    queryKey: DP_PICKUP_TASKS_QUERY_KEY,
    queryFn: () => deliveryPartnerPickupService.getPickupTasks(),
    staleTime: 1000 * 60 * 2,
  });

  return {
    pickupTasks: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useDeliveryPartnerPickupExecution(taskId: string) {
  const queryClient = useQueryClient();

  const taskQuery = useQuery({
    queryKey: ["deliveryPartner", "pickupTask", taskId],
    queryFn: () => deliveryPartnerPickupService.getPickupTaskById(taskId),
    staleTime: 1000 * 60 * 2,
    enabled: !!taskId,
  });

  const startPickupMutation = useMutation({
    mutationFn: () => deliveryPartnerPickupService.startPickup(taskId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: DP_PICKUP_TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["deliveryPartner", "pickupTask", taskId] });
      queryClient.invalidateQueries({ queryKey: ["deliveryPartner", "task", taskId] });
      queryClient.invalidateQueries({ queryKey: DP_TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_DASHBOARD_QUERY_KEY });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (otp: string) => deliveryPartnerPickupService.verifyPickupOtp(taskId, otp),
  });

  const confirmPickupMutation = useMutation({
    mutationFn: (state: PickupVerificationState) =>
      deliveryPartnerPickupService.confirmPickup(taskId, state),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: DP_PICKUP_TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["deliveryPartner", "pickupTask", taskId] });
      queryClient.invalidateQueries({ queryKey: ["deliveryPartner", "task", taskId] });
      queryClient.invalidateQueries({ queryKey: DP_TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_DASHBOARD_QUERY_KEY });
    },
  });

  const reportIssueMutation = useMutation({
    mutationFn: (payload: PickupIssueReportPayload) =>
      deliveryPartnerPickupService.reportPickupIssue(payload),
  });

  return {
    task: taskQuery.data,
    isLoading: taskQuery.isLoading,
    isError: taskQuery.isError,
    error: taskQuery.error,
    refetch: taskQuery.refetch,
    startPickup: startPickupMutation.mutateAsync,
    isStartingPickup: startPickupMutation.isPending,
    verifyOtp: verifyOtpMutation.mutateAsync,
    isVerifyingOtp: verifyOtpMutation.isPending,
    confirmPickup: confirmPickupMutation.mutateAsync,
    isConfirmingPickup: confirmPickupMutation.isPending,
    reportIssue: reportIssueMutation.mutateAsync,
    isReportingIssue: reportIssueMutation.isPending,
  };
}
