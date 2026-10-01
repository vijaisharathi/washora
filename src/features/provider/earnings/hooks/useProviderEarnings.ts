"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { providerEarningsService } from "@/services/provider/providerEarningsService";
import {
  RequestPayoutPayload,
  UpdatePayoutAccountPayload,
} from "@/types/provider/earnings";

export function useProviderEarnings(providerId: string = "prov-1") {
  const queryClient = useQueryClient();

  const summaryQuery = useQuery({
    queryKey: ["provider", "earnings", "summary", providerId],
    queryFn: () => providerEarningsService.getEarningsSummary(providerId),
    staleTime: 1000 * 60 * 3,
  });

  const trendsQuery = useQuery({
    queryKey: ["provider", "earnings", "trends", providerId],
    queryFn: () => providerEarningsService.getWeeklyTrends(providerId),
    staleTime: 1000 * 60 * 5,
  });

  const transactionsQuery = useQuery({
    queryKey: ["provider", "earnings", "transactions", providerId],
    queryFn: () => providerEarningsService.getTransactions(providerId),
    staleTime: 1000 * 60 * 3,
  });

  const payoutsQuery = useQuery({
    queryKey: ["provider", "earnings", "payouts", providerId],
    queryFn: () => providerEarningsService.getPayouts(providerId),
    staleTime: 1000 * 60 * 3,
  });

  const accountQuery = useQuery({
    queryKey: ["provider", "earnings", "account", providerId],
    queryFn: () => providerEarningsService.getPayoutAccount(providerId),
    staleTime: 1000 * 60 * 5,
  });

  const requestPayoutMutation = useMutation({
    mutationFn: (payload: RequestPayoutPayload) =>
      providerEarningsService.requestPayout(payload, providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider", "earnings"] });
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: (payload: UpdatePayoutAccountPayload) =>
      providerEarningsService.updatePayoutAccount(payload, providerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["provider", "earnings", "account"] });
      queryClient.setQueryData(["provider", "earnings", "account", providerId], data);
    },
  });

  return {
    summary: summaryQuery.data,
    isLoadingSummary: summaryQuery.isLoading,
    trends: trendsQuery.data || [],
    transactions: transactionsQuery.data || [],
    isLoadingTransactions: transactionsQuery.isLoading,
    payouts: payoutsQuery.data || [],
    isLoadingPayouts: payoutsQuery.isLoading,
    account: accountQuery.data,
    isLoadingAccount: accountQuery.isLoading,

    requestPayout: requestPayoutMutation.mutateAsync,
    isRequestingPayout: requestPayoutMutation.isPending,

    updateAccount: updateAccountMutation.mutateAsync,
    isUpdatingAccount: updateAccountMutation.isPending,
  };
}
