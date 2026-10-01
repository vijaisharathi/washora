"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerProfileService } from "@/services/customerProfileService";
import { AddressFormData, CustomerAddress } from "@/types/customer";
import { queryKeys } from "@/lib/query/queryKeys";
import { showError } from "@/lib/ui/toast";

export const ADDRESSES_QUERY_KEY = queryKeys.customer.addresses();

export function useAddresses() {
  const queryClient = useQueryClient();

  const addressesQuery = useQuery({
    queryKey: ADDRESSES_QUERY_KEY,
    queryFn: () => customerProfileService.getAddresses(),
  });

  const createAddressMutation = useMutation({
    mutationFn: (data: AddressFormData) => customerProfileService.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
    onError: (err) => {
      showError(err, "Failed to Add Address");
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AddressFormData> }) =>
      customerProfileService.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
    onError: (err) => {
      showError(err, "Failed to Update Address");
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => customerProfileService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
    onError: (err) => {
      showError(err, "Failed to Delete Address");
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => customerProfileService.setDefaultAddress(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ADDRESSES_QUERY_KEY });
      const previous = queryClient.getQueryData<CustomerAddress[]>(ADDRESSES_QUERY_KEY);
      if (previous) {
        queryClient.setQueryData<CustomerAddress[]>(
          ADDRESSES_QUERY_KEY,
          previous.map((addr) => ({ ...addr, isDefault: addr.id === id }))
        );
      }
      return { previous };
    },
    onError: (err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ADDRESSES_QUERY_KEY, context.previous);
      }
      showError(err, "Failed to Set Default Address");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });

  return {
    addresses: addressesQuery.data || [],
    defaultAddress: (addressesQuery.data || []).find((a) => a.isDefault),
    isLoading: addressesQuery.isLoading,
    isError: addressesQuery.isError,
    error: addressesQuery.error,
    createAddress: createAddressMutation.mutateAsync,
    isCreating: createAddressMutation.isPending,
    createError: createAddressMutation.error,
    updateAddress: updateAddressMutation.mutateAsync,
    isUpdating: updateAddressMutation.isPending,
    updateError: updateAddressMutation.error,
    deleteAddress: deleteAddressMutation.mutateAsync,
    isDeleting: deleteAddressMutation.isPending,
    deleteError: deleteAddressMutation.error,
    setDefaultAddress: setDefaultMutation.mutateAsync,
    isSettingDefault: setDefaultMutation.isPending,
    refetch: addressesQuery.refetch,
  };
}

export function useAddressById(id: string) {
  return useQuery({
    queryKey: queryKeys.customer.address(id),
    queryFn: () => customerProfileService.getAddressById(id),
    enabled: Boolean(id),
  });
}
