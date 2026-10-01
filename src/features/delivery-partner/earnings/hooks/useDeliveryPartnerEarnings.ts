"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryPartnerEarningsService } from "@/services/delivery-partner/deliveryPartnerEarningsService";
import { RequestPayoutPayload } from "@/types/delivery-partner";
import { DP_DASHBOARD_QUERY_KEY } from "../../dashboard/hooks/useDeliveryPartnerDashboard";

export const DP_EARNINGS_QUERY_KEY = ["deliveryPartner", "earnings"];
export const DP_TRANSACTIONS_QUERY_KEY = ["deliveryPartner", "transactions"];
export const DP_PAYOUTS_QUERY_KEY = ["deliveryPartner", "payouts"];

export function useDeliveryPartnerEarningsSummary() {
  const query = useQuery({
    queryKey: DP_EARNINGS_QUERY_KEY,
    queryFn: () => deliveryPartnerEarningsService.getEarningsSummary(),
    staleTime: 1000 * 60 * 2,
  });

  return {
    summary: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useDeliveryPartnerTransactions(filter?: { status?: string; dateRange?: string }) {
  const query = useQuery({
    queryKey: [...DP_TRANSACTIONS_QUERY_KEY, filter?.status, filter?.dateRange],
    queryFn: () => deliveryPartnerEarningsService.getTransactions(filter),
    staleTime: 1000 * 60 * 2,
  });

  return {
    transactions: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useDeliveryPartnerTransactionDetail(id: string) {
  const query = useQuery({
    queryKey: ["deliveryPartner", "transaction", id],
    queryFn: () => deliveryPartnerEarningsService.getTransactionById(id),
    staleTime: 1000 * 60 * 2,
    enabled: !!id,
  });

  return {
    transaction: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useDeliveryPartnerPayoutDetail(id: string) {
  const query = useQuery({
    queryKey: ["deliveryPartner", "payout", id],
    queryFn: () => deliveryPartnerEarningsService.getPayoutById(id),
    staleTime: 1000 * 60 * 2,
    enabled: !!id,
  });

  return {
    payout: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useDeliveryPartnerInstantCashout() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: RequestPayoutPayload) =>
      deliveryPartnerEarningsService.requestInstantPayout(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DP_EARNINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_TRANSACTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_PAYOUTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DP_DASHBOARD_QUERY_KEY });
    },
  });

  return {
    requestCashout: mutation.mutateAsync,
    isRequesting: mutation.isPending,
  };
}
