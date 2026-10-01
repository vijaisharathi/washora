"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryPartnerScheduleService } from "@/services/delivery-partner/deliveryPartnerScheduleService";
import { RescheduleStopPayload } from "@/types/delivery-partner";
import { DP_TASKS_QUERY_KEY } from "../../tasks/hooks/useDeliveryPartnerTasks";
import { DP_DASHBOARD_QUERY_KEY } from "../../dashboard/hooks/useDeliveryPartnerDashboard";

export const DP_SCHEDULE_QUERY_KEY = ["deliveryPartner", "schedule"];

export function useDeliveryPartnerSchedule(dateStr: string = "2026-09-03") {
  const queryClient = useQueryClient();

  const scheduleQuery = useQuery({
    queryKey: [...DP_SCHEDULE_QUERY_KEY, dateStr],
    queryFn: () => deliveryPartnerScheduleService.getSchedule(dateStr),
    staleTime: 1000 * 60 * 2,
  });

  const reorderStopsMutation = useMutation({
    mutationFn: (taskIds: string[]) =>
      deliveryPartnerScheduleService.reorderStops(dateStr, taskIds),
    onSuccess: (updatedSchedule) => {
      queryClient.setQueryData([...DP_SCHEDULE_QUERY_KEY, dateStr], updatedSchedule);
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: (payload: RescheduleStopPayload) =>
      deliveryPartnerScheduleService.rescheduleStop(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DP_SCHEDULE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_DASHBOARD_QUERY_KEY });
    },
  });

  return {
    schedule: scheduleQuery.data,
    isLoading: scheduleQuery.isLoading,
    isError: scheduleQuery.isError,
    error: scheduleQuery.error,
    refetch: scheduleQuery.refetch,
    reorderStops: reorderStopsMutation.mutateAsync,
    isReordering: reorderStopsMutation.isPending,
    rescheduleStop: rescheduleMutation.mutateAsync,
    isRescheduling: rescheduleMutation.isPending,
  };
}
