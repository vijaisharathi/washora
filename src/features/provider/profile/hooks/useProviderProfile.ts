"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { providerProfileService } from "@/services/provider/providerProfileService";
import {
  ProviderBusinessIdentity,
  ProviderContactInfo,
  ProviderBusinessAddress,
  ProviderOperatingHoursConfig,
  ProviderServiceAreaConfig,
} from "@/types/provider/profile";

export function useProviderProfile() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["provider", "fullProfile"],
    queryFn: () => providerProfileService.getFullProfile(),
    staleTime: 1000 * 60 * 5,
  });

  const updateIdentityMutation = useMutation({
    mutationFn: (identity: Partial<ProviderBusinessIdentity>) =>
      providerProfileService.updateBusinessIdentity(identity),
    onSuccess: (data) => {
      queryClient.setQueryData(["provider", "fullProfile"], data);
      queryClient.invalidateQueries({ queryKey: ["provider", "profileSummary"] });
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: (contact: Partial<ProviderContactInfo>) =>
      providerProfileService.updateContactInfo(contact),
    onSuccess: (data) => {
      queryClient.setQueryData(["provider", "fullProfile"], data);
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: (address: Partial<ProviderBusinessAddress>) =>
      providerProfileService.updateBusinessAddress(address),
    onSuccess: (data) => {
      queryClient.setQueryData(["provider", "fullProfile"], data);
    },
  });

  const updateHoursMutation = useMutation({
    mutationFn: (hours: Partial<ProviderOperatingHoursConfig>) =>
      providerProfileService.updateOperatingHours(hours),
    onSuccess: (data) => {
      queryClient.setQueryData(["provider", "fullProfile"], data);
    },
  });

  const updateServiceAreaMutation = useMutation({
    mutationFn: (area: Partial<ProviderServiceAreaConfig>) =>
      providerProfileService.updateServiceArea(area),
    onSuccess: (data) => {
      queryClient.setQueryData(["provider", "fullProfile"], data);
    },
  });

  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => providerProfileService.uploadLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider", "fullProfile"] });
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,

    updateIdentity: updateIdentityMutation.mutateAsync,
    isUpdatingIdentity: updateIdentityMutation.isPending,

    updateContact: updateContactMutation.mutateAsync,
    isUpdatingContact: updateContactMutation.isPending,

    updateAddress: updateAddressMutation.mutateAsync,
    isUpdatingAddress: updateAddressMutation.isPending,

    updateHours: updateHoursMutation.mutateAsync,
    isUpdatingHours: updateHoursMutation.isPending,

    updateServiceArea: updateServiceAreaMutation.mutateAsync,
    isUpdatingServiceArea: updateServiceAreaMutation.isPending,

    uploadLogo: uploadLogoMutation.mutateAsync,
    isUploadingLogo: uploadLogoMutation.isPending,
  };
}
