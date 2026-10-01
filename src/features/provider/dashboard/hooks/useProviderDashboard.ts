"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { providerDashboardService } from "@/services/provider/providerDashboardService";

export function useProviderDashboard() {
  const queryClient = useQueryClient();

  const dashboardQuery = useQuery({
    queryKey: ["provider", "dashboard"],
    queryFn: () => providerDashboardService.getDashboardData(),
    staleTime: 1000 * 60 * 3,
  });

  const refreshMutation = useMutation({
    mutationFn: () => providerDashboardService.refreshDashboardData(),
    onSuccess: (data) => {
      queryClient.setQueryData(["provider", "dashboard"], data);
    },
  });

  return {
    data: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    refetch: dashboardQuery.refetch,
    refresh: refreshMutation.mutateAsync,
    isRefreshing: refreshMutation.isPending,
  };
}
