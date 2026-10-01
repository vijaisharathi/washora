"use client";

import { useQuery } from "@tanstack/react-query";
import { deliveryPartnerReviewsService } from "@/services/delivery-partner/deliveryPartnerReviewsService";
import { ReviewFilterParams } from "@/types/delivery-partner";

export const DP_REVIEWS_SUMMARY_QUERY_KEY = ["deliveryPartner", "reviewsSummary"];
export const DP_REVIEWS_LIST_QUERY_KEY = ["deliveryPartner", "reviewsList"];

export function useDeliveryPartnerReviewsSummary() {
  const query = useQuery({
    queryKey: DP_REVIEWS_SUMMARY_QUERY_KEY,
    queryFn: () => deliveryPartnerReviewsService.getReviewsSummary(),
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

export function useDeliveryPartnerReviews(filter?: ReviewFilterParams) {
  const query = useQuery({
    queryKey: [...DP_REVIEWS_LIST_QUERY_KEY, filter?.rating, filter?.searchQuery, filter?.sortBy],
    queryFn: () => deliveryPartnerReviewsService.getReviews(filter),
    staleTime: 1000 * 60 * 2,
  });

  return {
    reviews: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useDeliveryPartnerReviewDetail(id: string) {
  const query = useQuery({
    queryKey: ["deliveryPartner", "reviewDetail", id],
    queryFn: () => deliveryPartnerReviewsService.getReviewById(id),
    staleTime: 1000 * 60 * 2,
    enabled: !!id,
  });

  return {
    review: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
