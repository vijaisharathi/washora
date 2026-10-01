"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { checkoutService } from "@/services/checkoutService";
import { offersRewardsService } from "@/services/offersRewardsService";
import { AppliedCoupon } from "@/types/customer/checkout";
import { queryKeys } from "@/lib/query/queryKeys";
import { showError } from "@/lib/ui/toast";

export const CHECKOUT_SUMMARY_KEY = ["customer", "checkout", "summary"] as const;

export function useCheckout() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: CHECKOUT_SUMMARY_KEY,
    queryFn: () => checkoutService.getCheckoutSummary(),
    staleTime: 1000 * 60 * 5,
  });

  const couponMutation = useMutation({
    mutationFn: async ({ code, subtotal }: { code: string; subtotal: number }) => {
      const validated = await checkoutService.validateCoupon(code, subtotal);
      await offersRewardsService.applyCoupon(code, subtotal);
      return validated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHECKOUT_SUMMARY_KEY });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.coupons() });
    },
    onError: (err) => {
      showError(err, "Failed to Apply Coupon");
    },
  });

  const removeCouponMutation = useMutation({
    mutationFn: async () => {
      await offersRewardsService.removeCoupon();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHECKOUT_SUMMARY_KEY });
      queryClient.invalidateQueries({ queryKey: queryKeys.customer.coupons() });
    },
    onError: (err) => {
      showError(err, "Failed to Remove Coupon");
    },
  });

  return {
    summary: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    applyCoupon: couponMutation.mutateAsync,
    isApplyingCoupon: couponMutation.isPending,
    couponError: couponMutation.error,
    removeCoupon: removeCouponMutation.mutateAsync,
    isRemovingCoupon: removeCouponMutation.isPending,
    calculatePricing: (subtotal: number, coupon?: AppliedCoupon) =>
      checkoutService.calculatePricing(subtotal, coupon),
  };
}
