"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { offersRewardsService } from "@/services/offersRewardsService";
import { queryKeys } from "@/lib/query/queryKeys";
import { showError } from "@/lib/ui/toast";

export function useOffersRewards(cartTotal: number = 502) {
  const queryClient = useQueryClient();

  const offersQuery = useQuery({
    queryKey: queryKeys.customer.offers(),
    queryFn: () => offersRewardsService.getOffers(),
    staleTime: 1000 * 60 * 15,
  });

  const couponsQuery = useQuery({
    queryKey: queryKeys.customer.coupons(),
    queryFn: () => offersRewardsService.getCoupons(),
    staleTime: 1000 * 60 * 15,
  });

  const appliedCouponQuery = useQuery({
    queryKey: ["customer", "appliedCoupon"] as const,
    queryFn: () => offersRewardsService.getAppliedCoupon(),
  });

  const rewardsBalanceQuery = useQuery({
    queryKey: queryKeys.customer.rewards(),
    queryFn: () => offersRewardsService.getRewardsBalance(),
  });

  const redeemableRewardsQuery = useQuery({
    queryKey: ["customer", "redeemableRewards"] as const,
    queryFn: () => offersRewardsService.getRedeemableRewards(),
  });

  const applyMutation = useMutation({
    mutationFn: (code: string) => offersRewardsService.applyCoupon(code, cartTotal),
    onSuccess: (coupon) => {
      queryClient.setQueryData(["customer", "appliedCoupon"], coupon);
    },
    onError: (err) => {
      showError(err, "Failed to Apply Coupon");
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => offersRewardsService.removeCoupon(),
    onSuccess: () => {
      queryClient.setQueryData(["customer", "appliedCoupon"], null);
    },
    onError: (err) => {
      showError(err, "Failed to Remove Coupon");
    },
  });

  const redeemMutation = useMutation({
    mutationFn: (rewardId: string) => offersRewardsService.redeemReward(rewardId),
    onSuccess: (newBalance) => {
      queryClient.setQueryData(queryKeys.customer.rewards(), newBalance);
      queryClient.invalidateQueries({ queryKey: ["customer", "redeemableRewards"] });
    },
    onError: (err) => {
      showError(err, "Failed to Redeem Reward");
    },
  });

  return {
    offers: offersQuery.data || [],
    coupons: couponsQuery.data || [],
    appliedCoupon: appliedCouponQuery.data,
    rewardsBalance: rewardsBalanceQuery.data,
    redeemableRewards: redeemableRewardsQuery.data || [],
    isLoading: offersQuery.isLoading || couponsQuery.isLoading,
    applyCoupon: applyMutation.mutateAsync,
    isApplying: applyMutation.isPending,
    applyError: applyMutation.error?.message,
    removeCoupon: removeMutation.mutateAsync,
    isRemoving: removeMutation.isPending,
    redeemReward: redeemMutation.mutateAsync,
    isRedeeming: redeemMutation.isPending,
  };
}
