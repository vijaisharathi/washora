"use client";

import { useQuery } from "@tanstack/react-query";
import { deliveryPartnerHistoryService } from "@/services/delivery-partner/deliveryPartnerHistoryService";
import { HistoryFilterParams } from "@/types/delivery-partner";

export const DP_HISTORY_SUMMARY_QUERY_KEY = ["deliveryPartner", "historySummary"];
export const DP_HISTORY_RECORDS_QUERY_KEY = ["deliveryPartner", "historyRecords"];

export function useDeliveryPartnerHistorySummary() {
  const query = useQuery({
    queryKey: DP_HISTORY_SUMMARY_QUERY_KEY,
    queryFn: () => deliveryPartnerHistoryService.getHistorySummary(),
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

export function useDeliveryPartnerHistoryRecords(filter?: HistoryFilterParams) {
  const query = useQuery({
    queryKey: [...DP_HISTORY_RECORDS_QUERY_KEY, filter?.outcome, filter?.searchQuery, filter?.datePreset],
    queryFn: () => deliveryPartnerHistoryService.getHistoryRecords(filter),
    staleTime: 1000 * 60 * 2,
  });

  return {
    records: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useDeliveryPartnerHistoryDetail(id: string) {
  const query = useQuery({
    queryKey: ["deliveryPartner", "historyRecord", id],
    queryFn: () => deliveryPartnerHistoryService.getHistoryRecordById(id),
    staleTime: 1000 * 60 * 2,
    enabled: !!id,
  });

  return {
    record: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
