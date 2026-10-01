"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { providerAvailabilityService } from "@/services/provider/providerAvailabilityService";
import {
  UpdateWorkingHoursPayload,
  UpdateCapacityPayload,
  AddBlackoutDatePayload,
} from "@/types/provider/availability";

export function useProviderAvailability(providerId: string = "prov-1") {
  const queryClient = useQueryClient();

  const availabilityQuery = useQuery({
    queryKey: ["provider", "availability", providerId],
    queryFn: () => providerAvailabilityService.getAvailability(providerId),
    staleTime: 1000 * 60 * 3,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: () => providerAvailabilityService.toggleOverallAvailability(providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider", "availability"] });
    },
  });

  const updateHoursMutation = useMutation({
    mutationFn: (payload: UpdateWorkingHoursPayload) =>
      providerAvailabilityService.updateWorkingHours(payload, providerId),
    onSuccess: (data) => {
      queryClient.setQueryData(["provider", "availability", providerId], data);
    },
  });

  const updateCapacityMutation = useMutation({
    mutationFn: (payload: UpdateCapacityPayload) =>
      providerAvailabilityService.updateCapacity(payload, providerId),
    onSuccess: (data) => {
      queryClient.setQueryData(["provider", "availability", providerId], data);
    },
  });

  const addBlackoutMutation = useMutation({
    mutationFn: (payload: AddBlackoutDatePayload) =>
      providerAvailabilityService.addBlackoutDate(payload, providerId),
    onSuccess: (data) => {
      queryClient.setQueryData(["provider", "availability", providerId], data);
    },
  });

  const removeBlackoutMutation = useMutation({
    mutationFn: (blackoutId: string) =>
      providerAvailabilityService.removeBlackoutDate(blackoutId, providerId),
    onSuccess: (data) => {
      queryClient.setQueryData(["provider", "availability", providerId], data);
    },
  });

  return {
    availability: availabilityQuery.data,
    isLoading: availabilityQuery.isLoading,
    isError: availabilityQuery.isError,
    refetch: availabilityQuery.refetch,

    toggleActive: toggleActiveMutation.mutateAsync,
    isTogglingActive: toggleActiveMutation.isPending,

    updateWorkingHours: updateHoursMutation.mutateAsync,
    isUpdatingHours: updateHoursMutation.isPending,

    updateCapacity: updateCapacityMutation.mutateAsync,
    isUpdatingCapacity: updateCapacityMutation.isPending,

    addBlackoutDate: addBlackoutMutation.mutateAsync,
    isAddingBlackout: addBlackoutMutation.isPending,

    removeBlackoutDate: removeBlackoutMutation.mutateAsync,
    isRemovingBlackout: removeBlackoutMutation.isPending,
  };
}
