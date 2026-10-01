"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { providerService } from "@/services/providerService";
import { ProviderFilter } from "@/types/customer/provider";
import { useLocation } from "./useLocation";
import { queryKeys } from "@/lib/query/queryKeys";
import { showError } from "@/lib/ui/toast";

export const PROVIDERS_QUERY_KEY = ["customer", "providers"] as const;

export function useProviders(filter?: ProviderFilter) {
  const { currentLocation } = useLocation();

  const query = useQuery({
    queryKey: [
      ...PROVIDERS_QUERY_KEY,
      filter?.query,
      filter?.minRating,
      filter?.maxDistanceKm,
      filter?.verifiedOnly,
      filter?.sortBy,
      currentLocation?.areaName,
    ],
    queryFn: () => providerService.getDiscoveryData(filter),
    staleTime: 1000 * 60 * 3, // 3 mins
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useProviderDetail(providerId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["customer", "providerDetail", providerId] as const,
    queryFn: () => providerService.getProviderById(providerId),
    enabled: Boolean(providerId),
    staleTime: 1000 * 60 * 5,
  });

  const isFavoritedQuery = useQuery({
    queryKey: ["customer", "isProviderFavorited", providerId] as const,
    queryFn: () => providerService.isProviderFavorited(providerId),
    enabled: Boolean(providerId),
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: () => providerService.toggleFavoriteProvider(providerId),
    onSuccess: (isFav) => {
      queryClient.setQueryData(["customer", "isProviderFavorited", providerId], isFav);
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.favorites() });
    },
    onError: (err) => {
      showError(err, "Failed to Update Favorite");
    },
  });

  return {
    provider: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFavorited: Boolean(isFavoritedQuery.data),
    toggleFavorite: toggleFavoriteMutation.mutateAsync,
    isTogglingFavorite: toggleFavoriteMutation.isPending,
  };
}
