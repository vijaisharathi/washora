"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cancellationRescheduleService } from "@/services/cancellationRescheduleService";
import {
  CancelOrderPayload,
  RescheduleOrderPayload,
} from "@/types/customer/cancellationReschedule";
import { queryKeys } from "@/lib/query/queryKeys";
import { showError } from "@/lib/ui/toast";

export function useCancellationDetails(orderId: string) {
  const queryClient = useQueryClient();

  const reasonsQuery = useQuery({
    queryKey: ["customer", "cancellation-reasons"] as const,
    queryFn: () => cancellationRescheduleService.getCancellationReasons(),
  });

  const refundQuery = useQuery({
    queryKey: ["customer", "refund-breakdown", orderId] as const,
    queryFn: () => cancellationRescheduleService.getRefundBreakdown(orderId),
    enabled: Boolean(orderId),
  });

  const cancelMutation = useMutation({
    mutationFn: (payload: CancelOrderPayload) =>
      cancellationRescheduleService.cancelOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.booking(orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.bookings() });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.order(orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.orders() });
    },
    onError: (err) => {
      showError(err, "Failed to Cancel Order");
    },
  });

  return {
    reasons: reasonsQuery.data || [],
    refundInfo: refundQuery.data,
    isLoading: reasonsQuery.isLoading || refundQuery.isLoading,
    cancelOrder: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
    cancelResult: cancelMutation.data,
  };
}

export function useRescheduleDetails(orderId: string) {
  const queryClient = useQueryClient();

  const datesQuery = useQuery({
    queryKey: ["customer", "reschedule-dates"] as const,
    queryFn: () => cancellationRescheduleService.getRescheduleDates(),
  });

  const slotsQuery = useQuery({
    queryKey: ["customer", "reschedule-slots"] as const,
    queryFn: () => cancellationRescheduleService.getRescheduleSlots("default"),
  });

  const rescheduleMutation = useMutation({
    mutationFn: (payload: RescheduleOrderPayload) =>
      cancellationRescheduleService.rescheduleOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.booking(orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.bookings() });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.order(orderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.orders() });
    },
    onError: (err) => {
      showError(err, "Failed to Reschedule Order");
    },
  });

  return {
    dates: datesQuery.data || [],
    slots: slotsQuery.data || [],
    isLoading: datesQuery.isLoading || slotsQuery.isLoading,
    rescheduleOrder: rescheduleMutation.mutateAsync,
    isRescheduling: rescheduleMutation.isPending,
    rescheduleResult: rescheduleMutation.data,
  };
}
