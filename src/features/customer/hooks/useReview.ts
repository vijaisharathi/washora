"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "@/services/reviewService";
import { SubmitReviewPayload } from "@/types/customer/review";
import { queryKeys } from "@/lib/query/queryKeys";
import { showError } from "@/lib/ui/toast";

export function useReview(orderId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.reviews.booking(orderId),
    queryFn: () => reviewService.getReview(orderId),
    enabled: Boolean(orderId),
    staleTime: 1000 * 60 * 10,
  });

  const submitMutation = useMutation({
    mutationFn: (payload: SubmitReviewPayload) => reviewService.submitReview(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.reviews.booking(orderId), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.list() });
    },
    onError: (err) => {
      showError(err, "Failed to Submit Review");
    },
  });

  return {
    review: query.data,
    isLoading: query.isLoading,
    submitReview: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    submitResult: submitMutation.data,
  };
}
