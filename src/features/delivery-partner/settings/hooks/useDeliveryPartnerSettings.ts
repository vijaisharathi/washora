"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryPartnerSettingsService } from "@/services/delivery-partner/deliveryPartnerSettingsService";
import { UpdatePreferencesPayload, ChangePasswordPayload } from "@/types/delivery-partner";

export const DP_SETTINGS_PREFERENCES_QUERY_KEY = ["deliveryPartner", "settingsPreferences"];
export const DP_SETTINGS_SECURITY_QUERY_KEY = ["deliveryPartner", "settingsSecurity"];

export function useDeliveryPartnerPreferences() {
  const query = useQuery({
    queryKey: DP_SETTINGS_PREFERENCES_QUERY_KEY,
    queryFn: () => deliveryPartnerSettingsService.getPreferences(),
    staleTime: 1000 * 60 * 5,
  });

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useDeliveryPartnerSecuritySettings() {
  const query = useQuery({
    queryKey: DP_SETTINGS_SECURITY_QUERY_KEY,
    queryFn: () => deliveryPartnerSettingsService.getSecuritySettings(),
    staleTime: 1000 * 60 * 5,
  });

  return {
    securitySettings: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useDeliveryPartnerSettingsActions() {
  const queryClient = useQueryClient();

  const updatePrefsMutation = useMutation({
    mutationFn: (payload: UpdatePreferencesPayload) =>
      deliveryPartnerSettingsService.updatePreferences(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DP_SETTINGS_PREFERENCES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_SETTINGS_SECURITY_QUERY_KEY });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      deliveryPartnerSettingsService.changePassword(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DP_SETTINGS_SECURITY_QUERY_KEY });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (reason: string) =>
      deliveryPartnerSettingsService.deactivateAccount(reason),
  });

  return {
    updatePreferences: updatePrefsMutation.mutateAsync,
    isUpdatingPreferences: updatePrefsMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    deactivateAccount: deactivateMutation.mutateAsync,
    isDeactivating: deactivateMutation.isPending,
  };
}
