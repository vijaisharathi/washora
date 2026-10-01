import React from "react";
import { CouponItem } from "@/types/customer/offersRewards";
import { CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppliedCouponBannerProps {
  coupon: CouponItem;
  onRemove: () => void;
  isRemoving?: boolean;
}

export function AppliedCouponBanner({
  coupon,
  onRemove,
  isRemoving,
}: AppliedCouponBannerProps) {
  return (
    <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-lg animate-in fade-in duration-200">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <p className="font-mono font-bold text-xs sm:text-sm text-green-400">
            {coupon.code} <span className="text-on-surface font-sans ml-1 text-xs">applied</span>
          </p>
          <p className="text-[11px] text-on-surface-variant truncate">
            {coupon.discountBadge} discount active on your booking.
          </p>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        disabled={isRemoving}
        onClick={onRemove}
        className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 font-bold shrink-0 gap-1"
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span>Remove</span>
      </Button>
    </div>
  );
}
