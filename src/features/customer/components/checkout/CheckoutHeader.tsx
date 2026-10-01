import React from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, X } from "lucide-react";

export function CheckoutHeader() {
  return (
    <div className="space-y-4 border-b border-white/5 pb-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline tracking-tight">
            Checkout Overview
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Review your order configuration before selecting a payment method.
          </p>
        </div>

        <Link
          href="/customer"
          className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-medium"
        >
          <X className="h-4 w-4" />
          <span>Cancel</span>
        </Link>
      </div>

      {/* 3-Step Progress Breadcrumb matching Stitch anything_clean_checkout_overview */}
      <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
        <span className="flex items-center gap-1 text-primary">
          <CheckCircle2 className="h-4 w-4" />
          <span>Service</span>
        </span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="flex items-center gap-1 text-primary">
          <CheckCircle2 className="h-4 w-4" />
          <span>Schedule</span>
        </span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="flex items-center gap-1 text-on-surface font-bold">
          <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px]">
            3
          </span>
          <span>Review &amp; Pay</span>
        </span>
      </div>
    </div>
  );
}
