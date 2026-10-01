"use client";

import { useQuery } from "@tanstack/react-query";
import { deliveryPartnerDashboardService } from "@/services/delivery-partner/deliveryPartnerDashboardService";
import { DP_FULL_PROFILE_QUERY_KEY } from "../../profile/hooks/useDeliveryPartnerProfile";
import { DP_SESSION_QUERY_KEY } from "../../hooks/useDeliveryPartnerSession";

export const DP_DASHBOARD_QUERY_KEY = ["deliveryPartner", "dashboardSummary"];

export function useDeliveryPartnerDashboard() {
  const dashboardQuery = useQuery({
    queryKey: DP_DASHBOARD_QUERY_KEY,
    queryFn: () => deliveryPartnerDashboardService.getDashboardSummary(),
    staleTime: 1000 * 60 * 2,
  });

  return {
    summary: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    error: dashboardQuery.error,
    refetch: dashboardQuery.refetch,
  };
}
