import React from "react";
import Link from "next/link";
import { CustomerBookingDraft } from "@/types/customer/booking";

interface CheckoutServiceCardProps {
  draft: CustomerBookingDraft;
}

export function CheckoutServiceCard({ draft }: CheckoutServiceCardProps) {
  const service = draft.service;
  const variant = draft.variant;

  return (
    <div className="bg-surface-container rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl space-y-4 relative group">
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-xl">cleaning_services</span>
          <h3 className="font-bold text-base text-on-surface font-headline">Service Details</h3>
        </div>

        <Link
          href={`/customer/booking?serviceId=${draft.serviceId}`}
          className="text-xs font-semibold text-primary hover:underline"
        >
          Edit
        </Link>
      </div>

      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1">
          <p className="font-bold text-sm sm:text-base text-on-surface">
            {service?.name} {variant ? `– ${variant.name}` : ""}
          </p>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {service?.description || "Includes deep wash, disinfection, and protective packaging."}
          </p>
          <div className="pt-1 flex items-center gap-2 text-xs text-on-surface-variant font-mono">
            <span>Qty: {draft.quantity}</span>
            <span>•</span>
            <span>Studio: {draft.provider?.businessName || "Certified Partner"}</span>
          </div>
        </div>

        <span className="text-base sm:text-lg font-bold text-primary font-mono shrink-0">
          ₹{draft.estimatedServiceTotal}
        </span>
      </div>
    </div>
  );
}
