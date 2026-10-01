"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { serviceDiscoveryService } from "@/services/serviceDiscoveryService";
import { ServiceDiscoveryFilter } from "@/types/customer/services";
import { useLocation } from "./useLocation";
import { queryKeys } from "@/lib/query/queryKeys";
import { showError } from "@/lib/ui/toast";

export const SERVICE_DISCOVERY_QUERY_KEY = ["customer", "serviceDiscovery"] as const;

export function useServiceDiscovery(filter?: ServiceDiscoveryFilter) {
  const queryClient = useQueryClient();
  const { currentLocation } = useLocation();

  const query = useQuery({
    queryKey: [
      ...SERVICE_DISCOVERY_QUERY_KEY,
      filter?.categorySlug,
      filter?.query,
      filter?.minPrice,
      filter?.maxPrice,
      filter?.sortBy,
      currentLocation?.areaName,
    ],
    queryFn: () => serviceDiscoveryService.getDiscoveryData(filter),
    staleTime: 1000 * 60 * 3, // 3 mins
  });

  const addSearchMutation = useMutation({
    mutationFn: (q: string) => serviceDiscoveryService.addRecentSearch(q),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICE_DISCOVERY_QUERY_KEY });
    },
    onError: (err) => {
      showError(err, "Failed to Update Recent Search");
    },
  });

  const clearSearchesMutation = useMutation({
    mutationFn: () => serviceDiscoveryService.clearRecentSearches(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICE_DISCOVERY_QUERY_KEY });
    },
    onError: (err) => {
      showError(err, "Failed to Clear Searches");
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    addRecentSearch: addSearchMutation.mutateAsync,
    clearRecentSearches: clearSearchesMutation.mutateAsync,
  };
}

export function useCategoryDetail(slug: string) {
  return useQuery({
    queryKey: queryKeys.catalog.category(slug),
    queryFn: () => serviceDiscoveryService.getCategoryBySlug(slug),
    enabled: Boolean(slug),
  });
}
