"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryPartnerProfileService } from "@/services/delivery-partner/deliveryPartnerProfileService";
import {
  UpdatePersonalInfoPayload,
  UpdateVehicleInfoPayload,
  UpdateShiftHubPayload,
  UpdateBankInfoPayload,
} from "@/types/delivery-partner";
import { DP_SESSION_QUERY_KEY, DP_PROFILE_QUERY_KEY } from "../../hooks/useDeliveryPartnerSession";

export const DP_FULL_PROFILE_QUERY_KEY = ["deliveryPartner", "fullProfile"];

export function useDeliveryPartnerProfile() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: DP_FULL_PROFILE_QUERY_KEY,
    queryFn: () => deliveryPartnerProfileService.getFullProfile(),
    staleTime: 1000 * 60 * 5,
  });

  const updatePersonalInfoMutation = useMutation({
    mutationFn: (payload: UpdatePersonalInfoPayload) =>
      deliveryPartnerProfileService.updatePersonalInfo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DP_FULL_PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_SESSION_QUERY_KEY });
    },
  });

  const updateVehicleInfoMutation = useMutation({
    mutationFn: (payload: UpdateVehicleInfoPayload) =>
      deliveryPartnerProfileService.updateVehicleInfo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DP_FULL_PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_SESSION_QUERY_KEY });
    },
  });

  const updateShiftHubMutation = useMutation({
    mutationFn: (payload: UpdateShiftHubPayload) =>
      deliveryPartnerProfileService.updateShiftHub(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DP_FULL_PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_SESSION_QUERY_KEY });
    },
  });

  const updateBankInfoMutation = useMutation({
    mutationFn: (payload: UpdateBankInfoPayload) =>
      deliveryPartnerProfileService.updateBankInfo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DP_FULL_PROFILE_QUERY_KEY });
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    updatePersonalInfo: updatePersonalInfoMutation.mutateAsync,
    isUpdatingPersonalInfo: updatePersonalInfoMutation.isPending,
    updateVehicleInfo: updateVehicleInfoMutation.mutateAsync,
    isUpdatingVehicleInfo: updateVehicleInfoMutation.isPending,
    updateShiftHub: updateShiftHubMutation.mutateAsync,
    isUpdatingShiftHub: updateShiftHubMutation.isPending,
    updateBankInfo: updateBankInfoMutation.mutateAsync,
    isUpdatingBankInfo: updateBankInfoMutation.isPending,
  };
}
