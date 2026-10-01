"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerProfileService } from "@/services/customerProfileService";
import { ProfileUpdatePayload, AddressFormData } from "@/types/customer";
import { queryKeys } from "@/lib/query/queryKeys";
import { showError } from "@/lib/ui/toast";

export const CUSTOMER_PROFILE_KEY = queryKeys.customer.profile();
export const CUSTOMER_ADDRESSES_KEY = queryKeys.customer.addresses();

export function useCustomerProfile() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: CUSTOMER_PROFILE_KEY,
    queryFn: () => customerProfileService.getProfile(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (payload: ProfileUpdatePayload) =>
      customerProfileService.updateProfile(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(CUSTOMER_PROFILE_KEY, updated);
    },
    onError: (err) => {
      showError(err, "Failed to Update Profile");
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (imageUrl: string) =>
      customerProfileService.uploadProfileImage(imageUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_PROFILE_KEY });
    },
    onError: (err) => {
      showError(err, "Failed to Upload Photo");
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    updateError: updateProfileMutation.error,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    refetch: profileQuery.refetch,
  };
}

export function useCustomerAddresses() {
  const queryClient = useQueryClient();

  const addressesQuery = useQuery({
    queryKey: CUSTOMER_ADDRESSES_KEY,
    queryFn: () => customerProfileService.getAddresses(),
  });

  const addAddressMutation = useMutation({
    mutationFn: (data: AddressFormData) => customerProfileService.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_ADDRESSES_KEY });
    },
    onError: (err) => {
      showError(err, "Failed to Add Address");
    },
  });

  return {
    addresses: addressesQuery.data || [],
    isLoading: addressesQuery.isLoading,
    isError: addressesQuery.isError,
    refetch: addressesQuery.refetch,
    addAddress: addAddressMutation.mutateAsync,
  };
}
