"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { providerReviewsService } from "@/services/provider/providerReviewsService";
import {
  ProviderReviewFilters,
  SubmitReviewResponsePayload,
  ReportReviewPayload,
} from "@/types/provider/reviews";

export function useProviderReviews(
  filters?: ProviderReviewFilters,
  providerId: string = "prov-1"
) {
  const queryClient = useQueryClient();

  const summaryQuery = useQuery({
    queryKey: ["provider", "reviews", "summary", providerId],
    queryFn: () => providerReviewsService.getRatingSummary(providerId),
    staleTime: 1000 * 60 * 5,
  });

  const reviewsQuery = useQuery({
    queryKey: ["provider", "reviews", "list", filters, providerId],
    queryFn: () => providerReviewsService.getReviews(filters, providerId),
    staleTime: 1000 * 60 * 3,
  });

  const submitResponseMutation = useMutation({
    mutationFn: (payload: SubmitReviewResponsePayload) =>
      providerReviewsService.submitResponse(payload, providerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["provider", "reviews"] });
      queryClient.setQueryData(["provider", "review", data.id], data);
    },
  });

  const reportReviewMutation = useMutation({
    mutationFn: (payload: ReportReviewPayload) =>
      providerReviewsService.reportReview(payload, providerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["provider", "reviews"] });
      queryClient.setQueryData(["provider", "review", data.id], data);
    },
  });

  return {
    summary: summaryQuery.data,
    isLoadingSummary: summaryQuery.isLoading,
    reviews: reviewsQuery.data || [],
    isLoadingReviews: reviewsQuery.isLoading,
    isError: reviewsQuery.isError,
    refetch: reviewsQuery.refetch,

    submitResponse: submitResponseMutation.mutateAsync,
    isSubmittingResponse: submitResponseMutation.isPending,

    reportReview: reportReviewMutation.mutateAsync,
    isReportingReview: reportReviewMutation.isPending,
  };
}

export function useProviderReviewItem(reviewId: string, providerId: string = "prov-1") {
  return useQuery({
    queryKey: ["provider", "review", reviewId],
    queryFn: () => providerReviewsService.getReviewById(reviewId, providerId),
    enabled: !!reviewId,
  });
}
