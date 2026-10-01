"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { disputesRefundsService } from "@/services/disputesRefundsService";
import { DisputeClaimPayload } from "@/types/customer/disputesRefunds";
import { queryKeys } from "@/lib/query/queryKeys";
import { showError } from "@/lib/ui/toast";

export function useDisputesRefunds(orderId: string) {
  const queryClient = useQueryClient();

  const receiptQuery = useQuery({
    queryKey: ["customer", "orderReceipt", orderId] as const,
    queryFn: () => disputesRefundsService.getOrderReceipt(orderId),
    enabled: Boolean(orderId),
  });

  const reasonsQuery = useQuery({
    queryKey: ["customer", "dispute-reasons"] as const,
    queryFn: () => disputesRefundsService.getDisputeReasons(),
    staleTime: 1000 * 60 * 15,
  });

  const disputeStatusQuery = useQuery({
    queryKey: queryKeys.disputes.detail(orderId),
    queryFn: () => disputesRefundsService.getDisputeStatus(orderId),
    enabled: Boolean(orderId),
  });

  const disputeMutation = useMutation({
    mutationFn: (payload: DisputeClaimPayload) =>
      disputesRefundsService.createDisputeClaim(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.disputes.detail(orderId), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.disputes.list() });
    },
    onError: (err) => {
      showError(err, "Failed to Submit Dispute");
    },
  });

  return {
    receipt: receiptQuery.data,
    reasons: reasonsQuery.data || [],
    existingDispute: disputeStatusQuery.data,
    isLoading: receiptQuery.isLoading || reasonsQuery.isLoading,
    refetch: receiptQuery.refetch,
    submitDispute: disputeMutation.mutateAsync,
    isSubmitting: disputeMutation.isPending,
    submittedDispute: disputeMutation.data,
  };
}
