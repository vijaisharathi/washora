"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { providerOrdersService } from "@/services/provider/providerOrdersService";
import {
  AdvanceOrderStagePayload,
  ToggleChecklistStepPayload,
  AddOrderNotePayload,
  ReportOrderIssuePayload,
} from "@/types/provider/orders";

export function useProviderOrders(providerId: string = "prov-1") {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ["provider", "orders", providerId],
    queryFn: () => providerOrdersService.getOrders(providerId),
    staleTime: 1000 * 60 * 3,
  });

  const statsQuery = useQuery({
    queryKey: ["provider", "orders", "stats", providerId],
    queryFn: () => providerOrdersService.getOrderStats(providerId),
    staleTime: 1000 * 60 * 3,
  });

  const advanceStageMutation = useMutation({
    mutationFn: (payload: AdvanceOrderStagePayload) =>
      providerOrdersService.advanceOrderStage(payload, providerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["provider", "orders"] });
      queryClient.setQueryData(["provider", "order", data.id], data);
    },
  });

  const toggleChecklistMutation = useMutation({
    mutationFn: (payload: ToggleChecklistStepPayload) =>
      providerOrdersService.toggleChecklistStep(payload, providerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["provider", "orders"] });
      queryClient.setQueryData(["provider", "order", data.id], data);
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: (payload: AddOrderNotePayload) =>
      providerOrdersService.addOrderNote(payload, providerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["provider", "orders"] });
      queryClient.setQueryData(["provider", "order", data.id], data);
    },
  });

  const reportIssueMutation = useMutation({
    mutationFn: (payload: ReportOrderIssuePayload) =>
      providerOrdersService.reportOrderIssue(payload, providerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["provider", "orders"] });
      queryClient.setQueryData(["provider", "order", data.id], data);
    },
  });

  return {
    orders: ordersQuery.data || [],
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    stats: statsQuery.data,
    refetch: ordersQuery.refetch,

    advanceStage: advanceStageMutation.mutateAsync,
    isAdvancing: advanceStageMutation.isPending,

    toggleChecklistStep: toggleChecklistMutation.mutateAsync,
    isTogglingStep: toggleChecklistMutation.isPending,

    addNote: addNoteMutation.mutateAsync,
    isAddingNote: addNoteMutation.isPending,

    reportIssue: reportIssueMutation.mutateAsync,
    isReportingIssue: reportIssueMutation.isPending,
  };
}

export function useProviderOrderItem(orderId: string, providerId: string = "prov-1") {
  return useQuery({
    queryKey: ["provider", "order", orderId],
    queryFn: () => providerOrdersService.getOrderById(orderId, providerId),
    enabled: !!orderId,
  });
}
