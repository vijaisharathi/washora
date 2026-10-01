"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryPartnerTaskService } from "@/services/delivery-partner/deliveryPartnerTaskService";
import { TaskFilterParams } from "@/types/delivery-partner";
import { DP_DASHBOARD_QUERY_KEY } from "../../dashboard/hooks/useDeliveryPartnerDashboard";

export const DP_TASKS_QUERY_KEY = ["deliveryPartner", "tasks"];

export function useDeliveryPartnerTasks(filters?: TaskFilterParams) {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: [...DP_TASKS_QUERY_KEY, filters],
    queryFn: () => deliveryPartnerTaskService.getTasks(filters),
    staleTime: 1000 * 60 * 2,
  });

  const acceptTaskMutation = useMutation({
    mutationFn: (taskId: string) => deliveryPartnerTaskService.acceptTask(taskId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: DP_TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["deliveryPartner", "task", data.id] });
      queryClient.invalidateQueries({ queryKey: DP_DASHBOARD_QUERY_KEY });
    },
  });

  const rejectTaskMutation = useMutation({
    mutationFn: ({ taskId, reason }: { taskId: string; reason?: string }) =>
      deliveryPartnerTaskService.rejectTask(taskId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: DP_TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["deliveryPartner", "task", data.id] });
      queryClient.invalidateQueries({ queryKey: DP_DASHBOARD_QUERY_KEY });
    },
  });

  const startTransitMutation = useMutation({
    mutationFn: (taskId: string) => deliveryPartnerTaskService.startTransit(taskId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: DP_TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["deliveryPartner", "task", data.id] });
      queryClient.invalidateQueries({ queryKey: DP_DASHBOARD_QUERY_KEY });
    },
  });

  const cancelTaskMutation = useMutation({
    mutationFn: ({ taskId, reason }: { taskId: string; reason: string }) =>
      deliveryPartnerTaskService.cancelTask(taskId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: DP_TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["deliveryPartner", "task", data.id] });
      queryClient.invalidateQueries({ queryKey: DP_DASHBOARD_QUERY_KEY });
    },
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,
    refetch: tasksQuery.refetch,
    acceptTask: acceptTaskMutation.mutateAsync,
    isAccepting: acceptTaskMutation.isPending,
    rejectTask: rejectTaskMutation.mutateAsync,
    isRejecting: rejectTaskMutation.isPending,
    startTransit: startTransitMutation.mutateAsync,
    isStartingTransit: startTransitMutation.isPending,
    cancelTask: cancelTaskMutation.mutateAsync,
    isCancelling: cancelTaskMutation.isPending,
  };
}

export function useDeliveryPartnerTaskDetail(taskId: string) {
  const queryClient = useQueryClient();

  const taskQuery = useQuery({
    queryKey: ["deliveryPartner", "task", taskId],
    queryFn: () => deliveryPartnerTaskService.getTaskById(taskId),
    staleTime: 1000 * 60 * 2,
    enabled: !!taskId,
  });

  const acceptTaskMutation = useMutation({
    mutationFn: () => deliveryPartnerTaskService.acceptTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DP_TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["deliveryPartner", "task", taskId] });
      queryClient.invalidateQueries({ queryKey: DP_DASHBOARD_QUERY_KEY });
    },
  });

  const startTransitMutation = useMutation({
    mutationFn: () => deliveryPartnerTaskService.startTransit(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DP_TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["deliveryPartner", "task", taskId] });
      queryClient.invalidateQueries({ queryKey: DP_DASHBOARD_QUERY_KEY });
    },
  });

  const cancelTaskMutation = useMutation({
    mutationFn: (reason: string) => deliveryPartnerTaskService.cancelTask(taskId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DP_TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["deliveryPartner", "task", taskId] });
      queryClient.invalidateQueries({ queryKey: DP_DASHBOARD_QUERY_KEY });
    },
  });

  return {
    task: taskQuery.data,
    isLoading: taskQuery.isLoading,
    isError: taskQuery.isError,
    error: taskQuery.error,
    refetch: taskQuery.refetch,
    acceptTask: acceptTaskMutation.mutateAsync,
    isAccepting: acceptTaskMutation.isPending,
    startTransit: startTransitMutation.mutateAsync,
    isStartingTransit: startTransitMutation.isPending,
    cancelTask: cancelTaskMutation.mutateAsync,
    isCancelling: cancelTaskMutation.isPending,
  };
}
