"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { serviceDetailService } from "@/services/serviceDetailService";
import { queryKeys } from "@/lib/query/queryKeys";
import { showError } from "@/lib/ui/toast";

export function useServiceDetail(serviceId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.catalog.service(serviceId),
    queryFn: () => serviceDetailService.getServiceDetailById(serviceId),
    enabled: Boolean(serviceId),
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  const isFavoritedQuery = useQuery({
    queryKey: ["customer", "isFavorited", serviceId],
    queryFn: () => serviceDetailService.isServiceFavorited(serviceId),
    enabled: Boolean(serviceId),
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: () => serviceDetailService.toggleFavoriteService(serviceId),
    onSuccess: (isFav) => {
      queryClient.setQueryData(["customer", "isFavorited", serviceId], isFav);
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.favorites() });
    },
    onError: (err) => {
      showError(err, "Failed to Update Favorite");
    },
  });

  return {
    service: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFavorited: Boolean(isFavoritedQuery.data),
    toggleFavorite: toggleFavoriteMutation.mutateAsync,
    isTogglingFavorite: toggleFavoriteMutation.isPending,
  };
}
