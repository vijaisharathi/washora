"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { providerSettingsService } from "@/services/provider/providerSettingsService";
import {
  ChangePasswordPayload,
  ProviderAccountPreferences,
  DeactivateAccountPayload,
} from "@/types/provider/settings";

export function useProviderSettings(providerId: string = "prov-1") {
  const queryClient = useQueryClient();

  const accountQuery = useQuery({
    queryKey: ["provider", "settings", "account", providerId],
    queryFn: () => providerSettingsService.getAccountOverview(providerId),
    staleTime: 1000 * 60 * 5,
  });

  const sessionsQuery = useQuery({
    queryKey: ["provider", "settings", "sessions", providerId],
    queryFn: () => providerSettingsService.getSecuritySessions(providerId),
    staleTime: 1000 * 60 * 5,
  });

  const preferencesQuery = useQuery({
    queryKey: ["provider", "settings", "preferences", providerId],
    queryFn: () => providerSettingsService.getPreferences(providerId),
    staleTime: 1000 * 60 * 5,
  });

  const changePasswordMutation = useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      providerSettingsService.changePassword(payload, providerId),
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (payload: Partial<ProviderAccountPreferences>) =>
      providerSettingsService.updatePreferences(payload, providerId),
    onSuccess: (data) => {
      queryClient.setQueryData(["provider", "settings", "preferences", providerId], data);
    },
  });

  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId: string) =>
      providerSettingsService.revokeSession(sessionId, providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider", "settings", "sessions"] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (payload: DeactivateAccountPayload) =>
      providerSettingsService.deactivateAccount(payload, providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider", "settings", "account"] });
    },
  });

  return {
    account: accountQuery.data,
    isLoadingAccount: accountQuery.isLoading,
    sessions: sessionsQuery.data || [],
    isLoadingSessions: sessionsQuery.isLoading,
    preferences: preferencesQuery.data,
    isLoadingPreferences: preferencesQuery.isLoading,

    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,

    updatePreferences: updatePreferencesMutation.mutateAsync,
    isUpdatingPreferences: updatePreferencesMutation.isPending,

    revokeSession: revokeSessionMutation.mutateAsync,
    isRevokingSession: revokeSessionMutation.isPending,

    deactivateAccount: deactivateMutation.mutateAsync,
    isDeactivating: deactivateMutation.isPending,
  };
}
