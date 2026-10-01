"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryPartnerDeliveryService } from "@/services/delivery-partner/deliveryPartnerDeliveryService";
import {
  DeliveryHandoverState,
  DeliveryIssueReportPayload,
} from "@/types/delivery-partner";
import { DP_TASKS_QUERY_KEY } from "../../tasks/hooks/useDeliveryPartnerTasks";
import { DP_DASHBOARD_QUERY_KEY } from "../../dashboard/hooks/useDeliveryPartnerDashboard";

export const DP_DELIVERIES_QUERY_KEY = ["deliveryPartner", "deliveries"];

export function useDeliveryPartnerDeliveryQueue() {
  const query = useQuery({
    queryKey: DP_DELIVERIES_QUERY_KEY,
    queryFn: () => deliveryPartnerDeliveryService.getDeliveryTasks(),
    staleTime: 1000 * 60 * 2,
  });

  return {
    deliveries: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useDeliveryPartnerDeliveryExecution(taskId: string) {
  const queryClient = useQueryClient();

  const taskQuery = useQuery({
    queryKey: ["deliveryPartner", "deliveryTask", taskId],
    queryFn: () => deliveryPartnerDeliveryService.getDeliveryTaskById(taskId),
    staleTime: 1000 * 60 * 2,
    enabled: !!taskId,
  });

  const startDeliveryMutation = useMutation({
    mutationFn: () => deliveryPartnerDeliveryService.startDelivery(taskId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: DP_DELIVERIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["deliveryPartner", "deliveryTask", taskId] });
      queryClient.invalidateQueries({ queryKey: ["deliveryPartner", "task", taskId] });
      queryClient.invalidateQueries({ queryKey: DP_TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_DASHBOARD_QUERY_KEY });
    },
  });

  const markArrivedMutation = useMutation({
    mutationFn: () => deliveryPartnerDeliveryService.markArrived(taskId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: DP_DELIVERIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["deliveryPartner", "deliveryTask", taskId] });
      queryClient.invalidateQueries({ queryKey: ["deliveryPartner", "task", taskId] });
      queryClient.invalidateQueries({ queryKey: DP_TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_DASHBOARD_QUERY_KEY });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (otp: string) => deliveryPartnerDeliveryService.verifyDeliveryOtp(taskId, otp),
  });

  const completeDeliveryMutation = useMutation({
    mutationFn: (state: DeliveryHandoverState) =>
      deliveryPartnerDeliveryService.completeDelivery(taskId, state),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: DP_DELIVERIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["deliveryPartner", "deliveryTask", taskId] });
      queryClient.invalidateQueries({ queryKey: ["deliveryPartner", "task", taskId] });
      queryClient.invalidateQueries({ queryKey: DP_TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_DASHBOARD_QUERY_KEY });
    },
  });

  const reportIssueMutation = useMutation({
    mutationFn: (payload: DeliveryIssueReportPayload) =>
      deliveryPartnerDeliveryService.reportDeliveryIssue(payload),
  });

  return {
    task: taskQuery.data,
    isLoading: taskQuery.isLoading,
    isError: taskQuery.isError,
    error: taskQuery.error,
    refetch: taskQuery.refetch,
    startDelivery: startDeliveryMutation.mutateAsync,
    isStartingDelivery: startDeliveryMutation.isPending,
    markArrived: markArrivedMutation.mutateAsync,
    isMarkingArrived: markArrivedMutation.isPending,
    verifyOtp: verifyOtpMutation.mutateAsync,
    isVerifyingOtp: verifyOtpMutation.isPending,
    completeDelivery: completeDeliveryMutation.mutateAsync,
    isCompletingDelivery: completeDeliveryMutation.isPending,
    reportIssue: reportIssueMutation.mutateAsync,
    isReportingIssue: reportIssueMutation.isPending,
  };
}
