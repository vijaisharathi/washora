"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { providerPickupsService } from "@/services/provider/providerPickupsService";
import {
  AssignPartnerPayload,
  ToggleHandoverChecklistPayload,
  ConfirmHandoverPayload,
  ReportHandoverIssuePayload,
} from "@/types/provider/pickups";

export function useProviderPickups(providerId: string = "prov-1") {
  const queryClient = useQueryClient();

  const pickupsQuery = useQuery({
    queryKey: ["provider", "pickups", providerId],
    queryFn: () => providerPickupsService.getPickups(providerId),
    staleTime: 1000 * 60 * 3,
  });

  const statsQuery = useQuery({
    queryKey: ["provider", "pickups", "stats", providerId],
    queryFn: () => providerPickupsService.getPickupStats(providerId),
    staleTime: 1000 * 60 * 3,
  });

  const partnersQuery = useQuery({
    queryKey: ["provider", "available-partners"],
    queryFn: () => providerPickupsService.getAvailablePartners(),
    staleTime: 1000 * 60 * 5,
  });

  const assignPartnerMutation = useMutation({
    mutationFn: (payload: AssignPartnerPayload) =>
      providerPickupsService.assignPartner(payload, providerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["provider", "pickups"] });
      queryClient.setQueryData(["provider", "pickup", data.id], data);
    },
  });

  const toggleChecklistMutation = useMutation({
    mutationFn: (payload: ToggleHandoverChecklistPayload) =>
      providerPickupsService.toggleChecklist(payload, providerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["provider", "pickups"] });
      queryClient.setQueryData(["provider", "pickup", data.id], data);
    },
  });

  const confirmHandoverMutation = useMutation({
    mutationFn: (payload: ConfirmHandoverPayload) =>
      providerPickupsService.confirmHandover(payload, providerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["provider", "pickups"] });
      queryClient.setQueryData(["provider", "pickup", data.id], data);
    },
  });

  const reportIssueMutation = useMutation({
    mutationFn: (payload: ReportHandoverIssuePayload) =>
      providerPickupsService.reportIssue(payload, providerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["provider", "pickups"] });
      queryClient.setQueryData(["provider", "pickup", data.id], data);
    },
  });

  return {
    pickups: pickupsQuery.data || [],
    isLoading: pickupsQuery.isLoading,
    isError: pickupsQuery.isError,
    stats: statsQuery.data,
    availablePartners: partnersQuery.data || [],
    refetch: pickupsQuery.refetch,

    assignPartner: assignPartnerMutation.mutateAsync,
    isAssigning: assignPartnerMutation.isPending,

    toggleChecklist: toggleChecklistMutation.mutateAsync,
    isToggling: toggleChecklistMutation.isPending,

    confirmHandover: confirmHandoverMutation.mutateAsync,
    isConfirming: confirmHandoverMutation.isPending,

    reportIssue: reportIssueMutation.mutateAsync,
    isReporting: reportIssueMutation.isPending,
  };
}

export function useProviderPickupItem(pickupId: string, providerId: string = "prov-1") {
  return useQuery({
    queryKey: ["provider", "pickup", pickupId],
    queryFn: () => providerPickupsService.getPickupById(pickupId, providerId),
    enabled: !!pickupId,
  });
}
